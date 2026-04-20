const categoryModel = require("../../models/Category");
require('dotenv').config()
const slugify =  require('slugify');
// 🔸 Function to generate unique slug
const uniqueSlug = async (model, slug) => {
    let newSlug = slug
    let count = 0;
    while (await model.findOne({ slug: newSlug })) { // ⚠️ Problem area
        count++;
        newSlug = `${slug}-${count}`
    }
    return newSlug;
}

// 🟩 Create Category
exports.create = async (request, response) => {
    const saveData = request.body;

    let slug = slugify(request.body.name, {
        lower: true,
        strict: true,
        trim: true
    });

    // 🔸 Generate unique slug
    saveData.slug = await uniqueSlug(categoryModel, slug);

    if(request.file){
        saveData.image = request.file.filename; 
    }

    try {
        const insertData = new categoryModel(saveData);
        await insertData.save()
            .then((result) => {
                response.send({
                    _status: true,
                    _message: 'Category created successfully',
                    _data: result
                });
            })
            .catch((error) => {
                const errorMessage = [];
                for (let i in error.errors) {
                    errorMessage.push(error.errors[i].message);
                }
                response.send({
                    _status: false,
                    _message: 'Validation error',
                    _data: null,
                    _Error_Message: errorMessage
                });
            });
    } catch (error) {
        response.send({
            _status: false,
            _message: 'Server error',
            _data: null
        });
    }
};

// const uniqueSlug = async (model, slug) => {
//     let newSlug = slug
//     let count = 0;
//     while (await model.findOne({ slug: newSlug })) { // here in database we check the slug is already exist or not
//         count++;
//         newSlug = `${slug}-${count}`
//     }
//     return newSlug;
// }
// // 🟩 Create Category
// exports.create = async (request, response) => {
//     const saveData = request.body;
//     let slug = slugify(request.body.name, {
//         lower: true,
//         strict: true,
//         trim: true
//     })
//     saveData.slug = await uniqueSlug(categoryModel, slug);
//     if(request.file){
//         // here if user send image go file otherwise give response in request.body and save name of image.
//         saveData.image = request.file.filename; 
//     }
//     try {
//         const insertData = new categoryModel(saveData);
//         await insertData.save()
//             .then((result) => {
//                 response.send({
//                     _status: true,
//                     _message: 'Category created successfully',
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

// 🟨 View All Categories (with pagination and optional filtering)
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

        const totalRecords = await categoryModel.countDocuments(filter);
        const totalPage = Math.ceil(totalRecords / limit);

        const result = await categoryModel.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 }) // sort by _id descending

        if (result.length > 0) {
            response.send({
                _status: true,
                _message: 'Category list fetched successfully',
                _pagination: {
                    current_page: currentPage,
                    total_page: totalPage,
                    total_records: totalRecords
                },
                _image_path: process.env.CATEGORY_IMAGE,
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

// 🟧 Update Category
exports.update = async (request, response) => {
    const saveData = request.body;
    if(request.file){
        // here if user send image go file otherwise give response in request.body
        saveData.image = request.file.filename; // open image key in object and put value of filename
    }else {
        // if user not send image then we don't want to change image so we don't put image key in object.
        delete saveData.image; // this line is use to delete image key from object.
    }
    await categoryModel.updateOne(
        { _id: request.params.id },
        { $set: saveData }
    )
        .then((result) => {
            response.send({
                _status: true,
                _message: 'Category updated successfully',
                _data: result
            });
        })
        .catch(() => {
            response.send({
                _status: false,
                _message: 'Something went wrong',
                _data: null
            });
        });
};

// 🟫 View Single Category Details
exports.details = async (request, response) => {
    await categoryModel.findById(request.body.id)
        .then((result) => {
            response.send({
                _status: true,
                _message: result ? 'Record fetched' : 'No record found',
                _data: result,
                _image_path: process.env.CATEGORY_IMAGE,
            });
        })
        .catch(() => {
            response.send({
                _status: false,
                _message: 'Something went wrong',
                _data: null
            });
        });
};

// ⬛ Toggle Status (Active/Inactive)
exports.changeStatus = async (request, response) => {
    await categoryModel.updateMany(
        { _id: { $in: request.body.id } },
        [{ $set: { status: { $not: "$status" } } }]
    )
        .then((result) => {
            response.send({
                _status: true,
                _message: 'Status updated',
                _data: result
            });
        })
        .catch(() => {
            response.send({
                _status: false,
                _message: 'Something went wrong',
                _data: null
            });
        });
};

//  Soft Delete
exports.decompose = async (request, response) => {
    await categoryModel.updateMany(
        { _id: { $in: request.body.id } },// it make more short code
        { $set: { delete_at: Date.now() } }
    )
        .then((result) => {
            response.send({
                _status: true,
                _message: 'Category deleted (soft)',
                _data: result
            });
        })
        .catch(() => {
            response.send({
                _status: false,
                _message: 'Something went wrong',
                _data: null
            });
        });
};
