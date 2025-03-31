// import { ChatPromptTemplate } from "@langchain/core/prompts";

// // Basic RAG template
// export const BASIC_RAG_TEMPLATE = `Given the following context, please answer the question. Keep your response focused and concise.

// Context: {context}

// Question: {question}

// Answer: `;

// // Prompt template for query refinement
// export const QUERY_REFINEMENT_PROMPT = ChatPromptTemplate.fromMessages([
//   [
//     "system",
//     `Given the following user question, formulate a standalone search query that would help retrieve the most relevant information from a knowledge base.
    
//     Rules:
//     - Focus on extracting key concepts from the question
//     - The query should be concise but specific
//     - Remove any unnecessary words or context
//     - If the question is already clear and concise, you can keep it as is`,
//   ],
//   ["human", `User question: {userPrompt}`],
// ]);

// // Prompt template for question answering
// export const QA_PROMPT = ChatPromptTemplate.fromMessages([
//   [
//     "system",
//     `You are an assistant for question-answering tasks. Use the following context to provide concise answers in three sentences or less. If the answer cannot be found in the context, clearly state that you don't know.

//     Context: {context}`,
//   ],
//   ["human", "Question: {question}"],
// ]);

import { ChatPromptTemplate } from "@langchain/core/prompts";

// Basic RAG template (for simple responses, if needed)
export const BASIC_RAG_TEMPLATE = `Given the following legal context, provide a detailed and accurate answer to the question. Ensure your response is comprehensive, legally sound, and relevant to the context provided.

Context: {context}

Question: {question}

Answer: `;

// Prompt template for query refinement
export const QUERY_REFINEMENT_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a legal query optimizer. Given the user's question, create a standalone search query optimized for retrieving relevant legal information from a knowledge base containing user-uploaded documents and Indian legal codes (IPC/BNS).

    Rules:
    - Extract key legal concepts, terms, or entities (e.g., section numbers, offenses, legal principles).
    - Formulate a concise, specific query suitable for a vector search.
    - Avoid vague or unnecessary phrasing.
    - If the question is already precise, retain it as is.`,
  ],
  ["human", `User question: {userPrompt}`],
]);

// Prompt template for detailed legal question answering
export const QA_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert legal assistant designed to assist with detailed legal analysis. Use the provided context, which may include user-uploaded legal documents and/or excerpts from the Indian Penal Code (IPC) and Bharatiya Nyaya Sanhita (BNS), to answer the question comprehensively. Follow these guidelines:
    
    - Provide a detailed, well-structured answer in multiple sentences, explaining relevant legal concepts, citing specific sections or clauses from the context when applicable, and ensuring accuracy.
    - If the context contains both user documents and IPC/BNS data, integrate insights from both sources seamlessly.
    - If the answer is not fully addressed by the context, clearly state what is missing and provide a general legal explanation based on standard Indian law principles, noting that further context may be required.
    - Avoid speculation; base your response solely on the given context and general legal knowledge.

    Context: {context}`,
  ],
  ["human", "Question: {question}"],
]);