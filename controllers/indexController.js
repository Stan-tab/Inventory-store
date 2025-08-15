const { body, validationResult } = require("express-validator");
const db = require("../db/queries.js");

function indexPageGet(req, res) {
	res.render("index");
}

module.exports = {
	indexPageGet,
};
