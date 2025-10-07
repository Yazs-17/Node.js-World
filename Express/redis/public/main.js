const API_BASE = "http://localhost:3000/api";

async function checkStatus () {
	const res = await fetch(`${API_BASE}/me`, { credentials: "include" });
	const data = await res.json();
	if (data.loggedIn) {
		document.getElementById("login-form").style.display = "none";
		document.getElementById("logout-section").style.display = "block";
		document.getElementById("user").textContent = data.user.username;
	} else {
		document.getElementById("login-form").style.display = "block";
		document.getElementById("logout-section").style.display = "none";
	}
}

async function login () {
	const username = document.getElementById("username").value.trim();
	const password = document.getElementById("password").value.trim();
	const res = await fetch(`${API_BASE}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ username, password })
	});
	const data = await res.json();
	alert(data.message);
	checkStatus();
}

async function logout () {
	await fetch(`${API_BASE}/logout`, {
		method: "POST",
		credentials: "include"
	});
	checkStatus();
}

checkStatus();
