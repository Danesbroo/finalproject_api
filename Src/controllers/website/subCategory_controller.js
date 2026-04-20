const subCategoryModel = require("../../models/SubCategory");


// exports.view = async (request, response) => {
//     try {
//         // 1. Build filter
//         const addCondition = [{ delete_at: null }];
//         const orCondition = [];

//         // Filter by name or code
//         if (request.body?.name && request.body.name.trim() !== '') {
//             const name = new RegExp(request.body.name.trim(), 'i');
//             orCondition.push({ name: name }, { code: name });
//         }

//         // Filter by parent_Id (independent of name)
//         if (request.body?.parent_Id && request.body.parent_Id.trim() !== '') {
//             addCondition.push({ parent_Id: request.body.parent_Id });
//         }

//         let filter = { $and: addCondition };
//         if (orCondition.length > 0) {
//             filter.$or = orCondition;
//         }

//         // 2. Pagination
//         const currentPage = parseInt(request?.body?.page) || 1; // if
//         const limit = parseInt(request?.body?.limit) || 10;
//         const skip = (currentPage - 1) * limit;

//         // 3. Count total records
//         const totalRecords = await subCategoryModel.countDocuments(filter);
//         const totalPage = Math.ceil(totalRecords / limit);

//         // 4. Fetch paginated data
//         subCategoryModel.find(filter)
//             .select('_id name parent_Id image order status') // select only specific fields to return
//             .populate('parent_Id', 'name') // populate parent_Id with only the name field from categories collection
//             .skip(skip)
//             .limit(limit)
//             .sort({ _id: -1 })
//             .then((result) => {
//                 if (result.length > 0) {
//                     response.send({
//                         _status: true,
//                         _message: 'Record view successfully',
//                         _pagination: {
//                             current_page: currentPage,
//                             total_page: totalPage,
//                             total_records: totalRecords,
//                         },
//                         _data: result,
//                         _image_path: process.env.SUBCATEGORY_IMAGE,
//                     });
//                 } else {
//                     response.send({
//                         _status: true,
//                         _message: 'No record found',
//                         _data: [],
//                     });
//                 }
//             })
//             .catch((err) => {
//                 response.send({
//                     _status: false,
//                     _message: 'Something Went Wrong !!',
//                     _data: '',
//                 });
//             });

//     } catch (error) {
//         console.error('Error in view controller:', error.message);
//         response.status(500).send({
//             _status: false,
//             _message: 'Something went wrong!',
//             _data: null,
//         });
//     }
// };

// next controller 

// exports.view = async (req, res) => {
//   try {
//     // ✅ If req.body is undefined, default to empty object
//     const { name, parent_Id, page = 1, limit = 10 } = req.body || {};

//     const filter = { delete_at: null };

//     if (name?.trim()) filter.name = new RegExp(name.trim(), 'i');
//     if (parent_Id) filter.parent_Id = parent_Id;

//     const skip = (page - 1) * limit;
//     const totalRecords = await subCategoryModel.countDocuments(filter);

//     const data = await subCategoryModel.find(filter)
//       .populate('parent_Id', 'name') // parent category name
//       .sort({ order: 1 })
//       .skip(skip)
//       .limit(limit);

//     res.json({
//       _status: true,
//       _message: data.length ? 'Sub-categories fetched successfully' : 'No record found',
//       _pagination: {
//         current_page: page,
//         total_page: Math.ceil(totalRecords / limit),
//         total_records: totalRecords
//       },
//       _data: data
//     });
//   } catch (error) {
//     res.send({ _status: false, _message: 'Server error', _error: error.message });
//   }
// };

// controllers/website/subCategory_controller.js


exports.view = async (req, res) => {
  try {
    const { parent_Id } = req.body;
    const filter = { delete_at: null };

    if (parent_Id) filter.parent_Id = parent_Id;

    const data = await subCategoryModel.find(filter).populate('parent_Id').sort({ order: 1 });

    res.json({
      _status: true,
      _message: "Subcategories fetched successfully",
      _data: data,
    });
  } catch (err) {
    res.status(500).json({
      _status: false,
      _message: "Server error",
      _error: err.message,
    });
  }
};


