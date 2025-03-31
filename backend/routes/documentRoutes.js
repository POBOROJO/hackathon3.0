// // backend/src/routes/documentRoutes.js
// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const { v4: uuidv4 } = require('uuid');
// const documentController = require('../controllers/documentController');
// const auth = require('../middleware/authMiddleware');

// const router = express.Router();

// // Configure file storage with multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../../uploads'));
//   },
//   filename: (req, file, cb) => {
//     // Generate unique filename with original extension
//     const fileExt = path.extname(file.originalname);
//     const fileName = `${uuidv4()}${fileExt}`;
//     cb(null, fileName);
//   }
// });

// // File filter to only allow PDFs and DOCXs
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     'application/pdf',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//   ];
  
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: parseInt(process.env.MAX_FILE_SIZE || '50') * 1024 * 1024 // Default 50MB
//   }
// });

// // Routes with optional authentication
// router.post('/', auth.optional, upload.single('file'), documentController.uploadDocument);
// router.get('/', auth.optional, documentController.getAllDocuments);
// router.get('/search', auth.optional, documentController.searchDocuments);
// router.get('/:id', auth.optional, documentController.getDocument);
// router.patch('/:id', auth.optional, documentController.updateDocument);
// router.delete('/:id', auth.optional, documentController.deleteDocument);

// module.exports = router;