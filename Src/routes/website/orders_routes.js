// const express = require('express');
// const router = express.Router();

// const multer = require('multer');
// const uploads = multer({ dest: 'uploads/orders' });

// // ✅ FIX: correct function name from controller
// const { orderPlaced, changeOrderStatus, stripeWebhook } =
//   require('../../controllers/website/order_controller');

// module.exports = server => {

//   router.post('/order-placed', uploads.none(), orderPlaced);
//   router.post('/changeOrderStatus', uploads.none(), changeOrderStatus);
//   router.post('/stripeWebhook', uploads.none(), stripeWebhook);

//   server.use('/api/website/orders', router);
// };
const express = require('express'); // ✅ needed for raw()
const router = express.Router();
const multer = require('multer');
const uploads = multer({ dest: 'uploads/orders' });

// Controllers
const { orderPlaced, changeOrderStatus, stripeWebhook } =
  require('../../controllers/website/order_controller');

module.exports = server => {

  // Normal routes with JSON body
  router.post('/order-placed', uploads.none(), orderPlaced);
  router.post('/changeOrderStatus', uploads.none(), changeOrderStatus);

  server.use('/api/website/orders', router);
};