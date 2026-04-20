// Src/controllers/website/nestedCategory_controller.js

const Category = require('../../models/Category');
const SubCategory = require('../../models/SubCategory');
const SubSubCategory = require('../../models/SubSubCategory');

exports.getNestedCategories = async (req, res) => {
  try {
    // Step 1: Fetch all three levels
    const categories = await Category.find({ status: true, delete_at: null}).lean();
    const subcategories = await SubCategory.find({ status: true, delete_at: null }).lean();
    const subsubcategories = await SubSubCategory.find({ status: true, delete_at: null }).lean();

    // Step 2: Build nested structure
    const nestedData = categories.map(cat => {
      const relatedSubCategories = subcategories
      .filter(sub => sub.parent_Id?.toString() === cat._id.toString())
      .map(sub => {
          const relatedSubSubCategories = subsubcategories.filter(
            subsub => subsub.parent_Id?.toString() === sub._id.toString()
          );
          return { 
            ...sub, 
            subSubCategories: relatedSubSubCategories 
          };
        });

      return { 
        ...cat, 
        subCategories: relatedSubCategories 
      };
    });

    // Step 3: Send response
    return res.json({
      _status: true,
      _message: "Nested categories fetched successfully",
      _data: nestedData
    });

  } catch (error) {
    console.error("Error fetching nested categories:", error);
    return res.json({
      _status: false,
      _message: "Server error",
      _error: error.message
    });
  }
};
