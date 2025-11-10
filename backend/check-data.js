const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const Material = require('./models/Material');
const Event = require('./models/Event');
const Navigation = require('./models/Navigation');

async function checkAndRestoreData() {
  try {
    console.log('🔍 Checking MongoDB Atlas connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas!\n');

    // Check existing data
    console.log('📊 Current Database Status:');
    console.log('═══════════════════════════════════════');

    const userCount = await User.countDocuments();
    console.log(`👥 Users: ${userCount}`);

    const facultyCount = await Faculty.countDocuments();
    console.log(`🏫 Faculty: ${facultyCount}`);

    const courseCount = await Course.countDocuments();
    console.log(`📚 Courses: ${courseCount}`);

    const materialCount = await Material.countDocuments();
    console.log(`📄 Materials: ${materialCount}`);

    const eventCount = await Event.countDocuments();
    console.log(`🎪 Events: ${eventCount}`);

    const navigationCount = await Navigation.countDocuments();
    console.log(`🗺️  Navigation Links: ${navigationCount}`);

    console.log('═══════════════════════════════════════\n');

    // If data exists, show samples
    if (userCount > 0) {
      console.log('✅ Users found! Sample users:');
      const sampleUsers = await User.find({}).limit(3).select('name email role');
      sampleUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
      console.log('\n');
    }

    if (facultyCount > 0) {
      console.log('✅ Faculty found! Sample faculty:');
      const sampleFaculty = await Faculty.find({}).limit(3).select('name department designation');
      sampleFaculty.forEach(faculty => {
        console.log(`   - ${faculty.name} - ${faculty.department} (${faculty.designation})`);
      });
      console.log('\n');
    }

    if (courseCount > 0) {
      console.log('✅ Courses found! Sample courses:');
      const sampleCourses = await Course.find({}).limit(3).select('code name faculty');
      sampleCourses.forEach(course => {
        console.log(`   - ${course.code}: ${course.name}`);
      });
      console.log('\n');
    }

    if (navigationCount > 0) {
      console.log('✅ Navigation links found! Sample navigation:');
      const sampleNav = await Navigation.find({}).limit(3).select('name description');
      sampleNav.forEach(nav => {
        console.log(`   - ${nav.name}: ${nav.description}`);
      });
      console.log('\n');
    }

    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('⚠️  No admin user found! Creating default admin...');
      const admin = new User({
        name: 'Admin User',
        email: 'admin@vignan.ac.in',
        password: 'admin123',
        role: 'admin',
        department: 'Administration'
      });
      await admin.save();
      console.log('✅ Default admin created: admin@vignan.ac.in / admin123\n');
    }

    console.log('🎉 Database check complete!');
    console.log('💡 Tip: Your data should be preserved in MongoDB Atlas');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 If connection fails, check:');
    console.log('   1. MongoDB Atlas cluster is active');
    console.log('   2. Database user credentials are correct');
    console.log('   3. Network connection to MongoDB Atlas');
  } finally {
    await mongoose.connection.close();
  }
}

checkAndRestoreData();
