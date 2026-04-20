const express = require('express');
const {create, decompose, changeStatus, view, } = require('../../controllers/admin/newsletter_controller');
const router = express.Router() // make router as a excutable function

module.exports = server => {

  
router.post('/create', create )  
server.use('/api/website/newsletter', router) // this is common route of this file
}