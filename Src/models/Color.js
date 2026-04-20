const mongoose = require('mongoose');
const colorSchema = new mongoose.Schema({
    name : {
        type: 'string',
        match: [/^[a-z A-Z]{2,15}$/, 'Please select correct letter or number or space'], //for custom error message
        required: [true, 'Name is Required'],
        validate:{
            validator : async function(v){
                const name = await this.constructor.findOne({name: v});
                return ! name;
            },
            message: props=>  `This color name is already used` // this function is use to check for double post we can use this funtion anywere if needed
        }
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true 
    },
    code : {
        type: 'string',
        required: [true, 'Code is Required'], // this field is necessary to input
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
 const colorModel = mongoose.model('colors', colorSchema);
 module.exports = colorModel;