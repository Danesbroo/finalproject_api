require('dotenv').config()
var jwt = require('jsonwebtoken'); //jwt use to create token and verify token
const adminModel = require('../../models/Admin');
var bcrypt = require('bcrypt'); //bcrypt use to encript password
var saltRounds = 5;// here saltround meaning making password more complex and create 10 times complex password

const nodemailer = require("nodemailer");// nodemailer use to send email

// register API
exports.register = async (req, res) => {

    var isExistUser = await adminModel.findOne({ email: req.body.email, delete_at: '', role_type: 'Admin' });
    if (isExistUser) {
        return res.send({
            _status: false,
            _message: 'Email already exist',
            _data: null
        });
    }

    // for insert image 
    let image = "";
    if (req.file) {
        image = req.file.filename; // multer saved filename
    }
    const saveData = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, saltRounds), // this line is use to encript password 
        mobile_number: req.body.mobile_number,
        role_type: "Admin",
        image: image,
        address: req.body.address,
        

    }

    try {
        const insertData = new adminModel(saveData);
        await insertData.save()
            .then((result) => {
                var token = jwt.sign({ userData: result }, process.env.KEY);
                res.send({
                    _status: true,
                    _message: 'User Register successfully',
                    _tokan: token,
                    _image_path: process.env.ADMIN_IMAGE,
                    _data: result
                });
            })
            .catch((error) => {
                const errorMessage = [];
                for (let i in error.errors) {
                    errorMessage.push(error.errors[i].message);
                }
                res.send({
                    _status: false,
                    _message: 'Validation error',
                    _data: null,
                    _Error_Message: errorMessage
                });
            });
    } catch (error) {
        res.send({
            _status: false,
            _message: 'Server error',
            _data: null
        });
    }
    
};

// login API
exports.login = async (req, res) => {
  try {
    // 1. Find user by email
    const user = await adminModel.findOne({
      email: req.body.email,
      delete_at: "",
      role_type: "Admin"
    });

    // 2. User not found
    if (!user) {
      return res.send({
        _status: false,
        _message: "Email not found",
        _data: null
      });
    }

    // 3. User deactivated
    if (user.status === false) {
      return res.send({
        _status: false,
        _message: "Your account has been deactivated. Please contact support.",
        _data: null
      });
    }

    // 4. Check password
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.send({
        _status: false,
        _message: "Invalid password",
        _data: null
      });
    }

    // 5. Create JWT token with only required info
    const payload = {
      userId: user._id,           // Admin/User ID
      companyId: user.companyId,  // Company ID (assuming admin model has companyId)
      role_type: user.role_type    // optional
    };

    const token = jwt.sign(payload, process.env.KEY, { expiresIn: "1d" });

    // 6. Send response
    res.send({
      _status: true,
      _message: "Login successfully",
      _token: token,
      _image_path: process.env.ADMIN_IMAGE,
      _data: {
        _id: user._id,
        name: user.company_name,
        email: user.email,
        companyId: user.companyId,
        role_type: user.role_type
      }
    });
  } catch (error) {
    return res.send({
      _status: false,
      _message: "Something went wrong",
      _data: null
    });
  }
};

// view profile
exports.viewProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.send({
        _status: false,
        _message: "Token is required",
        _data: null
      });
    }

    const token = authHeader.split(" ")[1]; // Bearer TOKEN

    const decoded = jwt.verify(token, process.env.KEY);

    const userData = await adminModel.findOne({
      _id: decoded.userId,   // ✅ FIX HERE
      role_type: "Admin"
    });

    if (!userData) {
      return res.send({
        _status: false,
        _message: "User not found",
        _data: null
      });
    }

    res.send({
      _status: true,
      _message: "User profile fetched successfully",
      _data: userData,
      _image_path: process.env.ADMIN_IMAGE
    });

  } catch (error) {
    return res.send({
      _status: false,
      _message: "Invalid or expired token",
      _data: null
    });
  }
};

// update profile
// exports.updateProfile = async (req, res) => {
//     var token = req.headers.authorization; // we get token from header
//     if (!token) { // if token is not present in header
//         return res.send({
//             _status: false,
//             _message: 'Token is required',
//             _data: null
//         })   
//     } 
//     var token = token.split(' ')[1]; // we split token from 'space ' because we need token only not Bearer which is comes incorporate with token value

//     try {
//         var decoded = jwt.verify(token, process.env.KEY); // here we verify token is valid or not
        
//         var userData = await adminModel.findById({_id: decoded.userData._id, role_type : "Admin"});// here we find user by id and check delete_at is empty
//         if (!userData) { // if user not found
//             return res.send({
//                 _status: false,
//                 _message: 'User not found',
//                 _data: null
//             });
//         }
//         const updateData = req.body;
//         if (req.file && req.file.filename) { // Check if a new image file is uploaded
//             updateData.image = req.file.filename; // Add image filename to updateData if a new image is uploaded
//         }
//          var userData = await adminModel.findByIdAndUpdate({ 
//             _id: decoded.userData._id 
//         },{ 
//             $set: updateData
//         }); 
//          const output = {
//             _status: true,
//             _message: 'Profile updated successfully',
//             _data: userData,
//             _image_path: process.env.ADMIN_IMAGE
//         }
//         res.send(output);
//     }
//     catch (error) {
//         return res.send({
//             _status: false,
//             _message: 'Invalid token',
//             _data: null
//         });
//     }
// }

exports.updateProfile = async (req, res) => {
  try {
    let authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.send({
        _status: false,
        _message: "Token is required"
      });
    }

    const token = authHeader.split(" ")[1]; // Bearer TOKEN

    const decoded = jwt.verify(token, process.env.KEY);

    // FIX: use decoded.userId
    const user = await adminModel.findById(decoded.userId);

    if (!user) {
      return res.send({
        _status: false,
        _message: "User not found"
      });
    }

    const updateData = req.body;

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedUser = await adminModel.findByIdAndUpdate(
      decoded.userId,
      { $set: updateData },
      { new: true }
    );

    res.send({
      _status: true,
      _message: "Profile updated successfully",
      _data: updatedUser,
      _image_path: process.env.ADMIN_IMAGE
    });

  } catch (error) {
    res.send({
      _status: false,
      _message: "Invalid or expired token"
    });
  }
};

// change password
exports.changePassword = async (req, res) => {
    var token = req.headers.authorization; // we get token from header
    if (!token) { // if token is not present in header
        return res.send({
            _status: false,
            _message: 'Token is required',
            _data: null
        })   
    } 
    var token = token.split(' ')[1]; //it split token from blank space and make array. because we need token only not Bearer which is comes incorporate with token value
    try {
        var decoded = jwt.verify(token, process.env.KEY); // here we verify token is valid or not
        
        var userData = await adminModel.findOne({_id: decoded.userData._id, role_type : "Admin"}); // here we find user by id and check delete_at is empty
        if (!userData) { // if user not found
            return res.send({
                _status: false,
                _message: 'User not found',
                _data: null
            });
        }
        let verifyPassword = await bcrypt.compare(req.body.current_password, userData.password);
        if(!verifyPassword){
            return res.send({
                _status: false,
                _message: 'Current password is incorrect',
                _data: null
            });
        }
        if(req.body.current_password === req.body.new_password){
            return res.send({
                _status: false,
                _message: 'Current password and new password cannot be the same',
                _data: null
            });
        }
        if(req.body.new_password != req.body.confirm_password){
            return res.send({
                _status: false,
                _message: 'New password and confirm password do not match',
                _data: null
            });
        }
        
         var password = await bcrypt.hash(req.body.new_password, saltRounds);
         var userData = await adminModel.updateOne({ 
            _id: decoded.userData._id 
        },{ 
            $set: { password: password }
        }); 
         const output = {
            _status: true,
            _message: 'Password Changed  successfully',
            _data: userData
        }
        res.send(output);
    }
    catch (error) {
        return res.send({
            _status: false,
            _message: 'Invalid token',
            _data: null
        });
    }
}

// forget password
exports.forgetPassword = async (req, res) => {
    try {
      // 1. Find user by email
      const userData = await adminModel.findOne({ email: req.body.email, delete_at: null , role_type: "Admin"}); // req.body.email comes is use for receiver. here we find user by email and check delete_at is empty
      if (!userData) {
        return res.send({
          _status: false,
          _message: 'Email not found',
          _data: null,
        });
      }
  
      // 2. Create JWT token (only id)
      const token = jwt.sign({ id: userData._id }, process.env.KEY, { expiresIn: '1h' });
  
      // 3. create transport
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD, //here is the sender email password
        },
      });
  
      // 4. email options
      var mailOptions = {
        from: `"Admin" <${process.env.EMAIL_USER}>`,
        to: req.body.email,// sometime we can send email to multiple user by adding comma(,) after email
        subject: 'Password Reset Link',
        text: `You are requested to reset your password. Please click on the link to reset your password:\n\nhttp://localhost:4000/reset-password?token=${token}`,
      };

      // send email
    await  transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          return res.send({
            _status: false,
            _message: 'Error sending email',
            _data: error,
          })
        } else {
          return res.send({
            _status: true,
            _message: 'Password reset link has been sent to your email',
            _data: null,
          });
        }
    });
    } catch (error) {
      return res.send({
        _status: false,
        _message: 'Server error',
        _data: error.message,
      });
    }
  };
  
// reset password
exports.resetPassword = async (req, res) => {
    let token = req.headers.authorization;
    if (!token) {
      return res.send({
        _status: false,
        _message: 'Token is required',
        _data: null
      });
    }
  
    token = token.split(' ')[1]; // remove "Bearer"
  
    try {
      const decoded = jwt.verify(token, process.env.KEY);
  
      // ✅ सही payload प्रयोग गर
      const userData = await adminModel.findOne({_id: decoded.id, role_type : "Admin"});
      if (!userData) {
        return res.send({
          _status: false,
          _message: 'User not found',
          _data: null
        });
      }
  
      if (req.body.new_password !== req.body.confirm_password) {
        return res.send({
          _status: false,
          _message: 'Passwords do not match',
          _data: null
        });
      }
  
      const hashedPassword = await bcrypt.hash(req.body.new_password, 10);
  
  var finalData =  await adminModel.updateOne(
        { _id: decoded.id },
        { $set: { password: hashedPassword } }
      );
  
      return res.send({
        _status: true,
        _message: 'Password reset successfully',
        _data: finalData
      });
    } catch (error) {
      return res.send({
        _status: false,
        _message: 'Invalid or expired token',
        _data: error.message  // अब blank object होइन, error message देखिन्छ
      });
    }
  };
     