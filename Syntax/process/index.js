// global object, no require, use it directly everywhere
// 1. process.argv
// use `node index.js args1 args2`
// console.log(process.argv)

// 2. process.env
// bash> export NODE_ENV=production
// code> console.log(process.env.NODE_ENV)

// 3. process.exit()

// 4. process.cwd() 返回当前工作目录而非脚本目录

// 5. process.memoryUsage()
// 返回对象，包含Node.js 进程的内存使用情况，属性有rss、heapTotal、heapUsed、external等

// 6. process.nextTick(callback);
// 将回调函数推迟到下一次事件循环时执行，相比于setImmediate，其优先级更高
// 注意大量使用将回·阻塞I/O操作