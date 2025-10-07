## Description

Facebook出品的Js测试框架，用于单元测试和集成测试

## Usage

###### Easy Demo

在 `package.json` 中添加：

```
"scripts": {
  "test": "jest"
}
```

新建测试文件 `sum.test.js`：

```
const sum = (a, b) => a + b;

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

运行：

```
npx jest
```

## Installation

## Test

