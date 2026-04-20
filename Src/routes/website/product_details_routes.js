const express = require("express");
const router = express.Router();

// Controller + middleware import
const { productDetails } = require("../../controllers/website/productDetails_controller");
const upload = require("../../middlewares/upload");

// Route define — keep as-is, expects product ID
router.post("/:id", upload().none(), productDetails);

module.exports = (server) => {
  server.use("/api/website/product_details", router);
};
