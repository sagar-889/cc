const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Reset all user passwords to 'password123'
    const users = await User.find({});
    
    console.log('🔄 Resetting passwords for all users...\n');
    
    for (const user of users) {
      user.password = 'password123';
      await user.save();
      console.log(`✅ Password reset for: ${user.email} (${user.role})`);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✅ ALL PASSWORDS RESET SUCCESSFULLY!');
    console.log('═══════════════════════════════════════\n');
    console.log('📧 You can now login with:');
    console.log('   Password: password123');
    console.log('\n   Available users:');
    
    const updatedUsers = await User.find({}).select('name email role');
    updatedUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    console.log('\n');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetPassword();
