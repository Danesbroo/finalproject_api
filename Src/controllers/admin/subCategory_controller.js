const subCategoryModel = require("../../models/SubCategory");
var slugify = require('slugify')

const uniqueSlug = async(model, slug)=>{
    let newSlug = slug
    let count = 0;
    while(await model.findOne({slug: newSlug})){
        count++;
        newSlug = `${slug}-${count}`
    }
     return newSlug;   
}

exports.create = async (request, response) => {

    var saveData = request.body;

    let slug = slugify(request.body.name, {
        replacement: '-',
        remove: undefined, 
        lower: true,  
        strict: true, 
        locale: 'vi',  
        trim: true
    })
     saveData.slug =  await uniqueSlug(subCategoryModel, slug);
    try {
        const insertData = new subCategoryModel(saveData);
        if (request.file) {
            insertData.image = request.file.filename; // here if user send image go file otherwise give response in request.body and save name of image.
        }
        await insertData.save()
            .then((result) => {
                var output = {
                    _status: true,
                    _message: 'Sub_category created Sucessfully',
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
        const addCondition = [{ delete_at: null }];
        const orCondition = [];

        // Filter by name or code
        if (request.body?.name && request.body.name.trim() !== '') {
            const name = new RegExp(request.body.name.trim(), 'i');
            orCondition.push({ name: name }, { code: name });
        }

        // Filter by parent_Id (independent of name)
        if (request.body?.parent_Id && request.body.parent_Id.trim() !== '') {
            addCondition.push({ parent_Id: request.body.parent_Id });
        }

        let filter = { $and: addCondition };
        if (orCondition.length > 0) {
            filter.$or = orCondition;
        }

        // 2. Pagination
        const currentPage = parseInt(request?.body?.page) || 1; // if
        const limit = parseInt(request?.body?.limit) || 20;
        const skip = (currentPage - 1) * limit;

        // 3. Count total records
        const totalRecords = await subCategoryModel.countDocuments(filter);
        const totalPage = Math.ceil(totalRecords / limit);

        // 4. Fetch paginated data
        subCategoryModel.find(filter)
            .select('_id name parent_Id image order status') // select only specific fields to return
            .populate('parent_Id', 'name') // populate parent_Id with only the name field from categories collection
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 })
            .then((result) => {
                if (result.length > 0) {
                    response.send({
                        _status: true,
                        _message: 'Record view successfully',
                        _pagination: {
                            current_page: currentPage,
                            total_page: totalPage,
                            total_records: totalRecords,
                        },
                        _data: result,
                        _image_path: process.env.SUBCATEGORY_IMAGE,
                    });
                } else {
                    response.send({
                        _status: true,
                        _message: 'No record found',
                        _data: [],
                    });
                }
            })
            .catch((err) => {
                response.send({
                    _status: false,
                    _message: 'Something Went Wrong !!',
                    _data: '',
                });
            });

    } catch (error) {
        console.error('Error in view controller:', error.message);
        response.status(500).send({
            _status: false,
            _message: 'Something went wrong!',
            _data: null,
        });
    }
};
// exports.update = async (request, response) => {
//     // const data = {
//     //     name: request.body.name, // we can use instead of below
//     //     code: request.body.code,
//     // }
//     await subCategoryModel.updateOne({
//         _id: request.params.id // use to grap id from user
//     }, {

//         $set: saveData
//     })
//         .then((result) => {
//             var output = {
//                 _status: true,
//                 _message: 'Record update Sucessfully',
//                 _data: result,
//             }
//             response.send(output);
//         })
//         .catch(() => {
//             var output = {
//                 _status: false,
//                 _message: 'Something Went wrong',
//                 _data: null,
//             }
//             response.send(output);
//         })

// };
exports.update = async (request, response) => {
    try {
        const saveData = { ...request.body }; // copy body data

        if (request.file) {
            saveData.image = request.file.filename; // update image if new one uploaded
        }

        const result = await subCategoryModel.updateOne(
            { _id: request.params.id }, // find by id
            { $set: saveData }
        );

        if (result.modifiedCount > 0) {
            response.send({
                _status: true,
                _message: 'Record updated successfully',
                _data: result,
            });
        } else {
            response.send({
                _status: false,
                _message: 'No changes made or record not found',
                _data: result,
            });
        }

    } catch (error) {
        console.error("Update Error:", error.message);
        response.send({
            _status: false,
            _message: 'Something went wrong while updating',
            _data: null,
        });
    }
};

exports.details = async (request, response) => {
    await subCategoryModel.findById(request.body.id) // this is the alternative method of details function special use to find specific product which user select
        .then((result) => {
            if (result) {
                var output = {
                    _status: true,
                    _message: 'Record fetched',
                    _data: result,
                    _image_path: process.env.SUBCATEGORY_IMAGE, // this is the path of image which we set in .env file
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
    await subCategoryModel.updateMany(
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
    await subCategoryModel.updateMany({
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