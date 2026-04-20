// const mongoose = require('mongoose');

// // Subcategory schema (same collection)
// const subCategorySchema = new mongoose.Schema({
//     name: {
//         type: String,
//         match: [/^[a-z - A-Z]{2,25}$/, 'Please use 2-25 letters only'],
//         required: [true, 'Parent Category is Required'],
//     },
//     parent_Id:{
//         type: String,
//         ref: 'categories', // for single entry
//         required: true
//     },
//     parent_category_Ids:[{
//         type: String,
//         ref: 'categories',
//         required: [true, 'Please enter categaries Name'] // for multiple entry
//     }],
//     product_ids : [{
//         type: String,
//         ref: 'products',
//         // required: [true, 'Please enter product Name'];
//         default: []
//     }],
//     slug: {
//         type: String,
//         default: ''
//     }, 
//     image: {
//         type: String,
//         default: ''
//     }, 
//     order: {
//         type: Number,
//         default: 0,
//         min: [0, "Minimum value must be greater than 0"],
//         max: [500, "Maximum value must be less than 500"]
//     },

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

// const subCategoryModel = mongoose.model('sub-categories', subCategorySchema);
// module.exports = subCategoryModel;

// new api 
const mongoose = require('mongoose');
const slugify = require('slugify');

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  parent_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
  image: { type: String, default: '' },
  slug: { type: String, unique: true },
  order: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
  delete_at: { type: Date, default: null }
}, { timestamps: true });

subCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('sub-categories', subCategorySchema);
