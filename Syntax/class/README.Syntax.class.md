[TOC]

## JS的 `class` 是一种语法糖（对机制的包装）

class = 构造函数(constructor function) + 原型(prototype)机制

核心同c++&java：类和继承

## 构造函数

js中的构造函数有点特殊，当new一个函数（约定大写字母开头，区分普通函数），这个函数就作为构造函数执行

构造函数的作用是创建一个新对象，并将这个对象的原型指向构造函数的prototype属性，然后将构造函数内部的this绑定到新创建的对象，接着执行构造函数内部的代码，最后返回这个新对象（除非构造函数返回另一个对象）

例如：
```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 在构造函数的原型上添加方法
Person.prototype.sayHello = function() {
  console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
};

// 使用new关键字创建Person的实例
const person1 = new Person('Alice', 25);
const person2 = new Person('Bob', 30);

person1.sayHello(); // 输出: Hello, my name is Alice and I am 25 years old.
person2.sayHello(); // 输出: Hello, my name is Bob and I am 30 years old
```

在这个例子中，`Person`就是一个构造函数。当我们使用`new Person(...)`时，会发生以下几步：

1. 创建一个新的空对象。
2. 将这个空对象的原型指向`Person.prototype`。
3. 将构造函数内部的`this`绑定到这个新对象。
4. 执行构造函数内部的代码（即给`this`添加属性）。
5. 如果构造函数没有返回其他对象，则返回这个新对象。

需要注意的是，如果我们在构造函数中显式返回一个对象，那么`new`表达式会返回那个对象，而不是新创建的对象。如果返回的是非对象类型（如字符串、数字等），则忽略返回值，仍然返回新创建的对象。

例如：

```js
function Car(brand) {
  this.brand = brand;
  return { brand: 'Toyota' }; // 返回一个对象
}

const myCar = new Car('Honda');
console.log(myCar.brand); // 输出: Toyota

function Bike(brand) {
  this.brand = brand;
  return 42; // 返回一个非对象值，会被忽略
}

const myBike = new Bike('Yamaha');
console.log(myBike.brand); // 输出: Yamaha
```

## ES6中的class

```js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  sayHello() {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
  }
}

const person = new Person('Alice', 25);
person.sayHello();
```

在这个例子中，`class Person`中的`constructor`方法就是构造函数。