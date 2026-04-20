
const FaqModel = require("../../models/Faq");

exports.view = async (request, response) => {
       
    try {
        // 1. Build filter
        const addCondition = [{ delete_at: null }]; // please select these which delete_null
        const orCondition = [];

        if (request.body?.name && request.body.name.trim() !== '') {
            const name = new RegExp(request.body.name.trim(), 'i');
            orCondition.push({ name: name }, { code: name });
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
        const totalRecords = await FaqModel.countDocuments(filter);
        const totalPage = Math.ceil(totalRecords / limit);

        // 4. Fetch paginated data
        const result = await FaqModel.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({_id: -1 })// we can sort by order also

        // 5. Send response
        .then((result)=>{
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

