/**
 * 接着见：https://docs.langchain.com/oss/javascript/langchain/rag
 */








// import { ChatOllama } from "@langchain/ollama";
// import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
// import { createAgent } from "langchain";

// const model = new ChatOllama({
// 	baseUrl: OLLAMA_BASE_URL,
// 	model: OLLAMA_MODEL,
// 	temperature: 0.7,// 控制模型创造性或真实性，1：完全有创意，0表示严格和事实
// 	// // maxTokens:1000
// 	// verbose: true// 将允许我们调试模型,详细模式
// });

// const prompt = ChatPromptTemplate.fromMessages([
// 	["system", "you are a helpful assistant called Max"],
// 	["human", "{input}"],
// 	new MessagesPlaceholder("agent_scratchpad")
// ])
// const tools = []
// const agent = createAgent({ model, tools, prompt });
// let inputMessage = `who are you`;

// let agentInputs = { messages: [{ role: "user", content: inputMessage }] };

// const res = await agent.stream({
// 	agentInputs: "what is dog"
// })
// for await (const chunk of res) {
// 	process.stdout.write(chunk.text ?? "");
// }




// // const stream = await agent.stream(agentInputs, {
// // 	streamMode: "values",
// // });
// // for await (const step of stream) {
// // 	const lastMessage = step.messages[step.messages.length - 1];
// // 	console.log(`[${lastMessage.role}]: ${lastMessage.content}`);
// // 	console.log("-----\n");
// // }