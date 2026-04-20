const enquiryModel = require("../../models/Enquiry");

exports.create = async (request, response) => {
    try {
      
        const insertData = new enquiryModel(request.body);
        await insertData.save()
            .then((result) => {
                var output = {
                    _status: true,
                    _message: 'Record created Sucessfully',
                    _data: result,
                }
                response.send(output);
            })
            .catch((error) => {
                const errorMessage = [];
                for(i in error.errors){
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

