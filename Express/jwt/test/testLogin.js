const axios = require('axios')
const fs = require('fs')

async function login () {
	const res = await axios.post("http://localhost:3000/login", {
		username: "john",
		password: "123456"
	});

	// localStorage.setItem("token", res.data.token); // 保存 token
	// console.log("login token:", res.data.token);
	fs.writeFileSync('token', res.data.token)
}

login();