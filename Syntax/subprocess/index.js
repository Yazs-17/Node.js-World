/**
 * 1. child_process.spawn()
 */
const { spawn } = require('child_process')
const ls = spawn('ls', ['-lh', '/usr']);
ls.stdout.on('data', data => {
	// console.log(`stdout: ${data}`)
})
ls.stderr.on('data', data => {
	console.error(`stderr: ${data}`)
})
ls.on('close', code => {
	console.log(`child process exited with code ${code}`)
})

/**
 * 2. child_process.exec()
 */
// 使用shell执行命令，默认情况下缓冲输出，所以不适合处理大量输入输出的情况，用于执行简单的shell命令，并在命令完成后获取标准输出

/**
 * 3. child_process.fork()
 */
// 专用于创建Nodejs子进程，与spawn类似，但其针对Nodejs脚本优化，并允许父子进程建立通信
const { fork } = require('child_process');
const path = require('path')
const filepath = path.join(__dirname, 'child.js');
const child = fork(filepath);

child.on('message', msg => {
	console.log('主进程收到:', msg);
});

child.send({ number: 42 });

