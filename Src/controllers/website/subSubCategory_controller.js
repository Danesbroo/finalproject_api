const SubSubCategory = require('../../models/SubSubCategory_model');

// ✅ View Controller (to get sub-sub categories)
exports.view = async (req, res) => {
  try {
    const subSubCategories = await SubSubCategory.find({ status: true, delete_at: null })
      .populate('grandParent_Id', 'name slug')
      .populate('parent_Id', 'name slug')
      .sort({ order: 1 });

    res.json({
      success: true,
      message: 'Sub-sub categories fetched successfully',
      _data: subSubCategories
    });
  } catch (err) {
    res.json({
      success: false,
      message: 'Failed to fetch sub-sub categories'
    });
  }
};
