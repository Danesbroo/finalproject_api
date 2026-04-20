const mongoose = require("mongoose");
const slugify = require("slugify");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Company name is required"],
      minlength: 2,
      maxlength: 50,
    },
    image: {
      type: String,
      default: "",
    },
    mobile_number: {
      type: String, // ✅ FIXED
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    google_map_location: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    status: {
      type: Boolean,
      default: true,
    },
    delete_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Auto slug
companySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("companies", companySchema);
