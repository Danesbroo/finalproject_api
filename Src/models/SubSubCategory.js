// const mongoose = require('mongoose');

// const subSubCategorySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     match: [/^[a-zA-Z ]{2,25}$/, 'Please use 2-25 letters only'],
//     required: [true, 'Name is required'],
//     trim: true
//   },

//   // Link to Category (grandparent)
//   grandParent_Id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'categories',   // use your actual Category model name
//     required: true
//   },

//    // Link to Category (grandparent)
//    grandParent_Ids: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'categories',   // use your actual Category model name
//     required: true
//   }],

//   // Link to SubCategory (parent)
//   parent_Id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'sub-categories',  // use your actual SubCategory model name
//     required: true
//   },
//    // Link to SubCategory (parent)
//    parent_Ids: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'sub-categories',  // use your actual SubCategory model name
//     required: true
//   }],
//   product_ids : [{
//     type: String,
//     ref: 'products',
//     // required: [true, 'Please enter product Name'];
//     default: []
// }],
//   slug: {
//     type: String,
//     default: ''
//   },
//   image: {
//     type: String,
//     default: ''
//   },

//   order: {
//     type: Number,
//     default: 0,
//     min: [0, "Minimum value must be greater than 0"],
//     max: [500, "Maximum value must be less than 500"]
//   },

//   status: {
//     type: Boolean,
//     default: true
//   },

//   delete_at: {
//     type: Date,
//     default: null
//   }

// }, { timestamps: true });  // adds createdAt, updatedAt automatically

// const SubSubCategory = mongoose.model('SubSubCategory', subSubCategorySchema);
// module.exports = SubSubCategory;

// new api
const mongoose = require('mongoose');
const slugify = require('slugify');

const subSubCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  parent_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'sub-categories', required: true },
  grandParent_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
  image: { type: String, default: '' },
  slug: { type: String, unique: true },
  order: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
  delete_at: { type: Date, default: null }
}, { timestamps: true });

subSubCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('SubSubCategory', subSubCategorySchema);

