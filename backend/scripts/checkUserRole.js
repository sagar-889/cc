const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://campusadmin:Niharika1234@cluster0.3c4ud6.mongodb.net/campus-companion?retryWrites=true&w=majority&appName=Cluster0';

async function checkUserRole() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users and their roles
    const users = await User.find({}, 'name email role department').sort({ createdAt: -1 });
    
    console.log('\n=== ALL USERS IN DATABASE ===');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Department: ${user.department || 'Not specified'}`);
      console.log('   ---');
    });

    // Find the specific user if email is provided
    const targetEmail = 'niharika.adigoppula@gmail.com'; // Update this to the actual email
    const targetUser = await User.findOne({ email: targetEmail });
    
    if (targetUser) {
      console.log(`\n=== TARGET USER: ${targetEmail} ===`);
      console.log(`Name: ${targetUser.name}`);
      console.log(`Role: ${targetUser.role}`);
      console.log(`Department: ${targetUser.department}`);
      console.log(`Year: ${targetUser.year}`);
      console.log(`Semester: ${targetUser.semester}`);
      console.log(`Created: ${targetUser.createdAt}`);
    } else {
      console.log(`\n❌ User with email ${targetEmail} not found`);
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserRole();
