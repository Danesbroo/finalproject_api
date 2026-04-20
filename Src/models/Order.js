const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    user_id : {
        type: String,        
        required: [true, "User Id is Required"],
        ref: 'users'
    },
    stripe_payment_id: {
        type: String,
        default: ""
    },
    order_number: {
        type: String,
        default: ""
    },
    order_date: {
        type: Date,
        default: Date.now()
    },
    Shipping_address: {
        type: String,
        default: ""
    },
    billing_address: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        default: ""
    },
     email: {
        type: String,
        default: ""
    },
     mobile_number: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ""
    },
     state: {
        type: String,
        default: ""
    },
     city: {
        type: String,
        default: ""
    },
    productInfo: {
        type: Array,
        default: []
    },
    total_amount: {
        type: Number,
        default: 0
    },
    discount_amount: {
        type: Number,
        default: 0
    },
    net_amount: {
        type: Number,
        default: 0
    },
    payment_status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    order_status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending"
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
 const orderModel = mongoose.model('orders', orderSchema);
 module.exports = orderModel;