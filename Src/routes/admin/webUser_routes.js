const express = require('express');
const { view, update, details, changeStatus, decompose } = require('../../controllers/admin/webUser_controller');
const router = express.Router() // make router as a excutable function

// if we get text file we use request.body but for file we write request.file
module.exports = server => {
     
router.post('/view', view )

router.put('/update/:id', update ) // use to add id in url

router.post('/details', details )

router.put('/change-status', changeStatus )

router.put('/delete', decompose )// here we call all routes 

server.use('/api/admin/webUser', router) // this is common route of this file
}
    