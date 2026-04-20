require('dotenv').config()
var jwt = require('jsonwebtoken'); //jwt use to create token and verify token
const webUserModel = require('../../models/website/webUser');
var bcrypt = require('bcrypt'); //bcrypt use to encript password
var saltRounds = 10;// here saltround meaning making password more complex and create 10 times complex password

const nodemailer = require("nodemailer");// nodemailer use to send email
const { request } = require('express');


// register API
exports.register = async (req, res) => {

    var isExistUser = await webUserModel.findOne({ email: req.body.email, delete_at: '', role_type: 'User' });
    if (isExistUser) {
        return res.send({
            _status: false,
            _message: 'Email already exist',
            _data: null
        });
    }
    const saveData = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, saltRounds), // this line is use to encript password 
        mobile_number: req.body.mobile_number,
        role_type: "User",
        gender: req.body.gender || "Mr." // default to "Mr." if not provided
    }

    try {
        const insertData = new webUserModel(saveData);
        await insertData.save()
            .then((result) => {
                var token = jwt.sign({ userData: result }, process.env.KEY);
                res.send({
                    _status: true,
                    _message: 'User Register successfully',
                    _token: token,
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

// alternate code of registor
// exports.register = async (req, res) => {
//     try {
//         const isExistUser = await webUserModel.findOne({ email: req.body.email, delete_at: null, role_type: 'User' });
//         if (isExistUser) {
//             return res.send({ _status: false, _message: 'Email already exist', _data: null });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(req.body.password, salt);

//         const saveData = {
//             fname: req.body.fname,
//             lname: req.body.lname,
//             email: req.body.email,
//             password: hashedPassword,
//             mobile_number: req.body.mobile_number,
//             role_type: "User"
//         };

//         const insertData = new webUserModel(saveData);
//         const result = await insertData.save();

//         const token = jwt.sign({ id: result._id }, process.env.KEY, { expiresIn: '7d' });

//         res.send({
//             _status: true,
//             _message: 'User Register successfully',
//             _token: token,
//             _data: result
//         });

//     } catch (error) {
//         const errorMessage = [];
//         if (error.errors) {
//             for (let i in error.errors) errorMessage.push(error.errors[i].message);
//         }
//         res.send({
//             _status: false,
//             _message: errorMessage.length ? 'Validation error' : 'Server error',
//             _data: null,
//             _Error_Message: errorMessage
//         });
//     }
// };

// login API


exports.login = async (req, res) => {
    try {
        // 1. Find user by email and include password
        const user = await webUserModel.findOne({
            email: req.body.email,
            delete_at: null,      // null preferable over ''
            role_type: 'User'
        }).select('+password');   //important if password is select: false in schema

        // 2. If user not found
        if (!user) {
            return res.send({
                _status: false,
                _message: 'Email not found',
                _data: null
            });
        }

        // 3. Check if user is deactivated
        if (user.status === false) {
            return res.send({
                _status: false,
                _message: 'Your account has been deactivated. Please contact support.',
                _data: null
            });
        }

        // 4. Check password exists
        if (!req.body.password || !user.password) {
            return res.send({
                _status: false,
                _message: 'Password missing',
                _data: null
            });
        }

        // 5. Compare password
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.send({
                _status: false,
                _message: 'Invalid Password',
                _data: null
            });
        }

        // 6. Generate JWT token
        const token = jwt.sign({ userData: user }, process.env.KEY, { expiresIn: '1d' });

        // 7. Send success response
        res.send({
            _status: true,
            _message: 'Login successfully',
            _token: token,
            _data: user
        });

    } catch (error) {
        console.error("Login error:", error);
        res.send({
            _status: false,
            _message: 'Server error',
            _error: error.message
        });
    }
};

exports.viewProfile = async (req, res) => {
    // first we get token from header

    var token = req.headers.authorization; // we get token from header
    if (!token) { // if token is not present in header
        return res.send({
            _status: false,
            _message: 'Token is required',
            _data: null
        })
    }
    // if present please break this token part from Bearer by split function and take 1 index which contain actual token
    var token = token.split(' ')[1]; // we split token from 'space ' because we need token only not Bearer which is comes associate with token value
    try {
        var decoded = jwt.verify(token, process.env.KEY); // here we verify token is valid or not

        var userData = await webUserModel.findOne({ _id: decoded.userData._id, role_type: "User" }); // here we find user by id and check delete_at is empty(
        console.log(userData);
        if (!userData) {
            return res.send({
                _status: false,
                _message: 'User not found',
                _data: null

            });
        }
        res.send({
            _status: true,
            _message: 'User profile fetched successfully',
            _data: userData
        });
    } catch (error) {
        return res.send({
            _status: false,
            _message: 'Invalid token',
            _data: null
        });
    }
}
// update profile

exports.updateProfile = async (req, res) => {
    var token = req.headers.authorization; // we get token from header
    if (!token) { // if token is not present in header
        return res.send({
            _status: false,
            _message: 'Token is required',
            _data: null
        })
    }
    var token = token.split(' ')[1]; // we split token from 'space ' because we need token only not Bearer which is comes incorporate with token value

    try {
        var decoded = jwt.verify(token, process.env.KEY); // here we verify token is valid or not

        var userData = await webUserModel.findOne({ _id: decoded.userData._id, role_type: "User" });// here we find user by id and check delete_at is empty
        if (!userData) { // if user not found
            return res.send({
                _status: false,
                _message: 'User not found',
                _data: null
            });
        }
        const updateData = {
            ...req.body,                    // keep all fields from the form
            gender: req.body.gender || userData.gender // add gender (default to existing if not provided)
        };

        if (req.file && req.file.filename) {
            updateData.image = req.file.filename;
        }

        await webUserModel.updateOne({
            _id: decoded.userData._id
        }, {
            $set: updateData
        });

        const output = {
            _status: true,
            _message: 'Profile updated successfully',
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
        // we add .select("+password") for excecution password. otherwise password will hide and userdata.password return undefined 
        var userData = await webUserModel.findById({ _id: decoded.userData._id, role_type: "User" }).select("+password"); // here we find user by id and check delete_at is empty
        if (!userData) { // if user not found
            return res.send({
                _status: false,
                _message: 'User not found',
                _data: null
            });
        }

        let verifyPassword = await bcrypt.compare(req.body.current_password, userData.password);
        if (!verifyPassword) {
            return res.send({
                _status: false,
                _message: 'Current password is incorrect',
                _data: null
            });
        }
        if (req.body.current_password === req.body.new_password) {
            return res.send({
                _status: false,
                _message: 'Current password and new password cannot be the same',
                _data: null
            });
        }
        if (req.body.new_password != req.body.confirm_password) {
            return res.send({
                _status: false,
                _message: 'New password and confirm password do not match',
                _data: null
            });
        }

        var password = await bcrypt.hash(req.body.new_password, saltRounds);
        var userData = await webUserModel.updateOne({
            _id: decoded.userData._id
        }, {
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
        const userData = await webUserModel.findOne({ email: req.body.email, delete_at: null, role_type: "User" }); // req.body.email comes is use for receiver. here we find user by email and check delete_at is empty
        if (!userData) { // if userdata is not true or blank
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

        // 4. email options here we use 3000 port number because when i reset password i want to open my front end page which is run in 3000 port
        var mailOptions = {
            from: `"User" <${process.env.EMAIL_USER}>`,
            to: req.body.email,
            subject: 'Password Reset Link',
            text: `You are requested to reset your password. Please click on the link to reset your password:\n\nhttp://localhost:3000/reset-password?token=${token}`,
        };
        

        // for send email
        await transporter.sendMail(mailOptions, function (error, info) {
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

    token = token.split(' ')[1]; // remove "Bearer" and take token only using split function

    try {
        const decoded = jwt.verify(token, process.env.KEY);

        // use correct payload
        const userData = await webUserModel.findOne({ _id: decoded.id, role_type: "User" });
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

        var finalData = await webUserModel.updateOne(
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
            _data: error.message
        });
    }
};
