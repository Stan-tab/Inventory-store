const { Router } = require("express");
const mainController = require("../controllers/indexController.js");

const indexRouter = Router();

indexRouter.get("/", mainController.indexPageGet);
indexRouter.all("/{*splat}", mainController.E404);

module.exports = indexRouter;
