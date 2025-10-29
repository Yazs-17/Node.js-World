> 独一无二的值


1）用作对象属性名：确保属性名称等唯一性
2）防止属性冲突：避免不同模块不同库之间发生属性命名冲突
3）内置Symbol
4）全局注册表
5）迭代器和生成器

实践：
1）
```js
let mySymbol = Symbol('mySymbol');
let obj = {
	[mySymbol]: 'value',
	visible: 'vis'
}
console.log(obj[mySymbol])

console.log(Object.keys(obj))
```

2)防止属性冲突
由于每个Symbol值都是唯一的，不同的模块可以使用不同的Symbol作为属性名称
```js
// comp1.js
export const mySymbol = Symbol('mySymbol')
// comp2.js
import { mySymbol } from "./comp1.js"
const obj = {
	[mySymbol]: 'value' // 是一个唯一的属性
}
```

3)内置Symbol
ES6 引入，如：
`Symbol.iteraor`,为每个对象定义了默认的迭代器，该迭代器可以被`for...of`循环使用
`Symbol.match`, 指定了匹配的是正则表达式而不是字符串
`Symbol.species`，是每个函数值属性，其被构造函数用以创建派生对象
`Symbol.toPrimitive`, 用以将对象转换为基本值（如数字、字符串或者布尔值）

4) 全局注册表
`Symbol.for`

5)迭代器和生成器
Symbol 可以用于自定义对象的迭代行为，如Symbol.iterator，可以在任意对象上实现遍历数据能力
```js
let obj = {
	[Symbol.iterator]: function* () {
		yield 1;
		yield 2;
		yield 3;
	}
}
for (let val of obj) {
	console.log(val)
}
```