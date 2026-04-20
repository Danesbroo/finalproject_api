const categoryModel = require("../../models/Category");
// require('dotenv').config()

// // 🟨 View All Categories (with pagination and optional filtering)
// exports.view = async (request, response) => {
//     try {
//         const addCondition = [{ delete_at: null }];
//         const orCondition = [];

//         if (request.body?.name?.trim()) {
//             const name = new RegExp(request.body.name.trim(), 'i');
//             orCondition.push({ name: name });
//         }

//         let filter = { $and: addCondition };
//         if (orCondition.length > 0) {
//             filter.$or = orCondition;
//         }

//         const currentPage = parseInt(request?.body?.page) || 1;
//         const limit = parseInt(request?.body?.limit) || 5;
//         const skip = (currentPage - 1) * limit;

//         const totalRecords = await categoryModel.countDocuments(filter);
//         const totalPage = Math.ceil(totalRecords / limit);

//         const result = await categoryModel.find(filter)
//             .skip(skip)
//             .limit(limit)
//             .sort({ _id: -1 }) // sort by _id descending

//         if (result.length > 0) {
//             response.send({
//                 _status: true,
//                 _message: 'Category list fetched successfully',
//                 _pagination: {
//                     current_page: currentPage,
//                     total_page: totalPage,
//                     total_records: totalRecords
//                 },
//                 _image_path: process.env.CATEGORY_IMAGE,
//                 _data: result
//             });
//         } else {
//             response.send({
//                 _status: false,
//                 _message: 'No record found',
//                 _data: []
//             });
//         }
//     } catch (error) {
//         console.error('Error in view controller:', error.message);
//         response.status(500).send({
//             _status: false,
//             _message: 'Something went wrong!',
//             _data: null
//         });
//     }
// };
//  new controller 



exports.view = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.body || {};
    const filter = { delete_at: null };

    if (name?.trim()) {
      filter.name = new RegExp(name.trim(), 'i');
    }

    const skip = (page - 1) * limit;
    const totalRecords = await categoryModel.countDocuments(filter);

    const data = await categoryModel.find(filter)
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      _status: true,
      _message: data.length ? 'Categories fetched successfully' : 'No category found',
      _pagination: {
        current_page: page,
        total_page: Math.ceil(totalRecords / limit),
        total_records: totalRecords
      },
      _data: data
    });

  } catch (error) {
    console.error('Error in category view:', error);
    res.status(500).json({ _status: false, _message: 'Server error', _error: error.message });
  }
};

  

