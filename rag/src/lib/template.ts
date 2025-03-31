import { ChatPromptTemplate } from "@langchain/core/prompts";

// Basic RAG template
export const BASIC_RAG_TEMPLATE = `Given the following context, please answer the question. Keep your response focused and concise.

Context: {context}

Question: {question}

Answer: `;

// Prompt template for query refinement
export const QUERY_REFINEMENT_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Given the following user question, formulate a standalone search query that would help retrieve the most relevant information from a knowledge base.
    
    Rules:
    - Focus on extracting key concepts from the question
    - The query should be concise but specific
    - Remove any unnecessary words or context
    - If the question is already clear and concise, you can keep it as is`,
  ],
  ["human", `User question: {userPrompt}`],
]);

// Prompt template for question answering
export const QA_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an assistant for question-answering tasks. Use the following context to provide concise answers in three sentences or less. If the answer cannot be found in the context, clearly state that you don't know.

    Context: {context}`,
  ],
  ["human", "Question: {question}"],
]);