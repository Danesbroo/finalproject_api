const express = require('express');
const { decompose, changeStatus, details, update, view, create } = require('../../controllers/admin/faq_controller');
const router = express.Router() // make router as a excutable function

module.exports = server => {
     
router.post('/view', view )


server.use('/api/website/faq', router) // this is common route of this file
}