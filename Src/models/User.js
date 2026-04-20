const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: [true, 'First Name is Required'],
    },
    mname: {
        type: String,
        default: ''
    },
    lname: {
        type: String,
        required: [true, 'Last Name is Required'],
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
    email: {
        type: String,
        required: [true, 'Email is Required'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is Required']
    },
    mobile_number: {
        type: String,
        required: [true, 'Mobile number is Required'],
        match: [/^[0-9]{8,15}$/, 'Please fill a valid mobile number']
    },
    address: {
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

const userModel = mongoose.model('users', userSchema);
module.exports = userModel;
