const mongoose = require('mongoose');

// Category + Subcategory schema (same collection)
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        match: [/^[a-z A-Z]{2,25}$/, 'Please use 2-25 letters only'],
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
    images: {
        type: Array,
        default: []
    },
    slug: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0,
        min: [0, "Minimum value must be greater than 0"],
        max: [500, "Maximum value must be less than 500"]
    },

    actual_price: {
        type: Number,
        default: 0,
        min: [0, "Minimum value must be greater than 0"],
        max: [2000, "Maximum value must be less than 500"]
    },

    sale_price: {
        type: Number,
        default: 0,
        min: [0, "Minimum value must be greater than 0"],
        max: [2000, "Maximum value must be less than 500"]
    },

    // product_type: {  // this is only for when single entry of product in these option
    //     type : Number,
    //     required:[true, 'product is required'],

    //     // enum: ['simple', 'variable', 'grouped'], not good practice
    //     default: 1 //1- featured, 2- New arrivals, 3 - Onsale
    // },
    is_featured: {
        type: Boolean,
        default: false,
    },

    is_new_arrival: {
        type: Boolean,
        default: false,
    },

    is_trending: {
        type: Boolean,
        default: false,
    },
    is_top_rated: {
        type: Boolean,
        default: false,
    },

    is_up_sell: {
        type: Boolean,
        default: false,
    },
    is_on_sell: {
        type: Boolean,
        default: false,
    },

    is_online_store: {
        type: Boolean,
        default: false,
    },

    is_best_selling: {
        type: Boolean,
        default: false, // 0 - false, 1 - true
    },

    material_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        //required: [true, 'Parent Category is required'],
        ref: 'materials',
        default: []
    }], // when we want to add more than one material please declear it two times  material_ids[] in postman

    color_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Color id is required'],
        ref: 'colors', // please match mongoose db name 
        default: []
    }],

    parent_category_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        //required: [true, 'Parent Category is required'],
        ref: 'categories', // please match mongoose db name 
        default: []
    }],// we just give permission for single entry in admin without client ask for multiple entry.

    sub_category_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        //required: [true, 'Parent Category is required'],
        ref: 'sub-categories', // please match mongoose db name 
        default: []
    }],

    sub_sub_category_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        //required: [true, 'Parent Category is required'],
        ref: 'SubSubCategory', // please match mongoose db name 
        default: []
    }],

    short_description: {
        type : String,
        required : [true, 'Short description is required'],
        default: ''
    },

    long_description: {
        type : String,
        required : [true, 'long description is required'],
        default: ''
    },
    product_code : {
        type : String,
        required : [true, 'Product code is required'],
        match: [/^[a-zA-Z]{2,25}$/, 'Please use 2-25 letters only'],
        default: ''
    },

    stock : {
        type : Number,
        required : [true, 'Stock is required'],
        min : [0, 'Minimum value must be grater than 0'],
        max : [1000, 'Minimum value must be grater than 1000']
    },
    estimate_delevery_days : {
        type : String,
        required : [true, 'Estimate delivery days is required'],
        default : ''// if we don't want to use required we have to put default key
    },
    product_dimension :{
        type :String,
        required : [true, 'Porduct dimension is required']
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

const productModel = mongoose.model('products', productSchema);
module.exports = productModel;
