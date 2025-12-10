const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function showUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('name email role department');
    
    console.log('═══════════════════════════════════════');
    console.log('📋 ALL USERS IN DATABASE');
    console.log('═══════════════════════════════════════\n');
    
    users.forEach(user => {
      console.log(`Name:       ${user.name}`);
      console.log(`Email:      ${user.email}`);
      console.log(`Role:       ${user.role}`);
      console.log(`Department: ${user.department || 'N/A'}`);
      console.log('---');
    });

    console.log('\n⚠️  NOTE: Passwords are hashed and cannot be displayed');
    console.log('💡 To reset a password, use the reset-password.js script\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

showUsers();
