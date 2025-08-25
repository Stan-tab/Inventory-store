const { Router } = require("express");
const mainController = require("../controllers/indexController.js");

const indexRouter = Router();

indexRouter.get("/", mainController.indexPageGet);
indexRouter.get("/search", (req, res) => {
	console.log(req.query.q);
});
indexRouter.post("/searchBy", (req, res) => {
	console.log(req.body);
});
indexRouter.get("/new", mainController.newGet);
indexRouter.post("/new", mainController.newPost);
indexRouter.all("/{*splat}", mainController.E404);

module.exports = indexRouter;
