import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { MongoClient, ObjectId } from 'mongodb';
import { Pinecone } from '@pinecone-database/pinecone';
import { pipeline } from '@xenova/transformers';
import { Clerk } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';
import fs from 'fs/promises'; // For file system operations

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Restrict to frontend in production
app.use(bodyParser.json());

// Clerk setup
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// MongoDB setup
let db;
MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db();
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Pinecone setup
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});
const index = pinecone.Index('legal-documents');

// Embedder setup (for embeddings generation)
let embedder;
pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  .then(model => {
    embedder = model;
    console.log('Embedder loaded');
  })
  .catch(err => console.error('Embedder loading error:', err));

// NER setup (for entity extraction)
let ner;
pipeline('ner', 'Xenova/legal-bert-base-uncased')
  .then(model => {
    ner = model;
    console.log('NER model loaded');
  })
  .catch(err => console.error('NER loading error:', err));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const extension = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${extension}`);
  }
});
const upload = multer({ storage });

// Ensure uploads directory exists
fs.mkdir('uploads', { recursive: true }).catch(err => console.error('Uploads dir error:', err));

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { userId } = await clerk.verifyToken(token);
    req.userId = userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 1. Document Upload & Management
app.post('/upload', authenticate, upload.single('document'), async (req, res) => {
  try {
    const { category, tags } = req.body;
    const filePath = req.file.path;
    const extension = req.file.originalname.split('.').pop().toLowerCase();
    let text = '';

    // Extract text based on file type
    if (extension === 'pdf') {
      const data = await pdfParse(filePath);
      text = data.text;
    } else if (extension === 'docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      await fs.unlink(filePath); // Clean up unsupported file
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Extract entities for review
    const entities = await ner(text);
    const summary = await generateSummary(text); // Custom function below

    // Store document in MongoDB
    const document = {
      userId: req.userId,
      filename: req.file.filename,
      originalname: req.file.originalname,
      category,
      tags: tags ? tags.split(',') : [],
      text,
      entities,
      summary,
      uploadDate: new Date(),
    };
    const result = await db.collection('documents').insertOne(document);
    const documentId = result.insertedId.toString();

    // Generate embeddings and store in Pinecone
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    const embeddings = await Promise.all(paragraphs.map(p => embedder(p, { pooling: 'mean', normalize: true }).then(e => e.data)));
    const vectors = embeddings.map((embedding, i) => ({
      id: `${documentId}_${i}`,
      values: embedding,
      metadata: { userId: req.userId, documentId, text: paragraphs[i] },
    }));
    await index.namespace('users').upsert(vectors);

    // Clean up uploaded file
    await fs.unlink(filePath);

    res.status(201).json({ message: 'File uploaded successfully', documentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing file' });
  }
});

// Helper function to generate summary (simplified using embeddings similarity)
async function generateSummary(text) {
  // Placeholder: Use an LLM for production
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  return paragraphs.slice(0, 2).join(' '); // Simplified summary
}

// 2. AI-Powered Q&A (RAG-based)
app.post('/ask', authenticate, async (req, res) => {
  try {
    const { question, mode } = req.body;
    if (!question || !mode) return res.status(400).json({ error: 'Missing question or mode' });

    const questionEmbedding = await embedder(question, { pooling: 'mean', normalize: true });
    const queryVector = questionEmbedding.data;
    let results;

    if (mode === 'documents_only') {
      results = await index.namespace('users').query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
        filter: { userId: req.userId },
      });
    } else if (mode === 'documents_and_legal') {
      const [userResults, legalResults] = await Promise.all([
        index.namespace('users').query({
          vector: queryVector,
          topK: 5,
          includeMetadata: true,
          filter: { userId: req.userId },
        }),
        index.namespace('legal').query({
          vector: queryVector,
          topK: 5,
          includeMetadata: true,
        }),
      ]);
      results = [...userResults.matches, ...legalResults.matches]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } else {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    const context = results.map(r => r.metadata.text).join('\n\n');
    const answer = await generateAnswer(question, context); // Custom function below

    res.json({ answer, context });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing question' });
  }
});

// Helper function to generate answer (placeholder for LLM)
async function generateAnswer(question, context) {
  // Placeholder: Integrate an LLM like Hugging Face's Mistral-7B in production
  return `Answer to "${question}": Based on the provided context, here is a simplified response. Context: ${context.slice(0, 100)}...`;
}

// 3. & 4. Document Retrieval (for Review and Insights)
app.get('/documents', authenticate, async (req, res) => {
  try {
    const documents = await db.collection('documents').find({ userId: req.userId }).toArray();
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving documents' });
  }
});

app.get('/documents/:id', authenticate, async (req, res) => {
  try {
    const document = await db.collection('documents').findOne({
      _id: new ObjectId(req.params.id),
      userId: req.userId,
    });
    if (!document) return res.status(404).json({ error: 'Document not found' });
    res.json(document);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving document' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});