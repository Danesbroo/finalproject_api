const productModel = require("../../models/Product");
require('dotenv').config();

exports.view = async (request, response) => {
    const addCondition = [{ delete_at: null }];
    const orCondition = [];

    let filter = { $and: addCondition };

    if (orCondition.length > 0) {
        filter.$or = orCondition;
    }

    const totalRecords = await productModel.countDocuments(filter);

    const totalorder = await productModel.aggregate([
        {
            $match: filter
        },
        {
            $count: "totalorder"
        }
    ])

    const totalAmountData = await productModel.aggregate([
        {
            $match: filter
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$net_amount" } // to find total amount of all orders
            }
        }
    ]);

    const output = {
        _status: true,
        _message: 'Record fetched successfully',
        _total_records: totalRecords,
        totalorder: totalorder,
        totalAmount: totalAmountData
    };

    return response.send(output);
};