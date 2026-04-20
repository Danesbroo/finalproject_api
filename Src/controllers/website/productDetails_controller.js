const productModel = require("../../models/Product");

exports.productDetails = async (request, response) => {
  try {
    const { id } = request.params;
    // if id is not available
    if (!id) {
      return response.send({
        _status: false,
        _message: "Product ID is required",
        _data: null,
      });
    }

    const result = await productModel
      .findById(id) // we take id for grap data from id
      .populate("material_ids", "name")
      .populate("color_ids", "name")
      .populate("parent_category_ids", "name")
      .populate("sub_category_ids", "name")
      .populate("sub_sub_category_ids", "name");

    //if result is not found
    if (!result) {
      return response.send({
        _status: false,
        _message: "No record found",
        _data: null,
      });
    }
    
    return response.send({
      _status: true,
      _message: "Record fetched successfully",
      _data: result,
      _image_path: process.env.PRODUCT_IMAGES,
    });
  } catch (error) {
    return response.send({
      _status: false,
      _message: "Something went wrong!",
      _data: null,
    });
  }
};
