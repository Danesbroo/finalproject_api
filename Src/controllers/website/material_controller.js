const materialModel = require("../../models/Material");

exports.view = async (request, response) => {
    try {
        // 1. Build filter
        const addCondition = [{ delete_at: null }]; // select only non-deleted
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
        const totalRecords = await materialModel.countDocuments(filter); // count records after filter
        const totalPages = Math.ceil(totalRecords / limit);

        // 4. Fetch paginated data
        const result = await materialModel.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 }); // sort by latest first

        // 5. Send response
        if (result.length > 0) {
            response.send({
                _status: true,
                _message: 'Record fetched successfully',
                _pagination: {
                    current_page: currentPage,
                    total_pages: totalPages,
                    total_records: totalRecords,
                },
                _data: result,
            });
        } else {
            response.send({
                _status: true,
                _message: 'No record found',
                _pagination: {
                    current_page: currentPage,
                    total_pages: totalPages,
                    total_records: totalRecords,
                },
                _data: [],
            });
        }
    } catch (error) {
        console.error('Error in view controller:', error.message);
        response.send({
            _status: false,
            _message: 'Something went wrong!',
            _data: null,
        });
    }
};
