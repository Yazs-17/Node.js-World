const express = require("express");
const config = require("./config");
const db = require("./config/db");

const app = express();
app.use(express.json());

// 添加用户
app.post("/users", (req, res) => {
	const { name } = req.body;
	db.run("INSERT INTO users (name) VALUES (?)", [name], function (err) {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: this.lastID, name });
	});
});

// 获取用户列表
app.get("/users", (req, res) => {
	db.all("SELECT * FROM users", [], (err, rows) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(rows);
	});
});

app.listen(config.port, () => {
	console.log(`🚀 Server running on http://localhost:${config.port} [${config.env}]`);
});
