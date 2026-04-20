const mongoose = require('mongoose');
const countrySchema = new mongoose.Schema({
    name : {
        type: 'string',
        match: [/^[a-zA-Z]{4,25}$/, 'Please select correct letter or number or space'], //for custom error message
        required: [true, 'Name is Required'],
        validate:{
            validator : async function(v){
                const name = await this.constructor.findOne({name: v});
                return ! name;
            },
            message: props=>  `This Admin name is already used` // this function is use to check for double post we can use this funtion anywere if needed
        }
    },
    order : {
        type: Number,
        default: 0,
        min: [0,"Minimum value Must be grater than 0"], // it should lower case
        max: [500," Maximum value Must be less than 500"]// it should lowercase
    },   
    status : {
        type: Boolean,
        default: true
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
 const countryModel = mongoose.model('countries', countrySchema);
 module.exports = countryModel;