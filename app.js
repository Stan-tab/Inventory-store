const express = require("express");
const { envPORT } = require("./db/pool.js");
const indexRouter = require("./routers/indexRoute.js");
const path = require("node:path");

const app = express();
const PORT = envPORT || 4000;

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use("/", indexRouter);

app.listen(PORT, () => {
	console.log(`Listening on localhost:${PORT}`);
});
