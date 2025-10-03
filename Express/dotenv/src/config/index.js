const dotenv = require("dotenv");
const path = require("path");

// 根据 NODE_ENV 加载对应的 .env 文件
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });

const config = {
	env: process.env.NODE_ENV,
	port: process.env.PORT || 3000,
	db: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		pass: process.env.DB_PASS,
	},
};

module.exports = config;
