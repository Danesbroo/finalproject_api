const express = require('express');
const {create, decompose, changeStatus, view, } = require('../../controllers/admin/newsletter_controller');
const router = express.Router() // make router as a excutable function

module.exports = server => {

  
router.post('/create', create )  
router.post('/view', view )
router.put('/change-status', changeStatus )
router.put('/delete', decompose )// here we call all routes 
server.use('/api/admin/newsletter', router) // this is common route of this file
}