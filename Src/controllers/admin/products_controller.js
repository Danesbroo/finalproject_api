const productModel = require('../../models/Product');
const categoryModel = require('../../models/Category');
const subCategoryModel = require('../../models/SubCategory');
const subSubCategoryModel = require('../../models/SubSubCategory');
var slugify = require('slugify');

const uniqueSlug = async (model, slug) => {
    let newSlug = slug;
    let count = 0;
    while (await model.findOne({ slug: newSlug })) {
        count++;
        newSlug = `${slug}-${count}`;
    }
    return newSlug;
};

exports.create = async (request, response) => {

    let saveData = request.body;

    // ======================================
    //  Generate unique product slug
    // ======================================
    let slug = slugify(request.body.name, {
        lower: true,
        strict: true,
        trim: true
    });
    saveData.slug = await uniqueSlug(productModel, slug);

    // ======================================
    //  Slugify Material
    // ======================================
    if (request.body.material) {
        // if user sends single material
        saveData.material_slug = slugify(request.body.material, {
            lower: true,
            strict: true,
            trim: true,
        });
    }

    // if user sends array of materials
    if (Array.isArray(request.body.material)) {
        saveData.material_slug = request.body.material.map(mat =>
            slugify(mat, { lower: true, strict: true, trim: true })
        );
    }

    // ======================================
    // 🔥 Slugify Color
    // ======================================
    if (request.body.color) {
        saveData.color_slug = slugify(request.body.color, {
            lower: true,
            strict: true,
            trim: true,
        });
    }

    if (Array.isArray(request.body.color)) {
        saveData.color_slug = request.body.color.map(col =>
            slugify(col, { lower: true, strict: true, trim: true })
        );
    }

    // ======================================
    // 🔥 Handle Image Uploads
    // ======================================
    if (request.files && request.files.image) {
        saveData.image = request.files.image[0].filename;
    }

    if (request.files && request.files.images) {
        saveData.images = request.files.images.map(file => file.filename);
    }

    // ======================================
    // 🔥 Insert Product
    // ======================================
    try {
        const insertData = new productModel(saveData);
        await insertData.save()
            .then(async (result) => {

                // Update Category Product IDs
                if (request.body.parent_category_ids) {
                    await categoryModel.updateMany(
                        { _id: request.body.parent_category_ids },
                        { $push: { product_ids: { $each: [result._id] } } }
                    );
                }

                // Update Subcategory Product IDs
                if (request.body.sub_category_ids) {
                    await subCategoryModel.updateMany(
                        { _id: request.body.sub_category_ids },
                        { $push: { product_ids: { $each: [result._id] } } }
                    );
                }

                // Update Sub-sub-category Product IDs
                if (request.body.sub_sub_category_ids) {
                    await subSubCategoryModel.updateMany(
                        { _id: request.body.sub_sub_category_ids },
                        { $push: { product_ids: { $each: [result._id] } } }
                    );
                }

                response.send({
                    _status: true,
                    _message: 'Product created successfully',
                    _data: result
                });
            })
            .catch((error) => {
                const errorMessage = [];
                for (i in error.errors) {
                    errorMessage.push(error.errors[i].message);
                }

                response.send({
                    _status: false,
                    _message: 'Validation Error',
                    _data: null,
                    _Error_Message: errorMessage
                });
            });

    } catch (error) {
        response.send({
            _status: false,
            _message: 'Something went wrong',
            _data: null
        });
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
        if (request.body?.parent_category_ids && request.body.parent_category_ids !== '') {
            addCondition.push({ parent_category_ids: request.body.parent_category_ids });
        }
        // Filter by parent_Id (independent of name)
        if (request.body?.sub_category_ids && request.body.sub_category_ids!== '') {
            addCondition.push({ sub_category_ids: request.body.sub_category_ids });
        }

        let filter = { $and: addCondition };
        if (orCondition.length > 0) {
            filter.$or = orCondition;
        }

        // 2. Pagination
        const currentPage = parseInt(request?.body?.page) || 1; // if
        const limit = parseInt(request?.body?.limit) || 10;
        const skip = (currentPage - 1) * limit;

        // 3. Count total records
        const totalRecords = await productModel.countDocuments(filter);
        const totalPage = Math.ceil(totalRecords / limit);

        // 4. Fetch paginated data
        productModel.find(filter)
            .populate('material_ids', 'name material_slug') // to use populate of any material or color we must kept the id of material or color in create api then we can use it.
            .populate('color_ids', 'name color_slug')
            .populate('parent_category_ids', 'name')
            .populate('sub_category_ids', 'name')
            .populate('sub_sub_category_ids', 'name')
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
                            total_pages: totalPage,
                            total_records: totalRecords,
                        },
                        _data: result,
                        _image_path: process.env.PRODUCT_IMAGES,
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
        response.send({
            _status: false,
            _message: 'Something went wrong!',
            _data: null,
        });
    }
};

exports.update = async (request, response) => {

    var saveData = request.body;

    let slug = slugify(request.body.name, {
        lower: true,
        strict: true,
        trim: true
    })
    saveData.slug = await uniqueSlug(productModel, slug);


    if (request.files && request.files.image) { // for single image upload
        saveData.image = request.files.image[0].filename; // here if user send image go file otherwise give response in request.body and save name of image.
    }
    if (request.files && request.files.images) {
        saveData.images = request.files.images.map(file => file.filename);// please only return value of file.filename
    }
    try {
        const result = await productModel.updateOne(
            { _id: request.params.id }, // find by id
            { $set: saveData }
        )
            .then(async (result) => {
                if (request.body?.parent_category_ids && request.body.parent_category_ids != '') {
                    await categoryModel.updateMany({
                        _id: request.body.parent_category_ids
                    }, {
                        $push: { product_ids: { $each: [result._id] } }  // go mongoose and populate section inside populate setting section we can this code.
                    })
                }
                if (request.body?.sub_category_ids && request.body.sub_category_ids != '') {
                    await subCategoryModel.updateMany({
                        _id: request.body.sub_category_ids
                    }, {
                        $push: { product_ids: { $each: [result._id] } }  // go mongoose and populate section inside populate setting section we can this code.
                    })
                }
                if (request.body.sub_sub_category_ids != undefined && request.body.sub_sub_category_ids != '') {
                    await subSubCategoryModel.updateMany({
                        _id: request.body.sub_sub_category_ids
                    }, {
                        $push: { product_ids: { $each: [result._id] } }  // go mongoose and populate section inside populate setting section we can this code.
                    })
                }

                let ouput = {
                    _status: true,
                    _message: 'Record updated successfully',
                    _data: result,
                }
                response.send(ouput);
            })
            .catch((error) => {
                const errorMessage = [];
                for (i in error.errors) {
                    errorMessage.push(error.errors[i].message);
                };
            })

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
    await productModel.findById(request.body.id) // this is the alternative method of details function special use to find specific product which user select
        .then((result) => {
            if (result) {
                var output = {
                    _status: true,
                    _message: 'Record fetched',
                    _data: result,
                    _image_path: process.env.PRODUCT_IMAGES, // this is the path of image which we set in .env file
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

exports.productDetails = async (request, response) => {
    await productModel.findById(request.body.id) // this is the alternative method of details function special use to find specific product which user select
        .populate('material_ids', 'name') // to use populate of any material or color we must kept the id of material or color in create api then we can use it.
        .populate('color_ids', 'name')
        .populate('parent_category_ids', 'name')
        .populate('sub_category_ids', 'name')
        .populate('sub_sub_category_ids', 'name')
        .then((result) => {
            if (result) {
                var output ={
                    _status: true,
                    _message: 'Record fetched',
                    _data: result,
                    _image_path: process.env.PRODUCT_IMAGES, // this is the path of image which we set in .env file
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
    await productModel.updateMany(
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
    await productModel.updateMany({
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