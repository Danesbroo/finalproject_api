const mongoose = require('mongoose');
const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        match: [/^[a-z A-Z]{2,25}$/, 'Please use 2-25 letters only'],
        required: [true, 'Name is Required'],
        validate: {
            validator: async function (v) {
                const name = await this.constructor.findOne({ name: v });
                return !name;
            },
            message: props => `This testimonial is already used`
        }
    },
    image: {
        type: String,
        default: ''
    },
    designation: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: '',
        min: [1, "Minimum value must be greater than 1"],
        max: [5, "Maximum value must be less than 5"]
    },
    order: {
        type: Number,
        default: 0,
        min: [0, "Minimum value must be greater than 0"],
        max: [500, "Maximum value must be less than 500"]
    },

    message: {
        type: String,
        default: '',
        // match: [/^[a-zA-Z ]{5,200}$/, 'Please use 5-200 letters only'],   
      },

    status: {
        type: Boolean,
        default: true
    },

    created_at: {
        type: Date,
        default: Date.now
    },

    updated_at: {
        type: Date,
        default: Date.now
    },

    delete_at: {
        type: Date,
        default: null
    }
});

const testimonialModel = mongoose.model('testimoinals', testimonialSchema);
module.exports = testimonialModel;
