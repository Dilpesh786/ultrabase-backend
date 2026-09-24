const User = require('../models/userModel');

const getAllUsersData = async () => {
    try {
        const users = await User.find().select('-password');
        return { success: true, data: users };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const removeUserById = async (userId) => {
    try {
        await User.findByIdAndDelete(userId);
        return { success: true, message: 'User deleted successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

module.exports = {
    getAllUsersData,
    removeUserById
};
