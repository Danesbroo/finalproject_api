const mongoose = require('mongoose');
const sliderSchema = new mongoose.Schema({
    name : {
        type: 'string',
        match: [/^[a-z A-Z]{2,25}$/, 'Please select correct letter or number or space'], //for custom error message
        required: [true, 'Name is Required'],
        validate:{
            validator : async function(v){
                const name = await this.constructor.findOne({name: v});
                return ! name;
            },
            message: props=>  `This Slider name is already used` // this function is use to check for double post we can use this funtion anywere if needed
        }
    },
    order : {
        type: Number,
        default: 0,
        min: [0,"Minimum value Must be grater than 0"], // it should lower case
        max: [500," Maximum value Must be less than 500"]// it should lowercase
    },
    image : {
        type: String,
        default: ''
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
 const sliderModel = mongoose.model('sliders', sliderSchema);
 module.exports = sliderModel;