process.on('message', msg => {
	console.log('子进程收到:', msg);
	process.send({ result: msg.number * 2 });
});