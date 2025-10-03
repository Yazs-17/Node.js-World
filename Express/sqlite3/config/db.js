const sqlite3 = require("sqlite3").verbose();
const { dbFile, env } = require("./index");

// 根据不同环境连接不同数据库
const db = new sqlite3.Database(dbFile, (err) => {
	if (err) {
		console.error(`❌ [${env}] 数据库连接失败:`, err.message);
	} else {
		console.log(`✅ [${env}] 已连接 SQLite 数据库: ${dbFile}`);
	}
});

// 初始化 users 表
db.serialize(() => {
	db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `, (err) => {
		if (err) console.error(`❌ [${env}] 初始化表失败:`, err.message);
	});
});

module.exports = db;
