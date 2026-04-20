const companyModel = require("../../models/Company");
require('dotenv').config()
const jwt = require('jsonwebtoken');
const slugify =  require('slugify');

// Function to generate unique slug
const uniqueSlug = async (model, slug) => {
    let newSlug = slug
    let count = 0;
    while (await companyModel.findOne({ slug: newSlug })) { // Problem area
        count++;
        newSlug = `${slug}-${count}`
    }
    return newSlug;
}

// Create Category
// old code 
// exports.create = async (request, response) => {
//     const saveData = request.body;

//     let slug = slugify(request.body.name, {
//         lower: true,
//         strict: true,
//         trim: true
//     });

//     // Generate unique slug
//     saveData.slug = await uniqueSlug(companyModel, slug);

//     if(request.file){
//         saveData.image = request.file.filename; 
//     }

//     try {
//         const insertData = new companyModel(saveData);
//         await insertData.save()
//             .then((result) => {
//                 response.send({
//                     _status: true,
//                     _message: 'Company created successfully',
//                     _data: result
//                 });
//             })
//             .catch((error) => {
//                 const errorMessage = [];
//                 for (let i in error.errors) {
//                     errorMessage.push(error.errors[i].message);
//                 }
//                 response.send({
//                     _status: false,
//                     _message: 'Validation error',
//                     _data: null,
//                     _Error_Message: errorMessage
//                 });
//             });
//     } catch (error) {
//         response.send({
//             _status: false,
//             _message: 'Server error',
//             _data: null
//         });
//     }
// };

// new code 

exports.create = async (req, res) => {
    try {
        const saveData = { ...req.body };

        // Slug generate
        const slug = slugify(saveData.name, {
            lower: true,
            strict: true,
            trim: true
        });
        saveData.slug = await uniqueSlug(companyModel, slug);

        // Image
        if (req.file) {
            saveData.image = req.file.filename;
        }

        // Save
        const insertData = new companyModel(saveData);
        const result = await insertData.save();

        res.send({
            _status: true,
            _message: 'Company created successfully',
            _data: result,
            _image_path: process.env.COMPANY_IMAGE
        });

    } catch (error) {
        // Validation error
        if (error.name === 'ValidationError') {
            const errorMessage = Object.values(error.errors).map(
                err => err.message
            );

            return res.send({
                _status: false,
                _message: 'Validation error',
                _data: null,
                _Error_Message: errorMessage
            });
        }

        res.send({
            _status: false,
            _message: 'Server error',
            _data: null
        });
    }
};

exports.view = async (request, response) => {
    try {
        const addCondition = [{ delete_at: null }];
        const orCondition = [];

        if (request.body?.name?.trim()) {
            const name = new RegExp(request.body.name.trim(), 'i');
            orCondition.push({ name: name });
        }
        if (request.body?.slug?.trim()) {
            const slug = new RegExp(request.body.slug.trim(), 'i');
            orCondition.push({ slug });
          }

        let filter = { $and: addCondition };
        if (orCondition.length > 0) {
            filter.$or = orCondition;
        }

        const currentPage = parseInt(request?.body?.page) || 1;
        const limit = parseInt(request?.body?.limit) || 6;
        const skip = (currentPage - 1) * limit;

        const totalRecords = await companyModel.countDocuments(filter);
        const totalPage = Math.ceil(totalRecords / limit);

        const result = await companyModel.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 }) // sort by _id descending

        if (result.length > 0) {
            response.send({
                _status: true,
                _message: 'Company fetched successfully',
                _pagination: {
                    current_page: currentPage,
                    total_page: totalPage,
                    total_records: totalRecords
                },
                _image_path: process.env.COMPANY_IMAGE,
                _data: result
            });
        } else {
            response.send({
                _status: false,
                _message: 'No record found',
                _data: []
            });
        }
    } catch (error) {
        response.send({
            _status: false,
            _message: 'Something went wrong!',
            _data: null
        });
    }
};

// Update Category via id
exports.update = async (req, res) => {
    try {
      const companyId = req.params._id; // must match route param name
  
      const saveData = { ...req.body };
      if (req.file) saveData.image = req.file.filename;
  
      const result = await companyModel.updateOne(
        { _id: companyId },
        { $set: saveData }
      );
  
      if (result.matchedCount === 0) {
        return res.send({
          _status: false,
          _message: "Company not found",
          _data: null,
        });
      }
  
      res.send({
        _status: true,
        _message: "Company updated successfully",
        _data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        _status: false,
        _message: "Server error",
        _data: null,
      });
    }
  };
  
 
// View Single Category Details
exports.details = async (request, response) => {
    try {
        const result = await companyModel.findById(request.params._id);
        response.send({
            _status: true,
            _message: result ? 'Record fetched' : 'No record found',
            _data: result,
            _image_path: process.env.COMPANY_IMAGE,
        });
    } catch {
        response.send({ _status: false, _message: 'Something went wrong', _data: null });
    }
};