const mongoose = require('mongoose');
const FaqSchema = new mongoose.Schema({
    question : {
        type: 'string',
        required: [true, 'Question is Required'],
    },
    answer : {
        type: 'string', //for custom error message
        required: [true, 'Answer is Required'],
    },
    status : {
        type: Boolean,
        default: true
    },
    order : {
        type: Number,
        default: 0,
        min: [0,"Minimum value Must be grater than 0"], // it should lower case
        max: [500," Maximum value Must be less than 500"]// it should lowercase
    },
    created_at : {
        type: Date,
        default: Date.now()
    },
    updated_at : {
        type: Date,
        default: Date.now()// for current date
    },
    delete_at : {
        type: Date,
        default: ''
    },

});
 const FaqModel = mongoose.model('faqs', FaqSchema);
 module.exports = FaqModel;