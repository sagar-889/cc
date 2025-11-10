const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Material = require('./models/Material');
const Event = require('./models/Event');
const Navigation = require('./models/Navigation');
require('dotenv').config();

async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...');
    await mongoose.connect(process.env.MONGODB_URI);

    // Create sample users if none exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('👥 Creating sample users...');

      const sampleUsers = [
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@university.edu',
          password: 'password123',
          role: 'faculty',
          department: 'Computer Science',
          year: null
        },
        {
          name: 'John Smith',
          email: 'john.smith@student.edu',
          password: 'password123',
          role: 'student',
          department: 'Computer Science',
          year: 3,
          semester: 6
        },
        {
          name: 'Dr. Michael Brown',
          email: 'michael.brown@university.edu',
          password: 'password123',
          role: 'faculty',
          department: 'Mathematics',
          year: null
        }
      ];

      await User.insertMany(sampleUsers);
      console.log('✅ Sample users created');
    }

    // Create sample courses if none exist
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      console.log('📚 Creating sample courses...');

      const sampleCourses = [
        {
          code: 'CS101',
          name: 'Introduction to Computer Science',
          description: 'Basic concepts of programming and computer science',
          credits: 4,
          semester: 1,
          department: 'Computer Science',
          faculty: null, // Will be assigned later
          maxStudents: 60,
          enrolledStudents: []
        },
        {
          code: 'MATH201',
          name: 'Advanced Calculus',
          description: 'Advanced mathematical concepts and calculus',
          credits: 3,
          semester: 3,
          department: 'Mathematics',
          faculty: null,
          maxStudents: 45,
          enrolledStudents: []
        }
      ];

      await Course.insertMany(sampleCourses);
      console.log('✅ Sample courses created');
    }

    // Create sample navigation links if none exist
    const navigationCount = await Navigation.countDocuments();
    if (navigationCount === 0) {
      console.log('🗺️  Creating sample navigation links...');

      const sampleNavigation = [
        {
          name: 'Admin Block',
          description: 'Main administrative building with offices',
          category: 'building',
          coordinates: { lat: 17.1234, lng: 78.5678 },
          floor: 'Ground Floor',
          roomNumber: 'A-001',
          directions: 'Enter through main gate, first building on the right'
        },
        {
          name: 'Library',
          description: 'Central library with study areas and computer labs',
          category: 'facility',
          coordinates: { lat: 17.1245, lng: 78.5689 },
          floor: 'Ground Floor',
          roomNumber: 'LIB-001',
          directions: 'Behind the admin block, large glass building'
        },
        {
          name: 'Cafeteria',
          description: 'Student cafeteria and dining hall',
          category: 'facility',
          coordinates: { lat: 17.1256, lng: 78.5678 },
          floor: 'Ground Floor',
          roomNumber: 'CAF-001',
          directions: 'Next to the library, follow the pathway'
        }
      ];

      await Navigation.insertMany(sampleNavigation);
      console.log('✅ Sample navigation links created');
    }

    // Create sample materials if none exist
    const materialCount = await Material.countDocuments();
    if (materialCount === 0) {
      console.log('📄 Creating sample materials...');

      const sampleMaterials = [
        {
          title: 'Introduction to Programming Slides',
          description: 'Lecture slides for CS101 covering basic programming concepts',
          type: 'slides',
          course: null, // Will be linked to CS101 later
          uploadedBy: null,
          filePath: '/uploads/cs101-intro-slides.pdf',
          fileSize: 2048576,
          mimeType: 'application/pdf'
        },
        {
          title: 'Calculus Formula Sheet',
          description: 'Comprehensive formula sheet for calculus students',
          type: 'document',
          course: null,
          uploadedBy: null,
          filePath: '/uploads/calculus-formulas.pdf',
          fileSize: 1024576,
          mimeType: 'application/pdf'
        }
      ];

      await Material.insertMany(sampleMaterials);
      console.log('✅ Sample materials created');
    }

    // Create sample events if none exist
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      console.log('🎪 Creating sample events...');

      const sampleEvents = [
        {
          title: 'Tech Fest 2024',
          description: 'Annual technology festival with competitions and workshops',
          date: new Date('2024-12-15'),
          time: '09:00',
          location: 'Main Auditorium',
          organizer: null,
          category: 'academic',
          status: 'upcoming',
          maxAttendees: 500,
          registeredStudents: []
        },
        {
          title: 'Career Guidance Seminar',
          description: 'Seminar on career opportunities in technology',
          date: new Date('2024-11-20'),
          time: '14:00',
          location: 'Seminar Hall',
          organizer: null,
          category: 'career',
          status: 'upcoming',
          maxAttendees: 100,
          registeredStudents: []
        }
      ];

      await Event.insertMany(sampleEvents);
      console.log('✅ Sample events created');
    }

    console.log('\n🎉 Sample data seeding complete!');
    console.log('💡 You can now login and add your specific data');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedSampleData();
}

module.exports = { seedSampleData };
