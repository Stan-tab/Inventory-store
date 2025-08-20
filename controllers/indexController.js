const { body, validationResult } = require("express-validator");
const db = require("../db/queries.js");

function indexPageGet(req, res) {
	res.render("index");
}

function E404(req, res) {
	res.render("404");
}

module.exports = {
	indexPageGet,
	E404,
};
