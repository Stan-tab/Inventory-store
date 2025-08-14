const { pool } = require("./pool.js");

async function getItemData() {
	const sql = `
    SELECT groupname, itemname, to_char(release_date, 'DD/MM/YYYY'), devs_name
        FROM groups g LEFT JOIN grouptoitems gi ON g.id=gi.group_id
        LEFT JOIN items i ON i.id=gi.item_id
        LEFT JOIN devstoitems ON i.id = devstoitems.item_id
        LEFT JOIN devs ON devs.id = devstoitems.devs_id;
    `;
	const { rows } = await pool.query(sql);
	return rows;
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

async function createItem(itemData) {
	const sqlItems = `
    INSERT INTO items (itemname, release_date, description) 
    VALUES ($1, $2, $3);
    `;
	const sqlDevs = `
    INSERT INTO devs (devs_name) VALUES ($1);
    `;

	const sqlDevsToItems = `
    INSERT INTO devsToItems (devs_id, item_id) VALUES
    (
        (SELECT id FROM devs WHERE devs_name=$1),
        (SELECT id FROM items WHERE itemName=$2)
    );
    `;

	const sqlGroupToItems = `
    INSERT INTO groupToItems (group_id, item_id) VALUES
    (
      (SELECT id FROM groups WHERE groupName=$1),
      (SELECT id FROM items WHERE itemName=$2)
    );
    `;

	const sqlItemToGenres = `
    INSERT INTO itemToGenres (item_id, genre_id)
    VALUES
    ( 
      (SELECT id FROM items WHERE itemName=$1),
      (SELECT id FROM genres WHERE genreName=$2)
    ),
    `;

	await pool.query(sqlItems, [
		itemData.name,
		itemData.releaseDate,
		itemData.description,
	]);
	await pool.query(sqlDevs, [itemData.devs]);
	await pool.query(sqlDevsToItems, [itemData.name, itemData.devs]);
	await pool.query(sqlGroupToItems, [itemData.group, itemData.name]);

	for (let i = 0; i < itemData.genres.length; i++) {
		const genre = itemData.genres[i];
		await pool.query(sqlItemToGenres, [itemData.name, genre]);
	}
}

(async () => {
	console.log(await getItemData("Hotline Miami"));
})();
