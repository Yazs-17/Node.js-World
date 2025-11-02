### 1. 事情要从回调地狱说起

在回调函数中嵌套回调

> 实际就是异步问题，你必须在回调函数里获取值


### 2. 基本使用

Promise，首字母大写，是一个构造函数，可以实例化

> 语法

```
new Promise((resolve, reject) => {})
```

> 调试

直接用`console.dir()`

> Promise 实例

Promise 实例有两个属性
- state：状态
- result：结果
> Promise 状态属性

pending（准备、待解决、进行中）
fulfilled（已完成，成功）
rejected（已拒绝，失败）

> Promise 改变状态

通过resolve()和reject()

```js
const p = new Promise((resolve, reject) => {
	resolve();// 调用函数，使当前promise对象状态改为fulfilled
})
console.dir(p)
```


```js
const p = new Promise((resolve, reject) => {
	reject();// 调用函数，使当前promise对象状态改为rejected
})
console.dir(p)
```

Promise 的状态改变是一次性的，改变之后无法再改
> Promise结果属性
```js
const p = new Promise((resolve, reject) => {
	resolve('成功的结果');// 调用函数，传递参数，改变当前promise对象的结果
	
	// reject('失败的结果');
})
console.dir(p)
```

> Promise的方法以及如何使用

查看__proto__原型知道其方法

> **then**
```js
const p = new Promise((resolve, reject) => {
	resolve('成功的结果');// 调用函数，传递参数，改变当前promise对象的结果
	
	// reject('失败的结果');
})

/**
* @return: Promise, 便于链式调用，状态是pending
*/
const t = p.then((value) => {
	// 当promise状态是fulfilled，执行
	// value 为resolve的传值
	console.log('成功时调用: ', value)
}, (error) => {
	// 当promise状态是rejected时，执行
	// error 为reject的传值
	console.log('失败时调用')
})
console.dir(p)
```

**请问代码执行到console.dir(p)的时候t的状态是什么？**
注意，是pending。

**Promise状态为pending时，then里的方法不会执行**

**那么如何链式调用then呢**
问题等价于如何改变then返回Promise的状态
只需要在then方法里==return==就行，改成fulfilled
如果要改为rejected，如果then方法里出错。
PS：then方法 <=> .then(==(val)=>{},(val)=>{}==)


> catch方法
```js
const p = new Promise((resolve, reject) => {
	throw new Error("error");
	reject("error");
	console.log(error); 
})
p.catch((reason) => {
	console.log('失败: ', reason)
})
console.dir(p)
```
**执行时机**
	Promise执行体里代码出错、抛出（new Error("错❌")）或者Promise状态改为rejected

### 3. 基本模板

```js
new Promise((resolve, reject) => {
	
}).then((value) => {
	
}).catch((reason) => {

})

```

### 4. 基本使用

```js
const getData = (url, data = {}) => {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: 'GET',
			url: url,
			data: data,
			success: (res) => {
				resolve(res)
			},
			error: (res) => {
				reject(res)
			}
		})
	})
}

getData('<url1>')
	.then((value) => {
		const {id} = value;
		return getData('<url2>', {id})
	})
	.then((value) => {
		const {username} = value;
		return getData('<url3>', {username})
	})
	.then((data) => {
		console.log(data)
	})
```