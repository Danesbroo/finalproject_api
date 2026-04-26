
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config(); // ✅ Load .env first

// const server = express();

// // Middleware
// server.use(express.json());
// server.use(express.urlencoded({ extended: true }));
// server.use(cors());

// // Test route
// server.get('/', (req, res) => {
//   res.send('Server Working fine');
// });

// // Serve static category images
// server.use('/uploads/category', express.static('uploads/category'));
// server.use('/uploads/sub-category', express.static('uploads/sub-category'));
// server.use('/uploads/sub_sub_category', express.static('uploads/sub_sub_category'));
// server.use('/uploads/testimonial', express.static('uploads/testimonial'));
// server.use('/uploads/why_choose_us', express.static('uploads/why_choose_us'));
// server.use('/uploads/slider', express.static('uploads/slider'));
// server.use('/uploads/products', express.static('uploads/products'));
// server.use('/uploads/users', express.static('uploads/users'));
// server.use('/uploads/admins', express.static('uploads/admins'));
// server.use('/uploads/company', express.static('uploads/company'));

// // Admin Pannel Api
// require('./Src/routes/admin/color_routes.js')(server);
// require('./Src/routes/admin/material_routes.js')(server);
// require('./Src/routes/admin/country_routes.js')(server);
// require('./Src/routes/admin/category_routes.js')(server);
// require('./Src/routes/admin/subCategory_routes.js')(server);
// require('./Src/routes/admin/subSubCategory_routes.js')(server);
// require('./Src/routes/admin/testimonial_routes.js')(server);
// require('./Src/routes/admin/whyChooseUs_routes.js')(server);// <-- Added this ✅
// require('./Src/routes/admin/slider_routes.js')(server);
// require('./Src/routes/admin/faq_routes.js')(server);
// require('./Src/routes/admin/products_routes.js')(server);
// require('./Src/routes/admin/user_routes.js')(server);
// require('./Src/routes/admin/admins_routes.js')(server);
// require('./Src/routes/admin/enquiry_routes.js')(server);
// require('./Src/routes/admin/newsletter_routes.js')(server);
// require('./Src/routes/admin/webUser_routes.js')(server);
// require('./Src/routes/admin/company_routes.js')(server);

// // Website Api
// require('./Src/routes/website/webUser_routes.js')(server);
// require('./Src/routes/website/category_routes.js')(server);
// require('./Src/routes/website/subCategory_routes.js')(server);
// require('./Src/routes/website/material_routes.js')(server);
// require('./Src/routes/website/color_routes.js')(server);
// require('./Src/routes/website/products_routes.js')(server);
// require('./Src/routes/website/subSubCategory_routes.js')(server);
// require('./Src/routes/website/nestedCategory_routes.js')(server);
// require('./Src/routes/website/product_details_routes.js')(server);
// require('./Src/routes/website/faq_routes.js')(server);
// require('./Src/routes/website/testimonial_routes.js')(server);
// require('./Src/routes/website/newsletter_routes.js')(server);
// require('./Src/routes/website/enquiry_routes.js')(server);
// require('./Src/routes/website/whyChooseUs_routes.js')(server);
// require('./Src/routes/website/slider_routes.js')(server);
// require('./Src/routes/website/orders_routes.js')(server);


// // ✅ Connect DB first, then start server
// const PORT = process.env.PORT || 4000;

// mongoose.connect(process.env.DB)
//   .then(() => {
//     console.log('Database connected');
//     server.listen(PORT, () => {
//       console.log(` Server running on http://localhost:${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error('Database connection failed:', error.message);
//   });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');

const server = express(); // ✅ FIRST define server

// ----------------- Stripe Webhook -----------------
const orderController = require('./Src/controllers/website/order_controller');

// ⚠️ Webhook route MUST be before express.json()
server.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  orderController.stripeWebhook
);

// ----------------- Middleware -----------------
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors());

// Test route
server.get('/', (req, res) => {
  res.send('Server Working fine');
});

// Static files
server.use('/uploads/category', express.static('uploads/category'));
server.use('/uploads/sub-category', express.static('uploads/sub-category'));
server.use('/uploads/sub_sub_category', express.static('uploads/sub_sub_category'));
server.use('/uploads/testimonial', express.static('uploads/testimonial'));
server.use('/uploads/why_choose_us', express.static('uploads/why_choose_us'));
server.use('/uploads/slider', express.static('uploads/slider'));
server.use('/uploads/products', express.static('uploads/products'));
server.use('/uploads/users', express.static('uploads/users'));
server.use('/uploads/admins', express.static('uploads/admins'));
server.use('/uploads/company', express.static('uploads/company'));

// Admin Pannel Api
require('./Src/routes/admin/color_routes.js')(server);
require('./Src/routes/admin/material_routes.js')(server);
require('./Src/routes/admin/country_routes.js')(server);
require('./Src/routes/admin/category_routes.js')(server);
require('./Src/routes/admin/subCategory_routes.js')(server);
require('./Src/routes/admin/subSubCategory_routes.js')(server);
require('./Src/routes/admin/testimonial_routes.js')(server);
require('./Src/routes/admin/whyChooseUs_routes.js')(server);
require('./Src/routes/admin/slider_routes.js')(server);
require('./Src/routes/admin/faq_routes.js')(server);
require('./Src/routes/admin/products_routes.js')(server);
require('./Src/routes/admin/user_routes.js')(server);
require('./Src/routes/admin/admins_routes.js')(server);
require('./Src/routes/admin/enquiry_routes.js')(server);
require('./Src/routes/admin/newsletter_routes.js')(server);
require('./Src/routes/admin/webUser_routes.js')(server);
require('./Src/routes/admin/company_routes.js')(server);
require('./Src/routes/admin/order_routes.js')(server);
require('./Src/routes/admin/dashboard_routes.js')(server);
require('./Src/routes/admin/usernumber_routes.js')(server);
require('./Src/routes/admin/productcount_routes.js')(server);



// Website Api
require('./Src/routes/website/webUser_routes.js')(server);
require('./Src/routes/website/category_routes.js')(server);
require('./Src/routes/website/subCategory_routes.js')(server);
require('./Src/routes/website/material_routes.js')(server);
require('./Src/routes/website/color_routes.js')(server);
require('./Src/routes/website/products_routes.js')(server);
require('./Src/routes/website/subSubCategory_routes.js')(server);
require('./Src/routes/website/nestedCategory_routes.js')(server);
require('./Src/routes/website/product_details_routes.js')(server);
require('./Src/routes/website/faq_routes.js')(server);
require('./Src/routes/website/testimonial_routes.js')(server);
require('./Src/routes/website/newsletter_routes.js')(server);
require('./Src/routes/website/enquiry_routes.js')(server);
require('./Src/routes/website/whyChooseUs_routes.js')(server);
require('./Src/routes/website/slider_routes.js')(server);
require('./Src/routes/website/orders_routes.js')(server);

// DB connect
const PORT = process.env.PORT || 4000;
console.log("DB URI:", process.env.DB);
mongoose.connect(process.env.DB)
  .then(() => {
    console.log('Database connected');
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
  });