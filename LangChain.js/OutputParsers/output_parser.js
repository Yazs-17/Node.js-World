/**
 * 
 * 输出解析器： 控制AI返回的内容和和格式
 * 
 */

import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser, CommaSeparatedListOutputParser, StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'


const model = new ChatOllama({
	baseUrl: OLLAMA_BASE_URL,
	model: OLLAMA_MODEL,
	temperature: 0.7,// 控制模型创造性或真实性，1：完全有创意，0表示严格和事实
	// // maxTokens:1000
	// verbose: true// 将允许我们调试模型,详细模式
});

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
 * 
 * parser 生成的是一段清晰的格式化指令，并塞给模型，模型从文本中找到对应内容，parser再把模型的结果格式化为对象
 * 
 * 
 */


const callStringOutputParser = async (input) => {
	const prompt = ChatPromptTemplate.fromMessages([
		["system", "生成一个笑话基于以下词语"],
		["human", "{input}"]
	])

	// Create Parser
	const parser = new StringOutputParser();

	// Create chain
	const chain = prompt.pipe(model).pipe(parser)

	const res = await chain.invoke({
		input: input
	})
	return res;
}
const callListOutputParser = async () => {
	const prompt = ChatPromptTemplate.fromTemplate(`
			Provide 5 synonyms, seperated by commas, for the following word {word}
		`);
	const outputParsers = new CommaSeparatedListOutputParser();
	// prompt → model → parser
	const chain = prompt.pipe(model).pipe(outputParsers);
	return await chain.invoke({
		word: "happy"
	})
}
const callStructureOutputParser = async () => {
	const prompt = ChatPromptTemplate.fromTemplate(`
			Extract information from the following phrase. 
			Formatting Instructions: {format_instructions}
			Phrase: {phrase}
		`);
	const outputParsers = StructuredOutputParser.fromNamesAndDescriptions({
		name: "the name of the person",
		age: "the age of the person"

	});
	const chain = prompt.pipe(model).pipe(outputParsers); //LCEL 风格
	return await chain.invoke({
		phrase: "Max is 30 years old", // 原始文本
		format_instructions: outputParsers.getFormatInstructions() // 转换为模型可以理解的格式化指令，告诉模型如何格式化输出（通常是一个精确的格式/JSON schema 说明）由 StructuredOutputParser 生成并插入到 prompt 中，保证模型输出可以被解析成结构化数据
	})
}

const callZodOutputParser = async () => {
	const prompt = ChatPromptTemplate.fromTemplate(`
			Extract information from the following phrase. 
			Formatting Instructions: {format_instructions}
			Phrase: {phrase}
		`);
	const outputParsers = StructuredOutputParser.fromZodSchema(z.object({
		recipe: z.string().describe("name of recipe"),
		ingredients: z.array(z.string()).describe("ingredients")
	}));
	const chain = prompt.pipe(model).pipe(outputParsers); //LCEL 风格
	return await chain.invoke({
		phrase: "The ingredients for a beef noodles recipe are tomatoes, minced beef and noodles", // 原始文本
		format_instructions: outputParsers.getFormatInstructions() // 转换为模型可以理解的格式化指令，告诉模型如何格式化输出（通常是一个精确的格式/JSON schema 说明）由 StructuredOutputParser 生成并插入到 prompt 中，保证模型输出可以被解析成结构化数据
	})
}

// const res = await callStringOutputParser("dog")
const res = await callZodOutputParser()


console.log(res)