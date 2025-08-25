const { body, validationResult, query } = require("express-validator");
const db = require("../db/queries.js");

const message = " should not be empty";

const validateItem = [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Item name" + message),
	body("devs")
		.trim()
		.notEmpty()
		.withMessage("Creators" + message),
	body("group")
		.trim()
		.notEmpty()
		.withMessage("Group" + message),
	body("releaseDate")
		.trim()
		.notEmpty()
		.withMessage("Date" + message),
	body("genres")
		.isArray({ min: 1 })
		.withMessage("You should entrer at least one genre"),
	body("description")
		.isLength({ max: 1000 })
		.withMessage("Description should be less than 1000 char"),
];

async function indexPageGet(req, res) {
	const genres = await db.getGenres();
	const groups = await db.getGroups();
	const items = await db.getItemsData();
	res.render("index", { groups, genres, items });
}

function E404(req, res) {
	res.render("404");
}

async function newGet(req, res) {
	const groups = await db.getGroups();
	const genres = await db.getGenres();
	res.render("createItem", { groups, genres });
}

const newPost = [
	validateItem,
	async (req, res) => {
		const errors = validationResult(req);
		const data = req.body;
		const groups = await db.getGroups();
		const genres = await db.getGenres();
		if (!errors.isEmpty()) {
			return res.status(400).render("createItem", {
				errors: errors.array(),
				groups,
				genres,
				data,
			});
		}
		if (data.genres.filter((el) => !el).length) {
			return res.status(400).render("createItem", {
				errors: [{ msg: "Genres should not be empty" }],
				groups,
				genres,
				data,
			});
		}
		try {
			await db.createItem(data);
			res.redirect("/");
		} catch (e) {
			return res.status(404).render("createItem", {
				errors: [{ msg: e }],
				groups,
				genres,
				data,
			});
		}
	},
];

module.exports = {
	indexPageGet,
	E404,
	newGet,
	newPost,
};
