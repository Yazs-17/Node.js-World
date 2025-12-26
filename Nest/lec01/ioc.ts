class A {
  name: string
  constructor(name: string) {
    this.name = name
  }
}

class C {
  name: string
  constructor(name: string) {
    this.name = name
  }
}
class Container {
  moduleList: any
  constructor() {
    this.moduleList = {}
  }
  provide (key: string, module: any) {
    this.moduleList[key] = module
  }
  get (key: string) {
    return this.moduleList[key]
  }
}

const container = new Container()
container.provide('A', new A('hello A'))
container.provide('C', new C('hello C'))

class B {
  a: any
  c: any
  constructor (module: Container) {
    this.a = module.get('A')
    this.c = module.get('C')
  }
}

// test
const b = new B(container)
console.log(b.a.name) // hello A
console.log(b.c.name) // hello C


// 与发布订阅模式还蛮像