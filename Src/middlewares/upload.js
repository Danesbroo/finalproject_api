const multer = require('multer');
const path = require('path');

// reusable upload middleware
const upload = (folder) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, `uploads/${folder}`),
    filename: (req, file, cb) => {
      const uniqueValue = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueValue}${ext}`);
    },
  });
  return multer({ storage });
};

module.exports = upload; // ✅ export function directly

// this is common file of this functionality
// you can use this file for different folder image upload
// example: const upload = require('../middlewares/upload').upload('category');
// then use upload.single('image') in your route to upload single image
// or upload.array('images', 5) to upload multiple images (max 5 in this case)