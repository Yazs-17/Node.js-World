### Description

一顶给网站戴的安全帽子

## Installation

`npm install helmet --save`

## Usage

```js
...
const helmet = require('helmet');
...
app.use(helmet());
```

## Function

**在web应用中设置HTTP header, 显著提升应用的安全性**, 
测试命令：`curl http://localhost:<PORT> -i` (其中`-i` 可以用 `--include` 代替)

## Testing

网络安全性测试：https://securityheaders.com/

## Some Headers

**X-DNS-Prefetch-Control**: 默认off，打开预加载提升图片加载速度，打开方式

```js
...
app.use(helmet({
	dnsPrefetchControl: { allow: true },
}))
...
```

**X-Frame-Options**: 控制页面是否可以在`<frame/>`、`<iframe>`或者 `<object/>`之类的页框加载，一般要关闭，

```js
app.use(helmet({
  frameguard: {
    action: 'deny'
  }
}));
```

**Strict-Transport-Security**: 称作`HSTS`(严格安全 HTTP 传输)，用以确保访问HTTPS 网站时不出现协议降级（回到HTTP）的情况，如果用户一旦访问了带有此 header 的 HTTPS 网站，浏览器就会确保将来再次访问次网站时不允许使用 HTTP 进行通信。此功能有助于防范中间人攻击。
例如：有时，当你使用公共 WiFi 时尝试访问 [https://google.com](https://link.zhihu.com/?target=https%3A//google.com/) 之类的门户网页时就能看到此功能运作。WiFi 尝试将你重定向到他们的门户网站去，但你曾经通过 HTTPS 访问过 `google.com`，且它带有 `Strict-Transport-Security` 的 header，因此浏览器将阻止重定向。
你可以访问 [MDN](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/zh-CN/docs/Security/HTTP_Strict_Transport_Security) 或者 [OWASP wiki](https://link.zhihu.com/?target=https%3A//www.owasp.org/index.php/HTTP_Strict_Transport_Security_Cheat_Sheet) 查看更多相关信息。

**X-Download-Options**: 这个 header 仅用于保护你的应用免受老版 IE 漏洞的困扰。一般来说，如果你部署了不能被信任的 HTTP 文件用于下载，用户可以直接打开这些文件（而不需要先保存到硬盘去）并且可以直接在你 app 的上下文中执行。这个 header 可以确保用户在访问这种文件前必须将其下载到本地，这样就能防止这些文件在你 app 的上下文中执行了。
你可以访问 [helmet 文档](https://link.zhihu.com/?target=https%3A//helmetjs.github.io/docs/ienoopen/)和 [MSDN 博文](https://link.zhihu.com/?target=https%3A//blogs.msdn.microsoft.com/ie/2008/07/02/ie8-security-part-v-comprehensive-protection/)查看更多相关信息。

**X-Content-Type-Options**: 一些浏览器不使用服务器发送的 `Content-Type` 来判断文件类型，而使用“MIME 嗅探”，根据文件内容来判断内容类型并基于此执行文件。
假设你在网页中提供了一个上传图片的途径，但攻击者上传了一些内容为 HTML 代码的图片文件，如果浏览器使用 MIME 嗅探则会将其作为 HTML 代码执行，攻击者就能执行成功的 XSS 攻击了。
通过设置 header 为 `nosniff` 可以禁用这种 MIME 嗅探。

**X-XSS-Protection**: 此 header 能在用户浏览器中开启基本的 XSS 防御。它不能避免一切 XSS 攻击，但它可以防范基本的 XSS。例如，如果浏览器检测到查询字符串中包含类似 `<script>` 标签之类的内容，则会阻止这种疑似 XSS 攻击代码的执行。这个 header 可以设置三种不同的值：`0`、`1` 和 `1; mode=block`。如果你想了解更多关于如何选择模式的知识，请查看 `X-XSS-Protection 及其潜在危害 一文。`

---

以上只是 `helmet` 提供的默认设置。除此之外，它还可以让你设置 `Expect-CT`、`Public-Key-Pins`、`Cache-Control` 和 `Referrer-Policy` 之类的 header。你可以在 [`helmet 文档`](https://helmetjs.github.io/docs/) 中查找更多相关配置。
