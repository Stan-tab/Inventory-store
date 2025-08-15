const { Router } = require("express");
const mainController = require("../controllers/indexController.js");

const indexRouter = Router();

indexRouter.get("/", mainController.indexPageGet);
indexRouter.all("/{*splat}", (req, res) => {
	res.send("UWU");
});

module.exports = indexRouter;
