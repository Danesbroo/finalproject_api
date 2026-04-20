const testimonialModel = require("../../models/Testimonial");
require('dotenv').config()

//  View All Categories (with pagination and optional filtering)
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


