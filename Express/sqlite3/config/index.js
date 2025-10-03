const path = require("path");
const dotenv = require("dotenv");

// 根据 NODE_ENV 加载对应的 .env 文件
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

const config = {
	env,
	port: process.env.PORT || 3000,
	dbFile: path.resolve(process.cwd(), process.env.DB_FILE || "./db/dev.sqlite")
};

module.exports = config;
