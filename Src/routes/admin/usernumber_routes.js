const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploads = multer({dest: 'uploads/'}) // multer configuration for file uploads
const { view } = require('../../controllers/admin/usernumber_controller');

module.exports = (server) => {
    router.get('/',uploads.none(), view);

    server.use('/api/admin/usernumber', router);
};