const DataModel = require('../models/dbModel');

const fetchAllData = async () => {
    try {
        const data = await DataModel.find();
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const createNewData = async (payload) => {
    try {
        const newData = await DataModel.create(payload);
        return { success: true, data: newData };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

module.exports = {
    fetchAllData,
    createNewData
};
