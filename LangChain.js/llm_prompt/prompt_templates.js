import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from '@langchain/core/prompts'

const model = new ChatOllama({
	baseUrl: OLLAMA_BASE_URL,
	model: OLLAMA_MODEL,
	temperature: 0.7,// 控制模型创造性或真实性，1：完全有创意，0表示严格和事实
	// // maxTokens:1000
	// verbose: true// 将允许我们调试模型,详细模式
});
/**
 * from template
 */

// const prompt = ChatPromptTemplate.fromTemplate('You are Li Bai.Tell me a poem based on the following word {input}, use Chinese.')
// // console.log(await prompt.format({ input: "chicken" }))


// // 结合 model 和 prompt， 在LangChain 中被称为创建链
// const chain = prompt.pipe(model)

// // 现在我们可以直接调用链从而调用模型
// // call chain
// const res = await chain.stream({
// 	input: "dog"
// })

// for await (const chunk of res) {
// 	process.stdout.write(chunk.text ?? "");
// }

/**
 * from messages
 */

const prompt = ChatPromptTemplate.fromMessages([
	["system", "生成一个笑话基于以下词语"],
	["human", "{input}"]
])
const chain = prompt.pipe(model)

const res = await chain.stream({
	input: "dog"
})
for await (const chunk of res) {
	process.stdout.write(chunk.text ?? "");
}