const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const router = express.Router();

// Multer setup for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Google GenAI with API key from .env
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

// POST /api/predict-outcome
router.post("/predict-outcome", upload.single("pdf"), async (req, res) => {
  try {
    // Ensure a file is provided
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // Extract text from the PDF
    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    // Create a prediction prompt
    const prompt = `
You are a world-class legal expert specializing in case outcome prediction. Analyze the following legal case document and provide a prediction of the likely outcome based on the facts, arguments, and legal precedents mentioned:

# CASE OUTCOME PREDICTION INSTRUCTIONS

## Steps for Prediction
1. **Identify Case Type**: Specify whether it is civil, criminal, constitutional, corporate, etc.
2. **Analyze Key Facts**: Highlight the facts most critical to determining the case's outcome.
3. **Examine Legal Arguments**: Summarize the arguments presented by both parties.
4. **Precedent Analysis**: Note any legal precedents mentioned and their relevance.
5. **Risk Factors**: Identify potential weaknesses or risks for each party.
6. **Applicable Law**: Determine which laws or statutes apply to this case.

## Output Format
1. **Case Overview**: Summary of the case, including type and key facts.
2. **Arguments Summary**: Key arguments for both parties.
3. **Outcome Prediction**: Likely judgment and reasoning.
4. **Confidence Level**: Estimated confidence in the prediction (e.g., 80%, 90%).
5. **Recommendations**: Strategic suggestions for both parties to improve their positions.

DOCUMENT TEXT:
${extractedText}
`;

    // Send prompt and extracted text to Gemini AI model
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // Send response back to the client
    res.json({ aiResponse: response.text });
  } catch (error) {
    console.error("Error predicting case outcome:", error);
    res.status(500).json({
      error: "An error occurred while predicting case outcome",
      details: error.message,
    });
  }
});

module.exports = router;
