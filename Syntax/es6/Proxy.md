> 内置对象，用以拦截和自定义对象的 **基本操作**（如属性读取、赋值、函数调用等）
>
> 是语言级的元编程特性

### **基本语法**

```js
const proxy = new Proxy(target, handler);
```

- target: 要代理的原始对象
- handler: 一个对象，定义拦截操作（如：get、set等）

### **应用场景**

###### 1. 数据验证

```js
const user = {
    name: "Bob",
    age: 21
}
const validator = {
    set(target, props, value) {
        if (prop === 'age' && typeof value !== "number") {
            throw new TypeError("年龄必须是数字")
        }
        target[prop] = value;
        return true;
    }
}
const userProxy = new Proxy(user, validator);
userProxy.age = 30   // ✅ OK
// userProxy.age = "abc" // ❌ 抛出 TypeError
```

###### 2. Vue3 响应式（Reactive）

Vue3 的响应式系统底层核心就是 `Proxy`

```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      console.log(`获取 ${prop}`)
      return Reflect.get(target, prop)
    },
    set(target, prop, value) {
      console.log(`设置 ${prop} = ${value}`)
      return Reflect.set(target, prop, value)
    }
  })
}

const state = reactive({ count: 0 })
state.count++  // 自动拦截并触发响应

```

###### 3. 支持的拦截操作（称为“陷阱” traps）

| 操作                                | 说明                   |
| ----------------------------------- | ---------------------- |
| `get`                               | 读取属性时触发         |
| `set`                               | 写入属性时触发         |
| `has`                               | `in` 操作符触发        |
| `deleteProperty`                    | 删除属性时触发         |
| `ownKeys`                           | `Object.keys()` 时触发 |
| `apply`                             | 调用函数时触发         |
| `construct`                         | `new` 构造函数时触发   |
| `getPrototypeOf` / `setPrototypeOf` | 获取或设置原型时触发   |

### 面试题

###### 1. Proxy和 defineProperty有什么区别

- Proxy 是拦截基本方法，后者是一个基本方法。
- Vue3用的前者，Vue2用的后者，框架应用层面上，
  - defineProperty 即基本方法 `[[DefineOwnProperyu]]` 有一个功能是拦截**现有属性**，Vue2有缺陷，很多东西拦截不到，进一步用的是`原型链`
  - Proxy,可以拦截全面无死角，所以Vue3没有 `$get` 和 `$set`了