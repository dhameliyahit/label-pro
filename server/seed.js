require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

const seedAdminUser = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/label-generator';
  
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoURI);
    
    // Check if any admin user exists
    const adminCount = await User.countDocuments();
    if (adminCount > 0) {
      console.log('Database already has users. Clearing existing users to avoid duplicates...');
      await User.deleteMany({});
    }

    // Define seed credentials (Edit these fields as desired before running)
    const adminData = {
      name: 'Heet Admin',
      email: 'heet@admin.com',        // Can be used for login
      mobile: '9638601192',             // Can also be used for login
      password: '123456'           // Will be auto-hashed by pre-save hook
    };

    console.log('Creating admin user with:');
    console.log('- Name:', adminData.name);
    console.log('- Email:', adminData.email);
    console.log('- Mobile:', adminData.mobile);
    console.log('- Password:', adminData.password);

    const user = new User(adminData);
    await user.save();

    console.log('Admin user successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedAdminUser();
