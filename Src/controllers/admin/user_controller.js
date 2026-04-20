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
exports.login = async (req, res) => {
    // 1. Find user by email
    const user = await userModel.findOne({ email: req.body.email, delete_at: '' });
    if(user.status === false){
        return res.send({
            _status: false,
            _message: 'Your account has been deactivated. Please contact support.',
            _data: null
        });
    }
    // 2. If user not found
    if (!user) {
        return res.send({
            _status: false,
            _message: 'Email not found',
            _data: null
        });
    }

    // 3. Check password
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
        return res.send({
            _status: false,
            _message: 'Invalid password',
            _data: null
        });
    }

    // 4. Create JWT token
    const token = jwt.sign({ userData: user }, process.env.KEY);

    res.send({
        _status: true,
        _message: 'Login successfully',
        _token: token,
        _data: user
    });
};

// view profile
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
    var token = token.split(' ')[1]; // we split token from 'space ' because we need token only not Bearer which is comes incorporate with token value

    try {
        var decoded = jwt.verify(token, process.env.KEY); // here we verify token is valid or not
        console.log(decoded);
        
        var userData = await userModel.findById(decoded.userData._id); // here we find user by id and check delete_at is empty
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
        
        var userData = await userModel.findById(decoded.userData._id); // here we find user by id and check delete_at is empty
        if (!userData) { // if user not found
            return res.send({
                _status: false,
                _message: 'User not found',
                _data: null
            });
        }
        const updateData = req.body;
        if (req.file && req.file.filename) { // Check if a new image file is uploaded
            updateData.image = req.file.filename; // Add image filename to updateData if a new image is uploaded
        }
         var userData = await userModel.updateOne({ 
            _id: decoded.userData._id 
        },{ 
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
        
        var userData = await userModel.findById(decoded.userData._id); // here we find user by id and check delete_at is empty
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
         var userData = await userModel.updateOne({ 
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
// view all user
exports.view = async (request, response) => {
    try {
        // 1. Build filter
        const addCondition = [{ delete_at: null }]; // please select these which delete_null
        const orCondition = [];

        if (request.body?.fname && request.body.fname.trim() !== '') { // we handle filter by firstname 
            const fname = new RegExp(request.body.fname.trim(), 'i');
            orCondition.push({ fname: fname }, { code: fname });
        }
            if (request.body?.lname && request.body.lname.trim() !== '') { // we handle filter by lastname also
            const lname = new RegExp(request.body.lname.trim(), 'i');
            orCondition.push({ lname: lname }, { code: lname });
        }

        let filter = { $and: addCondition };
        if (orCondition.length > 0) {
            filter.$or = orCondition;
        }

        // 2. Pagination
        const currentPage = parseInt(request?.body?.page) || 1;
        const limit = parseInt(request?.body?.limit) || 5;
        const skip = (currentPage - 1) * limit;

        // 3. Count total records
        const totalRecords = await userModel.countDocuments(filter); // count records after filter
        const totalPage = Math.ceil(totalRecords / limit);

        // 4. Fetch paginated data
        const result = await userModel.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({_id: -1 })// we can sort by order also

        // 5. Send response
        .then((result)=>{
            if (result.length > 0) {
                response.send({
                    _status: true,
                    _message: 'Record view successfully',
                    _pagination: {
                        current_page: currentPage,
                        total_page: totalPage,
                        total_records: totalRecords,
                    },
                    _data: result,
                });
            } else {
                response.send({
                    _status: true,
                    _message: 'No record found',
                    _data: [],
                });
            }
        })
        .catch((result)=>{
            response.send({
                _status: false,
                _message: 'Something Went Wrong !!',
                _data: ''
            });
        })
        
    } catch (error) {
        console.error('Error in view controller:', error.message);
        response.send({
            _status: false,
            _message: 'Something went wrong!',
            _data: null,
        });
    }
};
// change status
exports.changeStatus = async (request, response) => {
    await userModel.updateMany(
      {
        _id: {
          $in: request.body.id,
        },
      },
      [
        {
          $set: {
            status: { $not: "$status" },
          },
        },
      ]
    )
    .then((result) => {
      var output = {
        _status: true,
        _message: "Change Status Successfully",
        _data: result,
      };
      response.send(output);
    })
    .catch(() => {
      var output = {
        _status: false,
        _message: "Something went wrong",
        _data: null,
      };
      response.send(output);
    });
  };
// delete user
exports.decompose = async (request, response) => {
    await userModel.updateMany(
      {
        _id: {
          $in: request.body.id,
        },
      },
      {
        $set: { delete_at: new Date() },
      }
    )
      .then((result) => {
        var output = {
          _status: true,
          _message: "User Deleted Successfully",
          _data: result,
        };
        response.send(output);
      })
      .catch(() => {
        var output = {
          _status: false,
          _message: "Something went wrong",
          _data: null,
        };
        response.send(output);
      });
  };

    