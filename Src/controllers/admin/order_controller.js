
const orderModel = require("../../models/Order");
require('dotenv').config()

// View All slider (with pagination and optional filtering)
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
        const limit = parseInt(request?.body?.limit) || 10;
        const skip = (currentPage - 1) * limit;

        const totalRecords = await orderModel.countDocuments(filter);
        const totalPage = Math.ceil(totalRecords / limit);

        const result = await orderModel.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 }) // sort by _id descending

        if (result.length > 0) {
            response.send({
                _status: true,
                _orderId: result.order_number,
                _message: 'Record fetched successfully',
                _pagination: {
                    current_page: currentPage,
                    total_page: totalPage,
                    total_records: totalRecords
                },
                _image_path: process.env.PRODUCT_IMAGE,
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
        response.status(500).send({
            _status: false,
            _message: 'Something went wrong!',
            _data: null
        });
    }
};

//  Record Deleteted
exports.decompose = async (request, response) => {
    await orderModel.updateMany({
        _id: {
            $in: request.body._id
        }
    }, {
        $set: {
            delete_at: Date.now() 
        }
    })
        .then((result) => {
            var output = {
                _status: true,
                _message: 'Order deleted successfully',
                _data: result,
            }
            response.send(output);
        })
        .catch(() => {
            var output = {
                _status: false,
                _message: 'Something Went wrong',
                _data: null,
            }
            response.send(output);
        })

};
