// const express = require('express');
// const { decompose, changeStatus, details, update, view, create } = require('../../controllers/website/subCategory_controller');
// const router = express.Router();
// const multer  = require('multer');
// const path = require('path');

// // Multer storage config
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/sub-category'); // save images here
//     },
//     filename: function (req, file, cb) {
//         const uniqueValue = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const imagePath = path.extname(file.originalname);
//         cb(null, file.fieldname + '-' + uniqueValue + imagePath);
//     }
// });

// const upload = multer({ storage });
// const singleImage = upload.single('image');

// // Routes

// router.post('/view', upload.none(), view);

// // Export as function
// module.exports = server => {
//     server.use('/api/website/sub-category', router);
// };

// routes/website/subCategoryRoute.js
const express = require('express');
const router = express.Router();

// Import controller + middleware
const { view } = require('../../controllers/website/subCategory_controller');
const upload = require('../../middlewares/upload');

// Routes
router.post('/view', upload('sub-category').none(), view);

// Export route function
module.exports = (server) => {
  server.use('/api/website/sub-category', router);
};

