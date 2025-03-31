// // backend/src/controllers/documentController.js
// const fs = require('fs-extra');
// const path = require('path');
// const Document = require('../models/documentModel');
// const { extractTextFromPDF, extractTextFromDOCX } = require('../utils/documentUtils');
// const { vectorizeDocument } = require('../services/vectorService');

// // Upload a document
// exports.uploadDocument = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'No file uploaded' });
//     }

//     // Extract text based on file type
//     let extractedText = '';
//     if (req.file.mimetype === 'application/pdf') {
//       extractedText = await extractTextFromPDF(req.file.path);
//     } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//       extractedText = await extractTextFromDOCX(req.file.path);
//     } else {
//       return res.status(400).json({ success: false, message: 'Unsupported file type' });
//     }

//     // Create document in database
//     const document = await Document.create({
//       name: req.file.originalname,
//       originalFilename: req.file.originalname,
//       filePath: req.file.path,
//       fileSize: req.file.size,
//       fileType: req.file.mimetype,
//       content: extractedText,
//       user: req.user ? req.user._id : null
//     });

//     // Start vectorization process in background
//     vectorizeDocument(document._id)
//       .then(() => console.log(`Document ${document._id} vectorized successfully`))
//       .catch(err => console.error(`Error vectorizing document ${document._id}:`, err));

//     res.status(201).json({
//       success: true,
//       data: {
//         id: document._id,
//         name: document.name,
//         type: document.fileType,
//         size: document.fileSize
//       }
//     });
//   } catch (error) {
//     console.error('Document upload error:', error);
//     if (req.file && req.file.path) {
//       fs.removeSync(req.file.path);
//     }
//     next(error);
//   }
// };

// // Get all documents
// exports.getAllDocuments = async (req, res, next) => {
//   try {
//     const query = req.user ? { user: req.user._id } : {};
    
//     const documents = await Document.find(query)
//       .select('_id name fileType fileSize category tags createdAt metadata.summary')
//       .sort('-createdAt');
    
//     res.status(200).json({
//       success: true,
//       count: documents.length,
//       data: documents
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get a single document
// exports.getDocument = async (req, res, next) => {
//   try {
//     const document = await Document.findById(req.params.id);
    
//     if (!document) {
//       return res.status(404).json({ success: false, message: 'Document not found' });
//     }

//     res.status(200).json({
//       success: true,
//       data: document
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Update document (tags, category, etc.)
// exports.updateDocument = async (req, res, next) => {
//   try {
//     const allowedUpdates = ['name', 'tags', 'category'];
//     const updates = {};
    
//     for (const key of Object.keys(req.body)) {
//       if (allowedUpdates.includes(key)) {
//         updates[key] = req.body[key];
//       }
//     }
    
//     const document = await Document.findByIdAndUpdate(
//       req.params.id,
//       updates,
//       { new: true, runValidators: true }
//     );
    
//     if (!document) {
//       return res.status(404).json({ success: false, message: 'Document not found' });
//     }
    
//     res.status(200).json({
//       success: true,
//       data: document
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Delete document
// exports.deleteDocument = async (req, res, next) => {
//   try {
//     const document = await Document.findById(req.params.id);
    
//     if (!document) {
//       return res.status(404).json({ success: false, message: 'Document not found' });
//     }
    
//     // Delete file from filesystem
//     if (document.filePath) {
//       fs.removeSync(document.filePath);
//     }
    
//     await document.remove();
    
//     res.status(200).json({
//       success: true,
//       message: 'Document deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Search documents
// exports.searchDocuments = async (req, res, next) => {
//   try {
//     const { query } = req.query;
    
//     if (!query) {
//       return res.status(400).json({ success: false, message: 'Search query is required' });
//     }
    
//     const documents = await Document.find(
//       { $text: { $search: query } },
//       { score: { $meta: "textScore" } }
//     )
//     .sort({ score: { $meta: "textScore" } })
//     .select('_id name fileType fileSize category tags createdAt metadata.summary');
    
//     res.status(200).json({
//       success: true,
//       count: documents.length,
//       data: documents
//     });
//   } catch (error) {
//     next(error);
//   }
// };