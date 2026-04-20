require('dotenv').config()
var jwt = require('jsonwebtoken'); //jwt use to create token and verify token
const userModel = require('../../models/User');
var bcrypt = require('bcrypt'); //bcrypt use to encript password
var saltRounds = 2;// here saltround meaning making password more complex and create 10 times complex password



// register API
exports.register = async (req, res) => {
    
    var isExistUser = await userModel.findOne({ email: req.body.email, delete_at: '' });
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
        mobile_number: req.body.mobile_number
    }

    try {
        const insertData = new userModel(saveData);
        await insertData.save()
            .then((result) => {
                var token = jwt.sign({ userData: result }, process.env.KEY);
                res.send({
                    _status: true,
                    _message: 'User Register successfully',
                    _tokan: token,
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
// exports.login = async (req, res) => {
//     // 1. Find user by email
//     const user = await userModel.findOne({ email: req.body.email, delete_at: '' });
//     if(user.status === false){
//         return res.send({
//             _status: false,
//             _message: 'Your account has been deactivated. Please contact support.',
//             _data: null
//         });
//     }
//     // 2. If user not found
//     if (!user) {
//         return res.send({
//             _status: false,
//             _message: 'Email not found',
//             _data: null
//         });
//     }

//     // 3. Check password
//     const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
//     if (!isPasswordValid) {
//         return res.send({
//             _status: false,
//             _message: 'Invalid password',
//             _data: null
//         });
//     }

//     // 4. Create JWT token
//     const token = jwt.sign({ userData: user }, process.env.KEY);

//     res.send({
//         _status: true,
//         _message: 'Login successfully',
//         _token: token,
//         _data: user
//     });
// };


    