const newsletterModel = require("../../models/Newsletter");

exports.create = async (request, response) => {
    try {
      
        const insertData = new newsletterModel(request.body);
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
