const express = require('express');
const { decompose, changeStatus, details, update, view, create } = require('../../controllers/website/color_controller');
const router = express.Router() // make router as a excutable function

module.exports = server => {
     
router.post('/view', view )


server.use('/api/website/color', router) // this is common route of this file
}