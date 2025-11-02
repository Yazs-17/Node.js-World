## Description

> Promise 是一个状态容器（对象），用来管理异步操作的结果

Promise是标准JS语法，写在这里的目的是补充。





## Usage

作用：

1. 简化代码，避免回调地狱

2. 代码清晰，(Promise + async/await)
   ```js
   function cook() {
     return new Promise(resolve => setTimeout(() => resolve("饭好了"), 2000));
   }
   
   async function eat() {
     console.log("开始做饭...");
     let result = await cook();
     console.log(result);
     console.log("开始吃饭！");
   }
   
   eat();
   
   ```

   



## Folk understanding

你点了一份外卖，类比程序里的异步操作：

1. 你下单后（发出请求），
2. 商家开始做菜（执行一个耗时操作），
3. 你并不会一直盯着外卖（程序不会“卡死”），
4. 等菜做好、外卖到了，你再去吃（拿到结果）

这个“我保证菜一定会来”的承诺，就是 **Promise** —— 它**承诺**未来某个时间会返回结果。

## Test

```js
// test for folk understanding
let order = new Promise((resolve, reject) => {
  console.log("下单成功，开始做饭...");
  
  setTimeout(() => {
    let success = true;
    if (success) {
      resolve("饭好了，开始吃！");
    } else {
      reject("厨师罢工了，吃不上饭！");
    }
  }, 2000);
});

order.then(result => {
  console.log(result); // 饭好了，开始吃！
}).catch(error => {
  console.log(error);
});

```



## If us:

没有Promise，那么对`Test` 里的例子，估计就得写：
```js
cook(() => {
  deliver(() => {
    eat(() => {
      console.log("终于吃完了！");
    });
  });
});// 回调地狱
```

