const productModel = require("../../models/Product");
const categoryModel = require("../../models/Category");
const subCategoryModel = require("../../models/SubCategory");
const materialModel = require("../../models/Material");
const colorModel = require("../../models/Color");

/* ================= SORT / FEATURE MAP ================= */
const SORT_BY_MAP = {
  1: { type: "filter", field: "is_featured" },
  2: { type: "filter", field: "is_best_selling" },
  3: { type: "filter", field: "is_top_rated" },
  4: { type: "filter", field: "is_trending" },
  5: { type: "filter", field: "is_online_store" },
  6: { type: "filter", field: "is_new_arrival" },
  7: { type: "sort", value: { name: 1 } },
  8: { type: "sort", value: { name: -1 } },
  9: { type: "sort", value: { sale_price: 1 } },
  10: { type: "sort", value: { sale_price: -1 } },
};

exports.view = async (req, res) => {
  try {
    const body = req.body || {};

    /* ================= RANDOM FEATURE ================= */
    const isRandom = body.random === true || body.random === "true";
    const randomSize =
      body.random_size && Number(body.random_size) > 0
        ? Number(body.random_size)
        : 2; // default 2 random products

    /* ================= PAGINATION ================= */
    const page = body.page && Number(body.page) > 0 ? Number(body.page) : 1;

    let limit;
    if (body.limit === "all") {
      limit = null; // means no limit
    } else if (body.limit && Number(body.limit) > 0) {
      limit = Number(body.limit);
    } else {
      limit = 12; // default
    }

    const skip = limit ? (page - 1) * limit : 0;

    /* ================= BASE FILTER ================= */
    const filter = { delete_at: null };
    let sort = { _id: -1 };

    const FLAGS = [
      "is_featured",
      "is_new_arrival",
      "is_on_sell",
      "is_online_store",
      "is_up_sell",
      "is_best_selling",
      "is_trending",
      "is_top_rated",
      "is_related",
    ];
    FLAGS.forEach((flag) => {
      if (body[flag] === true || body[flag] === "true") {
        filter[flag] = true;
      }
    });

    /* ================= FEATURE FROM URL ================= */
    if (body.feature) {
      filter[body.feature] = true;
    }

    /* ================= SORT / FEATURE DROPDOWN ================= */
    if (body.sort_by && SORT_BY_MAP[body.sort_by]) {
      const rule = SORT_BY_MAP[body.sort_by];
      if (rule.type === "filter") filter[rule.field] = true;
      if (rule.type === "sort") sort = rule.value;
    }

    /* ================= CATEGORY ================= */
    if (body.category) {
      const cats = await categoryModel.find({
        slug: { $in: [].concat(body.category) },
        delete_at: null,
      });
      if (cats.length) {
        filter.parent_category_ids = { $in: cats.map((c) => c._id) };
      }
    }
    /* ================= SUB CATEGORY (ID or SLUG) ================= */
    if (body.sub_category_ids || body.sub) {

      let subCategoryIds = [];

      // 1️⃣ If ID is sent directly
      if (body.sub_category_ids) {
        subCategoryIds = Array.isArray(body.sub_category_ids)
          ? body.sub_category_ids
          : [body.sub_category_ids];
      }

      // 2️⃣ If slug is sent
      if (body.sub) {
        const subs = await subCategoryModel.find({
          slug: { $in: body.sub.split(",") },
          delete_at: null,
        }).select("_id");

        subCategoryIds.push(...subs.map(s => s._id));
      }

      // 3️⃣ Apply filter if we got any IDs
      if (subCategoryIds.length) {
        filter.sub_category_ids = { $in: subCategoryIds };
      }
    }

    /* ================= SUB CATEGORY ================= */
    // if (body.sub) {
    //   const subs = await subCategoryModel.find({
    //     slug: { $in: body.sub.split(",") },
    //     delete_at: null,
    //   });
    //   if (subs.length) {
    //     filter.sub_category_ids = { $in: subs.map((s) => s._id) };
    //   }
    // }

    /* ================= MATERIAL ================= */
    if (body.material) {
      const materials = await materialModel.find({
        slug: { $in: body.material.split(",") },
      });
      if (materials.length) {
        filter.material_ids = { $in: materials.map((m) => m._id) };
      }
    }

    /* ================= COLOR ================= */
    if (body.color) {
      const colors = await colorModel.find({
        slug: { $in: body.color.split(",") },
      });
      if (colors.length) {
        filter.color_ids = { $in: colors.map((c) => c._id) };
      }
    }

    /* ================= PRICE ================= */
    if (body.min || body.max) {
      filter.sale_price = {};
      if (body.min) filter.sale_price.$gte = Number(body.min);
      if (body.max) filter.sale_price.$lte = Number(body.max);
    }

    /* ================= KEYWORD SEARCH ================= */
    if (body.keyword?.trim()) {
      const keyword = body.keyword.trim();
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { slug: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    /* ================= QUERY ================= */
    let data = [];
    let total = 0;

    if (isRandom) {
      // 🔥 RANDOM MODE with populate
      data = await productModel.aggregate([
        { $match: filter },
        { $sample: { size: randomSize } },

        // Populate parent_category_ids we use this code to search details of parent category details. In random selection only show id. if we need more details this code is necessary to lookup
        {
          $lookup: {
            from: "categories", // MongoDB collection name
            localField: "parent_category_ids",
            foreignField: "_id",
            as: "parent_category_ids",
          },
        },
      ]);
    } else {
      // NORMAL MODE
      total = await productModel.countDocuments(filter);

      data = await productModel
        .find(filter)
        .populate("parent_category_ids", "name slug")
        .populate("sub_category_ids", "name slug")
        .populate("material_ids", "name slug")
        .populate("color_ids", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit);
    }


    return res.json({
      _status: true,
      _pagination: isRandom
        ? null
        : {
          current_page: page,
          total_page: Math.ceil(total / limit), // change here
          total_records: total,
        },
      _data: data,
      _image_path: process.env.PRODUCT_IMAGE
    });
  } catch (error) {
    return res.json({
      _status: false,
      _message: "Server error",
      _error: error.message,
    });
  }
};

// without random feature code 
// const productModel = require("../../models/Product");
// const categoryModel = require("../../models/Category");
// const subCategoryModel = require("../../models/SubCategory");
// const materialModel = require("../../models/Material");
// const colorModel = require("../../models/Color");

// /* ================= SORT / FEATURE MAP ================= */
// const SORT_BY_MAP = {
//   1: { type: "filter", field: "is_featured" },
//   2: { type: "filter", field: "is_best_selling" },
//   3: { type: "filter", field: "is_top_rated" },
//   4: { type: "filter", field: "is_trending" },
//   5: { type: "filter", field: "is_online_store" },
//   6: { type: "filter", field: "is_new_arrival" },
//   7: { type: "sort", value: { name: 1 } },
//   8: { type: "sort", value: { name: -1 } },
//   9: { type: "sort", value: { sale_price: 1 } },
//   10: { type: "sort", value: { sale_price: -1 } },
// };

// exports.view = async (req, res) => {
//   try {
//     const body = req.body || {};

//     /* ================= PAGINATION ================= */
//     // page handling
//     const page = body.page && Number(body.page) > 0
//       ? Number(body.page)
//       : 1;

//     // limit handling
//     let limit;
//     if (body.limit === "all") {
//       limit = null; // means no limit
//     } else if (body.limit && Number(body.limit) > 0) {
//       limit = Number(body.limit);
//     } else {
//       limit = 12; // default
//     }

//     // skip only when limit exists
//     const skip = limit ? (page - 1) * limit : 0;


//     /* ================= BASE FILTER ================= */
//     const filter = { delete_at: null };
//     let sort = { _id: -1 };

//     const FLAGS = [
//       "is_featured", "is_new_arrival", "is_on_sell", "is_online_store",
//       "is_up_sell", "is_best_selling", "is_trending", "is_top_rated", "is_related"
//     ];
//     FLAGS.forEach(flag => {
//       if (body[flag] === true || body[flag] === "true") {
//         filter[flag] = true;
//       }
//     });

//     /* ================= FEATURE FROM URL (best-selling etc) ================= */
//     if (body.feature) {
//       filter[body.feature] = true;
//     }

//     /* ================= SORT / FEATURE DROPDOWN ================= */
//     if (body.sort_by && SORT_BY_MAP[body.sort_by]) {
//       const rule = SORT_BY_MAP[body.sort_by];
//       if (rule.type === "filter") filter[rule.field] = true;
//       if (rule.type === "sort") sort = rule.value;
//     }

//     /* ================= CATEGORY ================= */
//     if (body.category) {
//       const cats = await categoryModel.find({
//         slug: { $in: [].concat(body.category) },
//         delete_at: null,
//       });
//       if (cats.length) {
//         filter.parent_category_ids = { $in: cats.map(c => c._id) };
//       }
//     }

//     /* ================= SUB CATEGORY ================= */
//     if (body.sub) {
//       const subs = await subCategoryModel.find({
//         slug: { $in: body.sub.split(",") },
//         delete_at: null,
//       });
//       if (subs.length) {
//         filter.sub_category_ids = { $in: subs.map(s => s._id) };
//       }
//     }

//     /* ================= MATERIAL ================= */
//     if (body.material) {
//       const materials = await materialModel.find({
//         slug: { $in: body.material.split(",") },
//       });
//       if (materials.length) {
//         filter.material_ids = { $in: materials.map(m => m._id) };
//       }
//     }

//     /* ================= COLOR ================= */
//     if (body.color) {
//       const colors = await colorModel.find({
//         slug: { $in: body.color.split(",") },
//       });
//       if (colors.length) {
//         filter.color_ids = { $in: colors.map(c => c._id) };
//       }
//     }

//     /* ================= PRICE ================= */
//     if (body.min || body.max) {
//       filter.sale_price = {};
//       if (body.min) filter.sale_price.$gte = Number(body.min);
//       if (body.max) filter.sale_price.$lte = Number(body.max);
//     }

//     /* ================= KEYWORD SEARCH ================= */
//     if (body.keyword?.trim()) {
//       const keyword = body.keyword.trim();
//       filter.$or = [
//         { name: { $regex: keyword, $options: "i" } },
//         { slug: { $regex: keyword, $options: "i" } },
//         { description: { $regex: keyword, $options: "i" } },
//       ];
//     }

//     /* ================= QUERY ================= */
//     const total = await productModel.countDocuments(filter);

//     const data = await productModel
//       .find(filter)
//       .populate("parent_category_ids", "name slug")
//       .populate("sub_category_ids", "name slug")
//       .populate("material_ids", "name slug")
//       .populate("color_ids", "name slug")
//       .sort(sort)
//       .skip(skip)
//       .limit(limit);

//     return res.json({
//       _status: true,
//       _pagination: {
//         current_page: page,
//         total_pages: Math.ceil(total / limit),
//         total_records: total,
//       },
//       _data: data,
//     });

//   } catch (error) {
//     return res.json({
//       _status: false,
//       _message: "Server error",
//       _error: error.message,
//     });
//   }
// };







