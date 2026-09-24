const User = require('../models/userModel');

const createUser = async (userData) => {
    try {
        const user = new User(userData);
        return await user.save();
    } catch (error) {
        throw new Error(error.message);
    }
};

const getUserByEmail = async (email) => {
    try {
        return await User.findOne({ email });
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    createUser,
    getUserByEmail
};
