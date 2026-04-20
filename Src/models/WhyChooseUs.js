const mongoose = require('mongoose');

const whyChooseUsSchema = new mongoose.Schema({
    title: {
        type: String,
        match: [/^[a-z 0-9 %/? A-Z]{2,25}$/, 'Please use 2-45 letters only'],
        required: [true, 'Name is Required'],
        validate: {
            validator: async function (v) {
                const name = await this.constructor.findOne({ name: v });
                return !name;
            },
            message: props => `This category name is already used`
        }
    },
    image: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0,
        min: [0, "Minimum value must be greater than 0"],
        max: [500, "Maximum value must be less than 500"]
    },
    discription: {
        type: String,
        default: ''
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

const whyChooseUsModel = mongoose.model('why-choose-us', whyChooseUsSchema);
module.exports = whyChooseUsModel;
