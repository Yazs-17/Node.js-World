const fs = require("fs")
const axios = require('axios')
async function logout () {
	await axios.post("http://localhost:3000/logout");
	// localStorage.removeItem("token"); // 清除本地 token
	fs.writeFileSync("token", '');
	console.log("已退出登录");
}

logout();