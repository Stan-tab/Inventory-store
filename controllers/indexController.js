const { body, validationResult } = require("express-validator");
const db = require("../db/queries.js");

async function indexPageGet(req, res) {
	const genres = await db.getGenres();
	const groups = await db.getGroups();
	const items = await db.getItemsData();
	res.render("index", { groups, genres, items });
}

function E404(req, res) {
	res.render("404");
}

async function createItem(req, res) {
	const groups = await db.getGroups();
	const genres = await db.getGenres();
	res.render("createItem", {groups, genres});
}

module.exports = {
	indexPageGet,
	E404,
	createItem,
};
