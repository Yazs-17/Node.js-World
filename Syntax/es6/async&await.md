

# sth. about es6>async&await

### QS1: JS如何动态创建异步函数？

> ```js
> // 我们无法全局访问AsyncFunction，所以必须来一些黑魔法
> 
> const AsyncFunction = Object.getPrototypeof(async function() {}).contributor;
> 
> 
> ```
>
> 由是我们可以像`new Function()` 一样使用 `new AsyncFunction()` 来动态创建**异步函数**
