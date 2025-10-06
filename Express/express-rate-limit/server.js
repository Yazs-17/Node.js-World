import express from 'express';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// 解析JSON
app.use(express.json());

// =============== 基础限流配置 ===============
const basicLimiter = rateLimit({
	windowMs: 1 * 60 * 1000,  // 1分钟
	max: 5,                   // 每分钟最多5次请求
	message: {
		error: '请求过于频繁，请稍后再试',
		retryAfter: '1分钟后重试'
	},
	standardHeaders: true,    // 返回标准的 `RateLimit-*` headers
	legacyHeaders: false,     // 禁用 `X-RateLimit-*` headers
});

// =============== 严格限流配置 ===============
const strictLimiter = rateLimit({
	windowMs: 30 * 1000,      // 30秒
	max: 2,                   // 每30秒最多2次请求
	message: {
		error: '严格限流区域：请求过多',
		limit: 2,
		windowMs: 30000,
		retryAfter: 30
	},
	// 自定义响应
	handler: (req, res) => {
		res.status(429).json({
			success: false,
			error: '🚫 触发严格限流！',
			message: '您的请求过于频繁，请等待30秒后重试',
			remainingTime: '30秒',
			tips: '刷新页面查看剩余时间'
		});
	}
});

// =============== 宽松限流配置 ===============
const relaxedLimiter = rateLimit({
	windowMs: 2 * 60 * 1000,  // 2分钟
	max: 20,                  // 每2分钟最多20次请求
	message: {
		error: '宽松限流：请求稍多',
		retryAfter: '2分钟后重试'
	}
});

// =============== 渐进限流配置 ===============
const progressiveLimiter = rateLimit({
	windowMs: 1 * 60 * 1000,  // 1分钟
	max: 10,                  // 每分钟最多10次请求
	message: (req, res) => {
		const remaining = res.getHeader('RateLimit-Remaining') || 0;
		const resetTime = new Date(Date.now() + res.getHeader('RateLimit-Reset') * 1000);

		return {
			error: '🔄 渐进限流触发',
			remaining: remaining,
			resetTime: resetTime.toLocaleTimeString(),
			message: remaining > 5 ? '请求正常' : remaining > 2 ? '请求较频繁' : '即将触发限流'
		};
	}
});

// =============== 主页 - 测试控制台 ===============
app.get('/', (req, res) => {
	res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Express Rate Limit Demo</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .test-button { 
          display: inline-block; margin: 10px; padding: 12px 20px; 
          background: #007bff; color: white; text-decoration: none; 
          border-radius: 5px; border: none; cursor: pointer; font-size: 14px;
        }
        .test-button:hover { background: #0056b3; }
        .basic { background: #28a745; }
        .strict { background: #dc3545; }
        .relaxed { background: #17a2b8; }
        .progressive { background: #ffc107; color: #000; }
        .result { 
          margin: 20px 0; padding: 15px; border-radius: 5px; 
          background: #f8f9fa; border-left: 4px solid #007bff; 
          min-height: 50px; font-family: monospace;
        }
        .counter { font-weight: bold; color: #007bff; }
        h1 { color: #333; text-align: center; }
        h2 { color: #666; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 3px; font-size: 12px; margin-left: 10px; }
        .success { background: #d4edda; color: #155724; }
        .warning { background: #fff3cd; color: #856404; }
        .danger { background: #f8d7da; color: #721c24; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚦 Express Rate Limit 实验室</h1>
        
        <div class="info">
          <strong>📖 实验说明：</strong><br>
          点击不同的测试按钮，观察限流效果。打开浏览器控制台查看详细响应信息。
        </div>

        <h2>🧪 测试区域</h2>
        
        <div>
          <button class="test-button basic" onclick="testEndpoint('/basic')">
            基础限流 <span class="status success">5次/分钟</span>
          </button>
          <button class="test-button strict" onclick="testEndpoint('/strict')">
            严格限流 <span class="status danger">2次/30秒</span>
          </button>
          <button class="test-button relaxed" onclick="testEndpoint('/relaxed')">
            宽松限流 <span class="status success">20次/2分钟</span>
          </button>
          <button class="test-button progressive" onclick="testEndpoint('/progressive')">
            渐进限流 <span class="status warning">10次/分钟</span>
          </button>
        </div>

        <div>
          <button class="test-button" onclick="testEndpoint('/no-limit')" style="background: #6c757d;">
            无限流测试 <span class="status">无限制</span>
          </button>
          <button class="test-button" onclick="resetCounters()" style="background: #6f42c1;">
            🔄 重置计数器
          </button>
        </div>

        <h2>📊 实验结果</h2>
        <div id="result" class="result">
          <p>👋 点击上方按钮开始测试...</p>
        </div>

        <div class="info">
          <strong>💡 观察要点：</strong><br>
          • 响应状态码：200 (成功) vs 429 (限流)<br>
          • 响应头信息：RateLimit-Remaining, RateLimit-Reset<br>
          • 不同策略的限流表现和用户体验
        </div>
      </div>

      <script>
        let requestCount = { basic: 0, strict: 0, relaxed: 0, progressive: 0, noLimit: 0 };

        async function testEndpoint(endpoint) {
          const type = endpoint.replace('/', '');
          requestCount[type === 'no-limit' ? 'noLimit' : type]++;
          
          try {
            const response = await fetch(endpoint, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
            displayResult({
              endpoint,
              status: response.status,
              data,
              headers: {
                remaining: response.headers.get('RateLimit-Remaining'),
                reset: response.headers.get('RateLimit-Reset'),
                limit: response.headers.get('RateLimit-Limit')
              },
              count: requestCount[type === 'no-limit' ? 'noLimit' : type]
            });
            
          } catch (error) {
            displayResult({
              endpoint,
              status: 'ERROR',
              data: { error: error.message },
              count: requestCount[type === 'no-limit' ? 'noLimit' : type]
            });
          }
        }

        function displayResult({ endpoint, status, data, headers, count }) {
          const resultDiv = document.getElementById('result');
          const statusClass = status === 200 ? 'success' : status === 429 ? 'danger' : 'warning';
          const timestamp = new Date().toLocaleTimeString();
          
          resultDiv.innerHTML = \`
            <div>
              <strong>🔗 测试端点：</strong> \${endpoint} 
              <span class="status \${statusClass}">第\${count}次请求</span>
            </div>
            <div><strong>📅 时间：</strong> \${timestamp}</div>
            <div><strong>📊 状态码：</strong> <span class="status \${statusClass}">\${status}</span></div>
            \${headers.remaining !== null ? \`<div><strong>🔢 剩余请求：</strong> \${headers.remaining}/\${headers.limit}</div>\` : ''}
            \${headers.reset ? \`<div><strong>⏰ 重置时间：</strong> \${new Date(Date.now() + headers.reset * 1000).toLocaleTimeString()}</div>\` : ''}
            <div><strong>📝 响应内容：</strong></div>
            <pre style="background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto;">\${JSON.stringify(data, null, 2)}</pre>
          \`;
        }

        function resetCounters() {
          requestCount = { basic: 0, strict: 0, relaxed: 0, progressive: 0, noLimit: 0 };
          document.getElementById('result').innerHTML = '<p>🔄 计数器已重置，开始新的测试...</p>';
        }
      </script>
    </body>
    </html>
  `);
});

// =============== 测试端点 ===============

// 基础限流测试
app.get('/basic', basicLimiter, (req, res) => {
	res.json({
		success: true,
		message: '✅ 基础限流测试成功',
		type: 'basic',
		limit: '5次/分钟',
		timestamp: new Date().toISOString()
	});
});

// 严格限流测试
app.get('/strict', strictLimiter, (req, res) => {
	res.json({
		success: true,
		message: '✅ 严格限流测试成功',
		type: 'strict',
		limit: '2次/30秒',
		timestamp: new Date().toISOString()
	});
});

// 宽松限流测试
app.get('/relaxed', relaxedLimiter, (req, res) => {
	res.json({
		success: true,
		message: '✅ 宽松限流测试成功',
		type: 'relaxed',
		limit: '20次/2分钟',
		timestamp: new Date().toISOString()
	});
});

// 渐进限流测试
app.get('/progressive', progressiveLimiter, (req, res) => {
	const remaining = res.getHeader('RateLimit-Remaining') || 0;
	res.json({
		success: true,
		message: '✅ 渐进限流测试成功',
		type: 'progressive',
		limit: '10次/分钟',
		remaining: remaining,
		status: remaining > 5 ? '正常' : remaining > 2 ? '注意' : '警告',
		timestamp: new Date().toISOString()
	});
});

// 无限流测试
app.get('/no-limit', (req, res) => {
	res.json({
		success: true,
		message: '✅ 无限流测试成功',
		type: 'no-limit',
		limit: '无限制',
		timestamp: new Date().toISOString()
	});
});

// =============== 服务器启动 ===============
app.listen(PORT, () => {
	console.log(`🚀 Express Rate Limit Demo 服务器启动成功!`);
	console.log(`📖 访问地址: http://localhost:${PORT}`);
	console.log(``);
	console.log(`🧪 测试端点:`);
	console.log(`   基础限流: http://localhost:${PORT}/basic (5次/分钟)`);
	console.log(`   严格限流: http://localhost:${PORT}/strict (2次/30秒)`);
	console.log(`   宽松限流: http://localhost:${PORT}/relaxed (20次/2分钟)`);
	console.log(`   渐进限流: http://localhost:${PORT}/progressive (10次/分钟)`);
	console.log(`   无限流:   http://localhost:${PORT}/no-limit`);
	console.log(``);
	console.log(`💡 建议测试流程:`);
	console.log(`   1. 先测试严格限流，快速触发限制`);
	console.log(`   2. 观察渐进限流的提示变化`);
	console.log(`   3. 对比不同限制策略的效果`);
});