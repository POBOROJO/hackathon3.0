// // backend/src/models/documentModel.js
// const mongoose = require('mongoose');

// const documentSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Please provide a document name'],
//     trim: true
//   },
//   originalFilename: {
//     type: String,
//     required: [true, 'Original filename is required']
//   },
//   filePath: {
//     type: String,
//     required: [true, 'File path is required']
//   },
//   fileSize: {
//     type: Number,
//     required: [true, 'File size is required']
//   },
//   fileType: {
//     type: String,
//     required: [true, 'File type is required'],
//     enum: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
//   },
//   tags: [{
//     type: String,
//     trim: true
//   }],
//   category: {
//     type: String,
//     enum: ['contract', 'case_law', 'regulation', 'notice', 'agreement', 'other'],
//     default: 'other'
//   },
//   content: {
//     type: String,
//     required: [true, 'Document content is required']
//   },
//   vectorized: {
//     type: Boolean,
//     default: false
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   metadata: {
//     keyInformation: [String],
//     inconsistencies: [String],
//     sensitiveInfo: [
//       {
//         text: String,
//         reason: String,
//         pageNumber: Number
//       }
//     ],
//     citationReferences: [
//       {
//         citation: String,
//         context: String,
//         pageNumber: Number
//       }
//     ],
//     summary: String,
//     risks: [
//       {
//         risk: String,
//         severity: {
//           type: String,
//           enum: ['low', 'medium', 'high']
//         },
//         description: String
//       }
//     ]
//   }
// }, { timestamps: true });

// // Index for text search
// documentSchema.index({ content: 'text', name: 'text' });

// const Document = mongoose.model('Document', documentSchema);

// module.exports = Document;