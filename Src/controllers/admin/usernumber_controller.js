const userModel = require("../../models/website/webUser");
require('dotenv').config();

exports.view = async (request, response) => {
    const addCondition = [{ delete_at: null }];
    const orCondition = [];

    let filter = { $and: addCondition };

    if (orCondition.length > 0) {
        filter.$or = orCondition;
    }

    const totalRecords = await userModel.countDocuments(filter);

    const totaluser = await userModel.aggregate([
        {
            $match: filter
        },
        {
            $count: "totaluser"
        }
    ])

    const output = {
        _status: true,
        _message: 'Record fetched successfully',
        _total_records: totalRecords,
        totaluser: totaluser,
    };

    return response.send(output);
};