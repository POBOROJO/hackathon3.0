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

// POST /api/document-review
router.post("/document-review", upload.single("pdf"), async (req, res) => {
  try {
    // Ensure a file is provided
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // Extract text from the PDF
    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    // Create a comprehensive legal document analysis prompt
    const prompt = `
You are a world-class legal document analyzer with expertise in all forms of legal documentation. Review the following legal document with meticulous attention to detail:

# LEGAL DOCUMENT ANALYSIS INSTRUCTIONS

## Primary Analysis
- Identify the document type (contract, agreement, policy, statute, etc.)
- Extract key parties involved and their roles
- Determine governing jurisdiction and applicable law
- Identify effective dates, term periods, and any critical deadlines

## Critical Provisions
- Extract all defined terms with their exact definitions
- Identify all obligations, commitments, and responsibilities for each party
- Highlight termination conditions and consequences
- Extract any limitations of liability, indemnification clauses, or warranty provisions
- Identify dispute resolution mechanisms and venue provisions

## Risk Assessment
- Flag ambiguous language or potential contradictions
- Identify unusual or potentially problematic clauses
- Note any missing standard provisions expected in this type of document
- Assess enforceability concerns based on jurisdiction

## Financial Implications
- Extract all payment terms, amounts, and schedules
- Identify penalties, fees, or interest provisions
- Note tax implications or considerations

## Compliance Considerations
- Identify privacy, confidentiality, or data protection provisions
- Note regulatory compliance requirements
- Flag any potential legal or regulatory concerns

## Output Format
1. Executive Summary (1-2 paragraphs overview)
2. Document Information (type, parties, dates, jurisdiction)
3. Key Provisions (organized by importance)
4. Obligations & Rights (organized by party)
5. Risk Factors (prioritized by potential impact)
6. Action Items (time-sensitive items requiring attention)
7. Recommendations (suggested clarifications or negotiations)

Provide your analysis in clear, concise language accessible to both legal and non-legal professionals. Focus on extracting the most significant elements while maintaining accuracy. Do not include explanations of your process.

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
    console.error("Error processing document review:", error);
    res.status(500).json({ 
      error: "An error occurred during document review", 
      details: error.message 
    });
  }
});

module.exports = router;
