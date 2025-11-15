import { ChatOllama } from "@langchain/ollama"

const model = new ChatOllama({
	baseUrl: OLLAMA_BASE_URL,
	model: OLLAMA_MODEL,
	temperature: 0.7,// 控制模型创造性或真实性，1：完全有创意，0表示严格和事实
	// maxTokens:1000
	verbose: true// 将允许我们调试模型,详细模式
});

const res = await model.invoke("hello");
console.log(res);

// 批处理
// const batch = await model.batch(["hello", "hhow are you"]);
// console.log(batch)

// 流处理
// const stream = await model.stream("你好，请自我介绍一下");

// for await (const chunk of stream) {
// 	process.stdout.write(chunk.text ?? "");
// }


// 流处理每步结果
// const stream = await model.streamLog("你好，请自我介绍一下");
