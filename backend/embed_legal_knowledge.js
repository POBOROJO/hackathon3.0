import { Pinecone } from '@pinecone-database/pinecone';
import { pipeline } from '@xenova/transformers';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});
const index = pinecone.Index('legal-documents');

// Initialize embedder
let embedder;
async function loadEmbedder() {
  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('Embedder loaded');
}

// Function to extract text from PDF
async function extractTextFromPDF(filePath) {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// Function to split text into chunks (e.g., by section or paragraph)
function splitTextIntoChunks(text, maxLength = 500) {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length <= maxLength) {
      currentChunk += paragraph + '\n\n';
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = paragraph + '\n\n';
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// Function to generate embeddings and upload to Pinecone
async function embedAndUpload(filePath, source) {
  try {
    // Extract text
    const text = await extractTextFromPDF(filePath);
    const chunks = splitTextIntoChunks(text);

    // Generate embeddings
    const embeddings = await Promise.all(
      chunks.map(chunk => embedder(chunk, { pooling: 'mean', normalize: true }).then(e => e.data))
    );

    // Prepare vectors for Pinecone
    const vectors = embeddings.map((embedding, i) => ({
      id: `${source}_${uuidv4()}`,
      values: embedding,
      metadata: {
        source,
        text: chunks[i],
      },
    }));

    // Upsert to Pinecone in batches (max 100 per request)
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.namespace('legal').upsert(batch);
      console.log(`Uploaded batch ${i / batchSize + 1} for ${source}`);
    }

    console.log(`Successfully uploaded ${source} to Pinecone`);
  } catch (err) {
    console.error(`Error processing ${source}:`, err);
  }
}

// Main function
async function main() {
  await loadEmbedder();

  // Process IPC and BNS files
  await embedAndUpload('./data/ipc.pdf', 'IPC');
  await embedAndUpload('./data/bns.pdf', 'BNS');
}

main().catch(err => console.error('Main error:', err));