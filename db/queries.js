const { pool } = require("./pool.js");

async function getItemsData(name, skip) {
	let data;
	const sql = `
    SELECT groupname, i.id, itemname, description, to_char(release_date, 'DD/MM/YYYY'), devs_name
        FROM groups g LEFT JOIN grouptoitems gi ON g.id=gi.group_id
        LEFT JOIN items i ON i.id=gi.item_id
        LEFT JOIN devstoitems ON i.id = devstoitems.item_id
        LEFT JOIN devs ON devs.id = devstoitems.devs_id`;
	const limit = " LIMIT 10 OFFSET $1;";
	if (name) {
		data = (
			await pool.query(sql + " WHERE LOWER(itemname) LIKE ($2)" + limit, [
				skip || 0,
				name + "%",
			])
		).rows;
	} else {
		data = (await pool.query(sql + limit, [skip || 0])).rows;
	}

	for (let i = 0; i < data.length; i++) {
		data[i].genres = await getGenres(data[i].itemname);
	}
	return data;
}

async function getGenres(itemName) {
	const sql = `
    SELECT genrename FROM items 
    LEFT JOIN itemtogenres ig ON items.id=ig.item_id 
    LEFT JOIN genres ON ig.genre_id=genres.id 
    WHERE items.itemname=$1;
    `;
	const { rows } = await pool.query(sql, [itemName]);
	return rows.map((e) => e.genrename);
}

async function getItemsByGroup(groupName, skip) {
	const rows = await getBy("groupName", groupName, skip);
	return rows;
}

async function getItemsBydevs(name, skip) {
	const rows = await getBy("devs_name", name, skip);
	return rows;
}

async function getItemsByGenres(genres, skip) {
	if (genres.length === 0) {
		return await getItemsData();
	}
	const sql = `
	SELECT groupname, i.id, itemname, description, to_char(release_date, 'DD/MM/YYYY'), devs_name FROM genres 
	LEFT JOIN itemtogenres ig ON genres.id=ig.genre_id
	LEFT JOIN items i ON i.id=ig.item_id
	LEFT JOIN devstoitems ON i.id = devstoitems.item_id
    LEFT JOIN devs ON devs.id = devstoitems.devs_id
	LEFT JOIN grouptoitems gi ON gi.item_id=i.id
	LEFT JOIN groups ON gi.group_id=groups.id
	WHERE LOWER(genrename) IN (${[...Array(genres.length)]
		.map((c, i) => `LOWER($${i + 2})`)
		.join(", ")})
	LIMIT 10 OFFSET $1;
	`;
	try {
		var { rows } = await pool.query(sql, [skip || 0, ...genres]);
	} catch (e) {
		throw new Error(
			`These genres are not valid ${genres.join(", ")} \n ${e}`
		);
	}

	for (let i = 0; i < rows.length; i++) {
		rows[i].genres = await getGenres(rows[i].itemname);
	}
	return rows;
}

async function createItem(itemData) {
	// itemData = { this will be inside of itemdata
	// 	devs,
	// 	name,
	// 	group,
	// 	genres: [],
	// 	releaseDate,
	// 	description,
	// };
	const sqlItems = `
    INSERT INTO items (itemname, release_date, description) 
    VALUES ($1, $2, $3);
    `;
	const sqlDevs = `
    INSERT INTO devs (devs_name) VALUES ($1);
    `;

	const existedDevs = (
		await pool.query("SELECT LOWER(devs_name) AS devs FROM devs;")
	).rows.map((e) => e.devs);

	try {
		await pool.query(sqlItems, [
			itemData.name,
			itemData.releaseDate,
			itemData.description,
		]);
	} catch (e) {
		throw new Error(
			`Similar name already exists: ${itemData.name} \n ${e}`
		);
	}

	if (!existedDevs.includes(itemData.devs.toLowerCase())) {
		await pool.query(sqlDevs, [itemData.devs]);
	}

	await connectTables(
		"devsToItems",
		"devs_id",
		"item_id",
		"devs",
		"items",
		"devs_name",
		"itemname",
		itemData.devs,
		itemData.name
	);
	await connectTables(
		"groupToItems",
		"group_id",
		"item_id",
		"groups",
		"items",
		"groupname",
		"itemName",
		itemData.group,
		itemData.name
	);

	const insertedGenres = (
		await pool.query("SELECT LOWER(genrename) AS gn FROM genres;")
	).rows.map((e) => e.gn);

	for (let i = 0; i < itemData.genres.length; i++) {
		const genre = itemData.genres[i];
		if (!insertedGenres.includes(genre.toLowerCase())) {
			await createGenre(genre);
		}
		await connectTables(
			"itemToGenres",
			"item_id",
			"genre_id",
			"items",
			"genres",
			"itemName",
			"genreName",
			itemData.name,
			genre
		);
	}
}

async function createGenre(name) {
	try {
		const sql = `INSERT INTO genres (genrename) VALUES ($1);`;
		await pool.query(sql, [name]);
	} catch (e) {
		throw new Error(`This tag already exists:${name} \n ${e}`);
	}
}

async function connectTables(
	tableName,
	id1,
	id2,
	conTable1,
	conTable2,
	takedValue1,
	takedValue2,
	value1,
	value2
) {
	try {
		const sql = `
        INSERT INTO ${tableName} (${id1}, ${id2})
        VALUES
            ( 
              (SELECT id FROM ${conTable1} WHERE LOWER(${takedValue1})=$1),
              (SELECT id FROM ${conTable2} WHERE LOWER(${takedValue2})=$2)
            );
        `;

		await pool.query(sql, [value1.toLowerCase(), value2.toLowerCase()]);
	} catch (e) {
		throw new Error(
			`This values can not be connected ${value1} and ${value2} \n ${e}`
		);
	}
}

async function createGroup(name) {
	const sql = `INSERT INTO groups (groupName) VALUES ($1);`;
	await pool.query(sql, [name]);
}

async function deleteItem(itemId) {
	const sql = [
		"DELETE FROM devstoitems WHERE item_id=$1;",
		"DELETE FROM itemtogenres WHERE item_id=$1;",
		"DELETE FROM grouptoitems WHERE item_id=$1;",
		"DELETE FROM itemtogenres WHERE item_id=$1;",
		"DELETE FROM items WHERE id=$1;",
	];
	await deletor(sql, itemId);
}

async function deleteDevs(name) {
	const sql = [
		"DELETE FROM devstoitems WHERE devs_id=(SELECT id FROM devs WHERE devs_name=$1);",
		"DELETE FROM devs WHERE devs_name=$1;",
	];
	await deletor(sql, name);
}

async function deleteGroups(name) {
	const { rows } = await pool.query(
		`
	SELECT itemname FROM items 
	WHERE id = ANY(
		SELECT item_id FROM groups g 
		LEFT JOIN grouptoitems gi ON g.id=gi.group_id WHERE g.groupname=$1);	
		`,
		[name]
	);
	rows.forEach(async (e) => {
		await deleteItem(e.id);
	});

	const sql = [
		"DELETE FROM grouptoitems WHERE group_id=(SELECT id FROM groups WHERE groupname=$1);",
		"DELETE FROM groups WHERE groupname=$1;",
	];
	await deletor(sql, name);
}

async function deletor(querys, value) {
	try {
		for (let i = 0; i < querys.length; i++) {
			await pool.query(querys[i], [value]);
		}
	} catch (e) {
		throw new Error(`Failed to delete ${value} \n ${e}`);
	}
}

async function getBy(comparator, value, skip) {
	try {
		var { rows } = await pool.query(
			`
				SELECT groupname, i.id, itemname, description, to_char(release_date, 'DD/MM/YYYY'), devs_name
        		FROM groups g LEFT JOIN grouptoitems gi ON g.id=gi.group_id
        		LEFT JOIN items i ON i.id=gi.item_id
        		LEFT JOIN devstoitems ON i.id = devstoitems.item_id
        		LEFT JOIN devs ON devs.id = devstoitems.devs_id
				WHERE ${comparator}=$1 LIMIT 10 OFFSET $2;
			`,
			[value, skip || 0]
		);
	} catch (e) {
		throw new Error(`Sorting by ${comparator} is not possible \n ${e}`);
	}
	return rows;
}

module.exports = {
	createItem,
	createGroup,
	createGenre,
	getItemsData,
	getGenres,
	deleteItem,
	deleteDevs,
	deleteGroups,
	getItemsByGroup,
	getItemsBydevs,
	getItemsByGenres,
};
