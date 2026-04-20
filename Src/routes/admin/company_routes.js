// const express = require('express');
// const { details, update, view, create } = require('../../controllers/admin/company_controller');
// const router = express.Router() // make router as a excutable function
// const multer  = require('multer') // make multer as a executive function
// const uploads = multer({ dest: 'uploads/company'}) // here we set destination of image where we want to upload image.
// // this line is use to upload image in uploads/category folder. if we want to change folder we can change it here.
// const path = require('path'); // use to grap extension of image (.jpeg or png)


// // if we get text file we use request.body but for file we write request.file
// module.exports = server => {
//     const storage = multer.diskStorage({  // this function is work to save image in catetory folder
//         destination: function (req, file, cb) {
//           cb(null, 'uploads/company') // it means where we want to upload image
//         },
//         filename: function (req, file, cb) {
//           const uniqueValue = Date.now() + '-' + Math.round(Math.random() * 1E9) ;// this line gives random value for unique identity.
//          const imagePath = path.extname(file.originalname); // it extracts the extension of the file (e.g., .jpg, .png)
//          // here we use path.extname to get extension of image and add it to unique value.
//           // file.fieldname is the name of the field in the form data, which is 'image' in this case.
//           cb(null, file.fieldname + '-' + uniqueValue + imagePath) // this line is use to save image with unique name in uploads folder
//         }
//       })
      
//       const upload = multer({ storage: storage })

//     const singleImage = upload.single('image');
    
//     // const multipleImage = upload.array('images', '10');// user can only upload 10 files at a time.
//     // const uploadImage = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 8 }])
     
// router.post('/create',singleImage, create) // here we use upload as a middleware, which gives promission to create create text file in form data file. we can create file without upload image. frontend developer can insert data from in any way we have to insert it and read data we use upload.none() function.
// router.post('/view',upload.none(), view )

// router.put('/update/:_id', singleImage, update);

// server.use('/api/admin/company', router) // this is common route of this file
// }

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {details, update, view, create } = require('../../controllers/admin/company_controller');

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/company');
  },
  filename: (req, file, cb) => {
    const uniqueValue = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueValue + ext);
  }
});

const upload = multer({ storage });

// routes
router.post('/create', upload.single('image'), create);
router.post('/view', view);
router.post('/details/:_id', details);
router.put('/update/:_id', upload.single('image'), update);

module.exports = (server) => {
  server.use('/api/admin/company', router);
};


