const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  console.log('🔧 Creating Admin User...\n');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@vignan.ac.in' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email: admin@vignan.ac.in');
      console.log('Role:', existingAdmin.role);
      console.log('\nIf you forgot the password, delete this user from MongoDB and run this script again.');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@vignan.ac.in',
      password: 'admin123',
      role: 'admin',
      department: 'Administration'
    });

    await admin.save();
    
    console.log('═══════════════════════════════════════');
    console.log('✅ Admin User Created Successfully!');
    console.log('═══════════════════════════════════════');
    console.log('\n📧 Login Credentials:');
    console.log('   Email:    admin@vignan.ac.in');
    console.log('   Password: admin123');
    console.log('   Role:     Admin');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n🚀 You can now:');
    console.log('   1. Login at http://localhost:3000/login');
    console.log('   2. Select "Admin" as role');
    console.log('   3. Use the credentials above');
    console.log('   4. Access admin features like Add Faculty\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    console.error(error.message);
    
    if (error.code === 11000) {
      console.error('\n💡 This email is already registered.');
      console.error('   Try using a different email or delete the existing user.');
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the function
createAdmin();
