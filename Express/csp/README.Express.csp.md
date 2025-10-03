跨站脚本执行对于 web 应用来说是无法根绝的威胁。如果攻击者可以在你的应用中注入并运行代码，其后果对于你和你的用户来说可能是一场噩梦。有一种能试图阻止在你网页中运行非预期代码的方案：`CSP`（内容安全策略）。

CSP 允许你设定一组规则，以定义你的页面能够加载资源的来源。任何违反规则的资源都会被浏览器自动阻止。

你可以通过修改 `Content-Security-Policy` HTTP header 来指定规则，或者你不能改 header 时也可以使用 meta 标签来设定。

这个 header 类似于这样：

```JS
Content-Security-Policy: default-src 'none';
    script-src 'nonce-XQY ZwBUm/WV9iQ3PwARLw==';
    style-src 'nonce-XQY ZwBUm/WV9iQ3PwARLw==';
    img-src 'self';
    font-src 'nonce-XQY ZwBUm/WV9iQ3PwARLw==' fonts.gstatic.com;
    object-src 'none';
    block-all-mixed-content;
    frame-ancestors 'none';
```

在这个例子中，你可以看到我们只允许从自己的[域名](https://zhida.zhihu.com/search?content_id=4861285&content_type=Article&match_order=1&q=域名&zhida_source=entity)或者 Google Fonts 的 [http://fonts.gstatic.com](https://link.zhihu.com/?target=http%3A//fonts.gstatic.com) 来获取字体；只允许加载本域名下的图片；只允许加载不指定来源，但必须包含指定 `nonce` 值的脚本及样式文件。这个 nonce 值需要用下面这样的方式指定：

```HTML
<script src="myscript.js" nonce="XQY ZwBUm/WV9iQ3PwARLw=="></script>
<link rel="stylesheet" href="mystyles.css" nonce="XQY ZwBUm/WV9iQ3PwARLw==" />
```

当浏览器收到 HTML 时，为了安全起见它会清除所有的 nonce 值，其它的脚本无法得到这个值，也就无法添加进网页中了。

你还可以禁止所有在 HTTPS 页面中包含的 HTTP 混合内容和所有 `<object />` 元素，以及通过设置 `default-src` 为 `none` 来禁用一切不为图片、样式表以及脚本的内容。此外，你还可以通过 `frame-ancestors` 来禁用 iframe。

你可以自己手动去编写这些 header，不过走运的是 Express 中已经有了许多现成的 CSP 解决方案。`f="https://helmetjs.github.io/docs/csp/">helmet 支持 CSP，但 nonce 需要你自己去生成。我个人为此使用了一个名为 express-csp-header 的模块。`

安装及运行 `express-csp-header`：

```SHELL
npm install express-csp-header --save
```

为你的 `index.js` 添加并修改以下内容，启用 CSP：

```js
const express = require('express');
const helmet = require('helmet');
const csp = require('express-csp-header');

const PORT = process.env.PORT || 3000;
const app = express();

const cspMiddleware = csp({
  policies: {
    'default-src': [csp.NONE],
    'script-src': [csp.NONCE],
    'style-src': [csp.NONCE],
    'img-src': [csp.SELF],
    'font-src': [csp.NONCE, 'fonts.gstatic.com'],
    'object-src': [csp.NONE],
    'block-all-mixed-content': true,
    'frame-ancestors': [csp.NONE]
  }
});

app.use(helmet());
app.use(cspMiddleware);

app.get('/', (req, res) => {
  res.send(`
    <h1>Hello World</h1>
    <style nonce=${req.nonce}>
      .blue { background: cornflowerblue; color: white; }
    </style>
    <p class="blue">This should have a blue background because of the loaded styles</p>
    <style>
      .red { background: maroon; color: white; }
    </style>
    <p class="red">This should not have a red background, the styles are not loaded because of the missing nonce.</p>
  `);
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
```

重启服务，访问 [http://localhost:3000](https://link.zhihu.com/?target=http%3A//localhost%3A3000/)，可以看到一个带有蓝色背景的段落，因为相关的样式成功被加载了。而另一个段落没有样式，因为其样式缺少了 nonce 值。

CSP header 还可以设定报告违规的 URL，你还可以在严格启用 CSP 之前仅开启报告模式，收集相关数据。

你可以在 [MDN CSP 介绍](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Security-Policy__by_cnvoid)查看更多信息，并浏览 [“Can I Use” 网站查看 CSP 兼容性](https://link.zhihu.com/?target=http%3A//caniuse.com/%23feat%3Dcontentsecuritypolicy)。大多数主流浏览器都支持这项特性。

---

> 来源：https://zhuanlan.zhihu.com/p/31681483