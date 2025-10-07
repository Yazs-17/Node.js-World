## Description

代码格式化工具

配置`.prettierrc`:

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}

```

> `eslint-config-prettier` 可以让 ESLint 关闭与 Prettier 冲突的规则。
>  一般会配合 `VSCode` 自动保存时格式化。