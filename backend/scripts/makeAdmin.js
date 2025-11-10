/**
 * Script to make a user an admin
 * Run with: node scripts/makeAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const makeAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Email of the user to make admin
    const email = 'niharika.adigoppula@gmail.com';

    // Update user to admin
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log('❌ User not found with email:', email);
      console.log('Please register first or check the email address');
    } else {
      console.log('✅ User updated to admin successfully!');
      console.log('User details:');
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('\n🎉 You can now login as admin!');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

makeAdmin();
