// 1. 创建
const buf1 = Buffer.alloc(10);
const buf2 = Buffer.from('Hello World!');
// 2. 读写
buf1.write('hello');
// console.log(buf1.toString('utf8', 0, 5));
// 3. 与流结合
const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, 'exam.txt')
const readStream = fs.createReadStream(filepath);// 相对工作区目录
readStream.on('data', (chunk) => {
	// console.logx(`received ${chunk.length} bytes of data`);
})
// 4. 编码结合
const buf = Buffer.from('Hello World');
console.log(buf.toString('base64'));