const countryModel = require("../../models/Country");


exports.create = async (request, response) => {
    try {

        const insertData = new countryModel(request.body);
        await insertData.save()
            .then((result) => {
                var output = {
                    _status: true,
                    _message: 'Country created Sucessfully',
                    _data: result,
                }
                response.send(output);
            })
            .catch((error) => {
                const errorMessage = [];
                for (i in error.errors) {
                    errorMessage.push(error.errors[i].message);
                }

                var output = {
                    _status: false,
                    _message: 'Something Went wrong',
                    _data: null,
                    _Error_Message: errorMessage,
                }
                response.send(output);
            })
    } catch (error) {
        var output = {
            _status: false,
            _message: 'Something Went wrong',
            _data: null,
        }
        response.send(output);

    }

};
exports.view = async (request, response) => {
    try {
        // 1. Build filter
        const addCondition = [{ delete_at: null }]; // please select these which delete_null
        const orCondition = [];

        if (request.body?.name && request.body.name.trim() !== '') {
            const name = new RegExp(request.body.name.trim(), 'i');
            orCondition.push({ name: name });
        }

        let filter = { $and: addCondition };
        if (orCondition.length > 0) {
            filter.$or = orCondition;
        }

        // 2. Pagination
        const currentPage = parseInt(request?.body?.page) || 1;
        const limit = parseInt(request?.body?.limit) || 10;
        const skip = (currentPage - 1) * limit;

        // 3. Count total records
        const totalRecords = await countryModel.countDocuments(filter);
        const totalPage = Math.ceil(totalRecords / limit);

        // 4. Fetch paginated data
        const result = await countryModel.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({_id: -1 })// we can sort by order also

        // 5. Send response
        .then((result)=>{
            if (result.length > 0) {
                response.send({
                    _status: true,
                    _message: 'Country view successfully',
                    _pagination: {
                        current_page: currentPage,
                        total_page: totalPage,
                        total_records: totalRecords,
                    },
                    _data: result,
                });
            } else {
                response.send({
                    _status: true,
                    _message: 'No record found',
                    _data: [],
                });
            }
        })
        .catch((result)=>{
            response.send({
                _status: false,
                _message: 'Something Went Wrong !!',
                _data: ''
            });
        })
        
    } catch (error) {
        console.error('Error in view controller:', error.message);
        response.status(500).send({
            _status: false,
            _message: 'Something went wrong!',
            _data: null,
        });
    }
};
exports.update = async (request, response) => {
    try {
        const result = await countryModel.updateOne(
            { _id: request.params.id }, // if we send id through url we can use params
            { $set: request.body }
        );

        let output;

        if (result.matchedCount === 0) {
            output = {
                _status: false,
                _message: 'No country found with the provided ID.',
                _data: result,
            };
        } else if (result.modifiedCount === 0) {
            output = {
                _status: true,
                _message: 'Country found, but no changes were made (data is identical).',
                _data: result,
            };
        } else {
            output = {
                _status: true,
                _message: 'Country updated successfully.',
                _data: result,
            };
        }

        response.send(output);
    } catch (error) {
        response.send({
            _status: false,
            _message: 'Something went wrong.',
            _data: null,
        });
    }
};
exports.details = async (request, response) => {
    // await colorModel.findOne({
    //     _id : request.body.id
    // })
    await countryModel.findById(request.body.id) // this is the alternative method of details function special use to find specific product which user select
        .then((result) => {
            if (result) {
                var output = {
                    _status: true,
                    _message: 'Record fetched',
                    _data: result,
                }
                response.send(output);
            } else {
                var output = {
                    _status: true,
                    _message: 'No record found',
                    _data: result,
                }
                response.send(output);
            }
        })
        .catch(() => {
            var output = {
                _status: false,
                _message: 'Something went Wrong !',
                _data: null,
            }
            response.send(output);
        })

};
exports.changeStatus = async (request, response) => {
    await countryModel.updateMany(
        { _id: { $in: request.body.id } },  // here $in is use to get id which you send and check it exist in _id or not
        [
            {
                $set: {
                    status: { $not: "$status" } // Toggles the status
                }
            }
        ]
    )
        .then((result) => {
            response.send({
                _status: true,
                _message: 'Change Status Successfully',
                _data: result,
            });
        })
        .catch((err) => {
            response.send({
                _status: false,
                _message: 'Something Went Wrong',
                _data: null,
            });
        });
};
exports.decompose = async (request, response) => {
    await countryModel.updateMany({
        _id: {
            $in: request.body.id
        }
    }, {
        $set: {
            delete_at: Date.now() // here we use date method to seperate the file from the database. all database data has delete_at is null. But this deleted file value has current date.  so we can easy to seperate these value from it
        }
    })
        .then((result) => {
            var output = {
                _status: true,
                _message: 'Record deleted',
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