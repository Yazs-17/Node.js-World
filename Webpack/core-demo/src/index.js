const getData = require("./data");
require("./index.css");
const imageSrc = require("../asset/images/index.png");
require("./test/date/printDate");

const img = document.createElement("img");
img.src = imageSrc;
document.body.appendChild(img);
const h1 = document.createElement("h1");
h1.textContent = "Fruit List";
document.body.appendChild(h1);
const ul = document.createElement("ul");
const data = getData();
data.forEach(item => {
	const li = document.createElement("li");
	li.textContent = item;
	ul.appendChild(li);
})

document.body.appendChild(ul);