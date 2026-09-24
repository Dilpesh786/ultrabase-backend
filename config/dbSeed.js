const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const seedAdminUser = async () => {
    try {
        const existingAdmin = await User.findOne({ email: 'admin@ultrabase.com' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            await User.create({
                name: 'Super Admin',
                email: 'admin@ultrabase.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Default admin user seeded successfully.');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error.message);
    }
};

module.exports = seedAdminUser;
