解构

可以用在赋值与函数变量命名上面

例如：
```js


// First
const [a,b] = [1,2]
const a = {
  b: 1,
  c: 2,
  d: 3
}
const e = { ...a, d:6 }
console.log(e) 




// Second for vue
setup(props, context) {
    const emit = context.emit
}
// <=>
setup(props, { emit }) {
    
}


// Third 
...
```

