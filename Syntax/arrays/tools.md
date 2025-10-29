# Some Tools for Arrays

## filter

作用：遍历数组，把谓词函数返回 true 的元素保留下来，返回一个“压缩后”的新数组（原数组不变）。

```js
arr.filter((value, index, array) => boolean, thisArg?)
```

注意：其会跳过稀疏数组的空槽（callback不会被调用），最终结果不会保留空槽——返回的是紧凑数组
[稀疏数组判断](https://github.com/Yazs-17/Developer-Interview-Collection/blob/main/Frontend/baselines/%E7%AE%97%E6%B3%95%E9%A2%98%E7%9B%B8%E5%85%B3.md##1.%20JS%E7%A8%80%E7%96%8F%E6%95%B0%E7%BB%84%E5%88%A4%E6%96%AD%3Cempty%20item%3E)

## map

作用：对数组每项执行变换，返回与原数组“等长”的新数组（保留索引位置），不改变原数组

```js
arr.map((value, index, array) => newValue, thisArg?)
```

## reduce

作用：把数组缩减为单个值（累加、聚合、分组等）。

```js
arr.reduce((accumulator, currentValue, index, array) => newAccumulator, initialValue?)
```

