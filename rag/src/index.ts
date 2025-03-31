// Import required dependencies
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import dotenv from "dotenv";
import { RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import readline from "readline";
// Import prompt templates from lib/template.ts
import { QUERY_REFINEMENT_PROMPT, QA_PROMPT } from "./lib/template";
import path from "path";

// Configure environment variables
dotenv.config();

// Initialize readline interface for command-line interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt user for input and return Promise
const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

// Define paths to PDF documents
const IPC = path.join(__dirname, "../data/ipc.pdf");
const BNS = path.join(__dirname, "../data/bns.pdf");

// Main function to setup the RAG (Retrieval Augmented Generation) system
const setupRAG = async () => {
  console.log("Loading documents...");
  
  // Load both PDF documents
  const ipcLoader = new PDFLoader(IPC);
  const bnsLoader = new PDFLoader(BNS);
  
  const [ipcDocs, bnsDocs] = await Promise.all([
    ipcLoader.load(),
    bnsLoader.load()
  ]);
  
  // Combine documents from both sources with source metadata
  const ipcDocsWithSource = ipcDocs.map(doc => ({
    ...doc,
    metadata: { ...doc.metadata, source: "IPC" }
  }));
  
  const bnsDocsWithSource = bnsDocs.map(doc => ({
    ...doc,
    metadata: { ...doc.metadata, source: "BNS" }
  }));
  
  // Combine all documents
  const allDocs = [...ipcDocsWithSource, ...bnsDocsWithSource];
  console.log(`Loaded ${ipcDocs.length} pages from IPC and ${bnsDocs.length} pages from BNS`);

  // Initialize text splitter with configuration for chunk size and overlap
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, // Each chunk will be ~1000 characters
    chunkOverlap: 200, // Overlap between chunks to maintain context
  });

  // Split documents into smaller chunks for processing
  console.log("Splitting documents into chunks...");
  const splitDocs = await splitter.splitDocuments(allDocs);
  console.log(`Created ${splitDocs.length} document chunks`);

  // Initialize embeddings model using Google's Generative AI
  console.log("Creating embeddings...");
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "text-embedding-004",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });

  // Initialize or load vector store for document chunks
  let vectorStore;
  try {
    // Attempt to load existing vector store from disk
    console.log("Trying to load existing vector store...");
    vectorStore = await FaissStore.load("./legal-vector-store", embeddings);
    console.log("Vector store loaded successfully");
  } catch (error) {
    // Create new vector store if none exists
    console.log("Creating new vector store...");
    vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
    await vectorStore.save("./legal-vector-store");
    console.log("Vector store created and saved");
  }

  // Initialize Language Model for chat interactions
  const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    // model: "gemini-2.5-pro-exp-03-25",
    model:"gemini-2.0-flash-thinking-exp-01-21",
    temperature: 0.7,
  });

  // Create retriever from vector store for similarity search
  const retriever = vectorStore.asRetriever(100);

  // Main function to process user messages and generate responses
  const processUserMessage = async (userPrompt: string) => {
    try {
      console.log("\nProcessing your question...");

      // Step 1: Refine the user's query for better retrieval
      const searchQuery = await QUERY_REFINEMENT_PROMPT.pipe(llm)
        .pipe(new StringOutputParser())
        .invoke({
          userPrompt,
        });

      console.log(`Refined search query: ${searchQuery}`);

      // Step 2: Retrieve relevant documents using refined query
      const relevantDocs = await retriever.invoke(searchQuery);
      
      // Include source information in the context
      const context = relevantDocs.map((doc) => {
        const source = doc.metadata?.source || "Unknown";
        return `[Source: ${source}]\n${doc.pageContent}`;
      }).join("\n\n");

      console.log(`Retrieved ${relevantDocs.length} relevant document chunks`);

      // Step 3: Generate answer using retrieved context
      const answer = await QA_PROMPT.pipe(llm)
        .pipe(new StringOutputParser())
        .invoke({
          context,
          question: userPrompt,
        });

      return answer;
    } catch (error) {
      // Handle any errors during processing
      console.error("Error processing message:", error);
      return "Sorry, I encountered an error while processing your question.";
    }
  };

  return { processUserMessage };
};

// Function to start interactive command-line session
const startInteractiveSession = async () => {
  // Initialize RAG system
  console.log("Setting up the RAG system...");
  const { processUserMessage } = await setupRAG();

  // Start interactive loop
  console.log("\n🤖 Legal Document RAG System Ready!");
  console.log(
    "Ask questions about IPC or BNS, or type 'bye' to quit.\n"
  );

  // Continue processing questions until user exits
  let continueSession = true;
  while (continueSession) {
    // Get user input
    const userQuestion = await askQuestion("\nYour question: ");

    // Check for exit command
    if (userQuestion.toLowerCase() === "bye") {
      continueSession = false;
      console.log("Goodbye!");
      rl.close();
      continue;
    }

    // Process question and display answer
    const answer = await processUserMessage(userQuestion);
    console.log("\n🤖 Answer:");
    console.log(answer);
  }
};

// Start the application and handle any errors
startInteractiveSession().catch((error) => {
  console.error("An error occurred:", error);
  rl.close();
});