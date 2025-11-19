# Node.js 中的模块加载机制
- CommonJs
 1. 路径解析， node_modules 目录中查找目标模块，沿着目录树向上搜索，直到找到目标模块或根目录
 2. 文件类别识别，js, json, c++扩展
 3. 编译 使用V8引擎
 4. 缓存
- support for ESM

# Async Hooks 

1. Node.js 核心模块， 允许监视Node.js异步资源的生命周期
   1. 追踪  