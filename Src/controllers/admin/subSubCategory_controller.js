const { findOne } = require("../../models/Color");
const subSubCategoryModel = require("../../models/SubSubCategory");
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
// CREATE
exports.create = async (request, response) => {

        const saveData = request.body;

        let slug = slugify(request.body.name, {
            replacement: '-',
            remove: undefined, 
            lower: true,  
            strict: true, 
            locale: 'vi',  
            trim: true
        })
         saveData.slug =  await uniqueSlug(subSubCategoryModel, slug);

    try {
        const insertData = new subSubCategoryModel(saveData); //normally data will come from req.body
        if (request.file) {
            insertData.image = request.file.filename;
        }  // if image uploaded then save filename in db field otherwise send data as req.body only

        const result = await insertData.save();

        response.send({
            _status: true,
            _message: "Data created successfully",
            _data: result,
        });
    } catch (error) {
        response.send({
            _status: false,
            _message: "Something went wrong",
            _data: null,
            _Error_Message: error.message,
        });
    }
};

// VIEW (with pagination + filters)
exports.view = async (request, response) => {

    const addCondition = [{ delete_at: null }];
        const orCondition = [];

        // Filter by name or code
        if (request.body?.name && request.body.name.trim() !== '') {
            const name = new RegExp(request.body.name.trim(), 'i');
            orCondition.push({ name: name }, { code: name });
        }

        // Filter by parent_Id (independent of name)
        if (request.body?.parent_Id && request.body.parent_Id !== '') {
            addCondition.push({ parent_Id: request.body.parent_Id});
        }

        // Filter by grandParent_Id (independent of name)
        if (request.body?.grandParent_Id && request.body.grandParent_Id !== '') {
            addCondition.push({ grandParent_Id: request.body.grandParent_Id});
        }

        let filter = { $and: addCondition };
        if (orCondition.length > 0) {
            filter.$or = orCondition;
        }

        // 2. Pagination
        const currentPage = parseInt(request?.body?.page) || 1; // if
        const limit = parseInt(request?.body?.limit) || 5;
        const skip = (currentPage - 1) * limit;

        // 3. Count total records
        const totalRecords = await subSubCategoryModel.countDocuments(filter);
        const totalPage = Math.ceil(totalRecords / limit);

    await subSubCategoryModel.find(filter) // to avoid deleted data
        .select('_id name image order status grandParent_Id parent_Id _image_path') // select only these fields
        .populate('grandParent_Id', 'name') // populate grandParent_Id with name field from Category model
        .populate('parent_Id', 'name') // populate parent_Id with name field from SubCategory model
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 })
        .then((result) => {
            response.send({
                _status: true,
                _message: result.length ? 'Record fetched' : 'No record found',
                _image_path: process.env.SUB_SUBCATEGORY_IMAGE,
                _pagination: {
                    current_page: currentPage,
                    total_page: totalPage,
                    total_records: totalRecords,
                },
                _data: result,
                
            });
        })
        .catch(() => {
            response.send({
                _status: false,
                _message: 'Something went wrong',
                _data: null
            });
        });
}

// UPDATE
exports.update = async (request, response) => {
    const saveData = request.body;
    if (request.file) {
        // here if user send image go file otherwise give response in request.body
        saveData.image = request.file.filename; // open image key in object and put value of filename
    } else {
        // if user not send image then we don't want to change image so we don't put image key in object.
        delete saveData.image; // this line is use to delete image key from object.
    }
    await subSubCategoryModel.updateOne(
        { _id: request.params.id }, // which use to grab id from url
        { $set: saveData } // which use to set data to db
    )
        .then((result) => {
            response.send({
                _status: true,
                _message: 'Data updated successfully',
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

// DETAILS
exports.details = async (request, response) => {
    await subSubCategoryModel.findOne(
        { _id: request.body.id } // which use to grab id from url
    )
        .then((result) => {
            response.send({
                _status: true,
                _message: result ? 'Record fetched' : 'No record found',
                _image_path: process.env.SUB_SUBCATEGORY_IMAGE,
                _data: result,
                
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

// CHANGE STATUS (single toggle)
exports.changeStatus = async (request, response) => {
    await subSubCategoryModel.updateMany(
        { _id: { $in: request.body.id } }, // it make more short code
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
                _message: 'Status changed successfully',
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
}

// DELETE (soft delete)
exports.decompose = async (request, response) => {
    await subSubCategoryModel.updateMany(
        { _id: { $in: request.body.id } }, // it make more short code
        [{ $set: { delete_at: Date.now() } }] // soft delete
    )
        .then((result) => {
            response.send({
                _status: true,
                _message: 'Data deleted successfully',
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
