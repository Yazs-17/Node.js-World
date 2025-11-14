1. 启动服务
   ```js
		node index.js
	 ```

2.	访问：
	•	http://localhost:3000/ → 静态页面或 “Hello from Koa!”
	•	POST /login → 获取 JWT
	•	GET /protected → 需携带 Authorization: Bearer <token>