const User = require('../models/User');
const Company = require('../models/Company');
const Device = require('../models/Device');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');


//@desc GET all users
//@route GET /users
//@access Private

const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users.length) {
        return res.status(400).json({
            message: "No users found"
        });
    }
    res.json(users);

});


//@desc Create new user
//@route POST /users
//@access Private

const createNewUser = asyncHandler(async(req, res) => {
    const {
        username,
        password,
        roles
    } = req.body;

    //Confirm the data im getting
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    //Check the data im getting for duplicates
    const duplicate = await User.findOne({ username }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicated username' });
    }

    //Hash the password of the User
    const hashPwd = await bcrypt.hash(password, 10);

    const userObject = { username, "password": hashPwd, roles };

    //Create the user and store them
    const user = await User.create(userObject);

    if (user) {
        res.status(201).json({ message: `New User ${username} is created` });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }

});


//@desc Update user
//@route PATCH /users
//@access Private

const updateUser = asyncHandler(async(req, res) => {
    const { id, username, roles, active, password } = req.body;

    //Confirm the data im getting
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(id).exec();

    if (!user) {
        res.status(400).json({ message: "User not found" });
    }

    //Check the data im getting for duplicates
    const duplicate = await User.findOne({ username }).lean().exec();

    if (duplicate && duplicate._id.toString() !== id) {
        return (res.status(409).json({ message: 'Duplicate username' }));
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();
    res.json({ message: `${updatedUser.username} updated successfully` })

});


//@desc Delete user
//@route DELETE /users
//@access Private

const deleteUser = asyncHandler(async(req, res) => {

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'User ID Required' });
    }

    const company = await Company.findOne({ user: id }).lean().exec();
    if (company) {
        return res.status(400).json({ message: 'User has assigned companies' });
    }

    const user = await User.findOne({
        user: id
    }).exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const result = await user.deleteOne();

    const reply = `Username ${result.username} with ID ${result._id} deleted`;

    res.json(reply);

});

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
};