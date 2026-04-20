const express = require('express');
const { decompose, changeStatus, details, update, view, create } = require('../../controllers/admin/country_controller');
const router = express.Router() // make router as a excutable function

module.exports = server => {
     
router.post('/create', create)

router.post('/view', view )

router.put('/update/:id', update) // use to add id in url

router.post('/details', details )

router.put('/change-status', changeStatus )

router.put('/delete', decompose )// here we call all routes 

server.use('/api/admin/country', router) // this is common route of this file
}