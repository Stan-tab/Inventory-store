const env = require("dotenv");
const { Pool } = require("pg");

env.config({ path: "./main.env" });

const pool = new Pool({
	connectionString: process.env.sql,
});

module.exports = {
	pool,
	envPORT: process.env.PORT,
};
