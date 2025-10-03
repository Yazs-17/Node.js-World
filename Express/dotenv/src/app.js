const express = require("express");
const config = require("./config");

const app = express();

app.get("/", (req, res) => {
	res.send(
		`Hello from ${config.env} on port ${config.port}, db user = ${config.db.user}`
	);
});

module.exports = app;
