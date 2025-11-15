// TODO
/**
 * 先直接看官网的例子吧：
 * 官网： @[LangChain.js](https://docs.langchain.com/oss/javascript/langchain/rag)
 */

// 基本内容：
/**
 * 1. CheerioWebBaseLoader
 * 2. 文本分割器（不要全部文本导入，浪费token，该工具可以按照大小如200tokens等分割，chunkSize，chunkOverlap等）
 * 3. 向量存储（ LLM 不能一次读全库内容，而分割后的每段文本需要被转换成“向量”，才能高效搜索和语义匹配，根据用户的问题找到最相关的文本片段，再把这些片段送进prompts让模型回答）
 * 4. 历史聊天记录
 */