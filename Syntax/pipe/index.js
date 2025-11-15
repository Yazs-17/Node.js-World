const fs = require('fs')
const path = require('path')

const fileA = path.join(__dirname, 'a.txt')
const fileB = path.join(__dirname, 'b.txt')

// 读取 a.txt，写入 b.txt
const readStream = fs.createReadStream(fileA);
const writeStream = fs.createWriteStream(fileB);

readStream.pipe(writeStream);

writeStream.on("finish", () => {
	console.log("文件复制完成");
});
