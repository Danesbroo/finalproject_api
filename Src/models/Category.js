// const mongoose = require('mongoose');

// // Category + Subcategory schema (same collection)
// const categorySchema = new mongoose.Schema({
//     name: {
//         type: String,
//         match: [/^[a-zA-Z]{2,25}$/, 'Please use 2-25 letters only'],
//         required: [true, 'Name is Required'],
//         // validate: {
//         //     validator: async function (v) {
//         //         const name = await this.constructor.findOne({ name: v });
//         //         return !name;
//         //     },
//         //     message: props => `This category name is already used`
//         // }
//     },
//     image: {
//         type: String,
//         default: ''
//     },
//     slug: {
//         type: String,
//         default: ''
//     },
//     order: {
//         type: Number,
//         default: 0,
//         min: [0, "Minimum value must be greater than 0"],
//         max: [500, "Maximum value must be less than 500"]
//     },
    
//     product_ids : [{
//         type: String,
//         ref: 'products',
//         // required: [true, 'Please enter product Name'];
//         default: []
//     }],

//     status: {
//         type: Boolean,
//         default: true
//     },

//     created_at: {
//         type: Date,
//         default: Date.now
//     },

//     updated_at: {
//         type: Date,
//         default: Date.now
//     },

//     delete_at: {
//         type: Date,
//         default: null
//     }
// });

// const categoryModel = mongoose.model('categories', categorySchema);
// module.exports = categoryModel;

// new api 
const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Category name is required'],
    minlength: 2,
    maxlength: 50
  },
  image: { 
    type: String, 
    default: '' 
  },
  slug: { 
    type: String, 
    unique: true 
  },
  order: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 500 
  },
  status: { 
    type: Boolean, 
    default: true 
  },
  delete_at: { 
    type: Date, 
    default: null 
  },
}, { timestamps: true });

// 👉 Auto-slug before save
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('categories', categorySchema);
