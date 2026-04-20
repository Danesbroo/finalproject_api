const express = require('express');
const { decompose, changeStatus, details, update, view, create } = require('../../controllers/admin/whyChooseUs_controller');
const router = express.Router();
const multer  = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/why_choose_us'); // save images here
    },
    filename: function (req, file, cb) {
        const uniqueValue = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const imagePath = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueValue + imagePath);
    }
});

const upload = multer({ storage });
const singleImage = upload.single('image');

// Routes
router.post('/create', singleImage, create);
router.post('/view', upload.none(), view);
router.put('/update/:id', singleImage, update);
router.post('/details', upload.none(), details);
router.put('/change-status', upload.none(), changeStatus);
router.put('/delete', upload.none(), decompose);

// Export as function
module.exports = server => {
    server.use('/api/admin/why_choose_us', router);
};
