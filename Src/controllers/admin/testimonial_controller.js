const testimonialModel = require("../../models/Testimonial");
require('dotenv').config()
// 🟩 Create testimonial
exports.create = async (request, response) => {
    const saveData = request.body;
    if(request.file){
        // here if user send image go file otherwise give response in request.body and save name of image.
        saveData.image = request.file.filename; 
    }
    try {
        const insertData = new testimonialModel(saveData);
        await insertData.save()
            .then((result) => {
                response.send({
                    _status: true,
                    _message: 'testimonial created successfully',
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

// 🟨 View All Categories (with pagination and optional filtering)
exports.view = async (request, response) => {
    try {
        const addCondition = [{ delete_at: null }];
        const orCondition = [];

        if (request.body?.name?.trim()) {
            const name = new RegExp(request.body.name.trim(), 'i');
            orCondition.push({ name: name });
        }

        let filter = { $and: addCondition };
        if (orCondition.length > 0) {
            filter.$or = orCondition;
        }

        const currentPage = parseInt(request?.body?.page) || 1;
        const limit = parseInt(request?.body?.limit) || 5;
        const skip = (currentPage - 1) * limit;

        const totalRecords = await testimonialModel.countDocuments(filter);
        const totalPage = Math.ceil(totalRecords / limit);

        const result = await testimonialModel.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 }) // sort by _id descending

        if (result.length > 0) {
            response.send({
                _status: true,
                _message: 'testimonial fetched successfully',
                _pagination: {
                    current_page: currentPage,
                    total_page: totalPage,
                    total_records: totalRecords
                },
                _image_path: process.env.TESTIMONIAL_IMAGE,
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
        console.error('Error in view controller:', error.message);
        response.status(500).send({
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
    await testimonialModel.updateOne(
        { _id: request.params.id },
        { $set: saveData }
    )
        .then((result) => {
            response.send({
                _status: true,
                _message: 'testimonial updated successfully',
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
    await testimonialModel.findById(request.body.id)
        .then((result) => {
            response.send({
                _status: true,
                _message: result ? 'Record fetched' : 'No record found',
                _data: result,
                _image_path: process.env.TESTIMONIAL_IMAGE,
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
    await testimonialModel.updateMany(
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
    await testimonialModel.updateMany(
        { _id: { $in: request.body.id } },// it make more short code
        { $set: { delete_at: Date.now() } }
    )
        .then((result) => {
            response.send({
                _status: true,
                _message: 'Testimonial is deleted ',
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
