const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    name: {
        type: String, //
        match: [/^[a-z A-Z]{2,25}$/, 'Please select correct letter or number or space'],
        required: [true, 'Name is Required'],
        validate: {
            validator: async function (v) {
                const name = await this.constructor.findOne({ name: v });
                return !name;
            },
            message: props => `This name is already used`
        }
    },
    email: {
        type: String, // ✅ already correct
        required: [true, 'Email is Required'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    mobile_number: {
        type: Number,
        default: ''
    },
    subject: {
        type: String,
        required: [true, "Subject is Required" ],
        match: [/^[a-zA-Z ]{5,30}$/, 'Please use 5-30 letters only'],
        default: '',
         
    },
    message: {
        type: String,
        required: [ "Message is Required" ],
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
        default: null // ✅ fixed
    }
});

const enquiryModel = mongoose.model('enquiries', enquirySchema);
module.exports = enquiryModel;
