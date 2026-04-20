const express = require('express');
const router = express.Router();
const { getNestedCategories } = require('../../controllers/website/nestedCategory_controller');

router.post('/view', getNestedCategories);

module.exports = (server) => {
  server.use('/api/website/nested-category', router);
};
