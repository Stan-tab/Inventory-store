const { body, validationResult } = require("express-validator");
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
		const { errors } = validationResult(req);
		console.log(errors)
		const data = req.body;
		console.log(data);
	},
];

module.exports = {
	indexPageGet,
	E404,
	newGet,
	newPost,
};
