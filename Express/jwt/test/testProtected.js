const axios = require('axios')
const fs = require('fs')
const token = fs.readFileSync('token').toString() || "no token"
console.log(token.toString())
async function testProtected () {
	try {
		const res = await axios.get("http://localhost:3000/protected",
			{
				headers: {
					authorization: `Bearer ${token}`
				}
			}
		);
		console.log(res.data);
	} catch (err) {
		console.log("Protected error:", err.response?.status);
	}
}

testProtected();