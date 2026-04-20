const express = require('express');
const { decompose, view} = require('../../controllers/admin/order_controller');
const router = express.Router() // make router as a excutable function

module.exports = server => {
     
router.put('/decompose', decompose)

router.post('/view', view )



server.use('/api/admin/order', router) // this is common route of this file
}