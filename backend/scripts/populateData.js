const mongoose = require('mongoose');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Navigation = require('../models/Navigation');
const Event = require('../models/Event');
const User = require('../models/User');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://campusadmin:Niharika1234@cluster0.3c4ud6.mongodb.net/campus-companion?retryWrites=true&w=majority&appName=Cluster0';

async function populateData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check existing data
    const courseCount = await Course.countDocuments();
    const facultyCount = await Faculty.countDocuments();
    const navigationCount = await Navigation.countDocuments();
    const eventCount = await Event.countDocuments();

    console.log('\n=== CURRENT DATA COUNT ===');
    console.log(`Courses: ${courseCount}`);
    console.log(`Faculty: ${facultyCount}`);
    console.log(`Navigation: ${navigationCount}`);
    console.log(`Events: ${eventCount}`);

    // Add sample courses if none exist
    if (courseCount === 0) {
      console.log('\n📚 Adding sample courses...');
      const sampleCourses = [
        {
          code: 'CS101',
          name: 'Introduction to Computer Science',
          description: 'Basic concepts of computer science and programming',
          credits: 4,
          department: 'Computer Science',
          semester: '1',
          faculty: 'Dr. Smith',
          schedule: {
            days: ['Monday', 'Wednesday', 'Friday'],
            time: '09:00-10:00',
            room: 'CS-101'
          }
        },
        {
          code: 'CS201',
          name: 'Data Structures and Algorithms',
          description: 'Fundamental data structures and algorithmic techniques',
          credits: 4,
          department: 'Computer Science',
          semester: '3',
          faculty: 'Dr. Johnson',
          schedule: {
            days: ['Tuesday', 'Thursday'],
            time: '11:00-12:30',
            room: 'CS-201'
          }
        },
        {
          code: 'MATH101',
          name: 'Calculus I',
          description: 'Differential and integral calculus',
          credits: 3,
          department: 'Mathematics',
          semester: '1',
          faculty: 'Dr. Brown',
          schedule: {
            days: ['Monday', 'Wednesday', 'Friday'],
            time: '10:00-11:00',
            room: 'MATH-101'
          }
        },
        {
          code: 'ENG101',
          name: 'English Communication',
          description: 'Written and oral communication skills',
          credits: 2,
          department: 'English',
          semester: '1',
          faculty: 'Prof. Davis',
          schedule: {
            days: ['Tuesday', 'Thursday'],
            time: '14:00-15:00',
            room: 'ENG-101'
          }
        }
      ];

      await Course.insertMany(sampleCourses);
      console.log(`✅ Added ${sampleCourses.length} courses`);
    }

    // Add sample faculty if none exist
    if (facultyCount === 0) {
      console.log('\n👨‍🏫 Adding sample faculty...');
      const sampleFaculty = [
        {
          name: 'Dr. John Smith',
          email: 'john.smith@campus.edu',
          department: 'Computer Science',
          designation: 'Professor',
          phone: '+1-555-0101',
          office: 'CS-301',
          specialization: ['Artificial Intelligence', 'Machine Learning'],
          experience: '15 years',
          qualifications: 'Ph.D. in Computer Science'
        },
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@campus.edu',
          department: 'Computer Science',
          designation: 'Associate Professor',
          phone: '+1-555-0102',
          office: 'CS-302',
          specialization: ['Data Structures', 'Algorithms'],
          experience: '10 years',
          qualifications: 'Ph.D. in Computer Science'
        },
        {
          name: 'Dr. Michael Brown',
          email: 'michael.brown@campus.edu',
          department: 'Mathematics',
          designation: 'Professor',
          phone: '+1-555-0103',
          office: 'MATH-201',
          specialization: ['Calculus', 'Linear Algebra'],
          experience: '20 years',
          qualifications: 'Ph.D. in Mathematics'
        },
        {
          name: 'Prof. Emily Davis',
          email: 'emily.davis@campus.edu',
          department: 'English',
          designation: 'Assistant Professor',
          phone: '+1-555-0104',
          office: 'ENG-201',
          specialization: ['Communication', 'Literature'],
          experience: '8 years',
          qualifications: 'M.A. in English Literature'
        }
      ];

      await Faculty.insertMany(sampleFaculty);
      console.log(`✅ Added ${sampleFaculty.length} faculty members`);
    }

    // Add sample navigation if none exist
    if (navigationCount === 0) {
      console.log('\n🗺️ Adding sample navigation...');
      const sampleNavigation = [
        {
          name: 'Main Library',
          type: 'library',
          location: 'Block A, Ground Floor',
          coordinates: { latitude: 17.4435, longitude: 78.3772 },
          description: 'Central library with books, journals, and study areas',
          facilities: ['Books', 'Journals', 'Study Rooms', 'Computer Lab'],
          timings: 'Mon-Sat: 8:00 AM - 8:00 PM',
          contact: '+91-40-12345678'
        },
        {
          name: 'Computer Science Department',
          type: 'department',
          location: 'Block B, 2nd Floor',
          coordinates: { latitude: 17.4440, longitude: 78.3775 },
          description: 'Computer Science and Engineering Department',
          facilities: ['Classrooms', 'Labs', 'Faculty Offices'],
          timings: 'Mon-Fri: 9:00 AM - 5:00 PM',
          contact: '+91-40-12345679'
        },
        {
          name: 'Student Cafeteria',
          type: 'cafeteria',
          location: 'Block C, Ground Floor',
          coordinates: { latitude: 17.4438, longitude: 78.3770 },
          description: 'Main dining facility for students and staff',
          facilities: ['Dining Hall', 'Food Court', 'Snack Bar'],
          timings: 'Mon-Sun: 7:00 AM - 10:00 PM',
          contact: '+91-40-12345680'
        },
        {
          name: 'Administrative Office',
          type: 'office',
          location: 'Block A, 1st Floor',
          coordinates: { latitude: 17.4436, longitude: 78.3773 },
          description: 'Main administrative office for student services',
          facilities: ['Admissions', 'Accounts', 'Student Records'],
          timings: 'Mon-Fri: 9:00 AM - 5:00 PM',
          contact: '+91-40-12345681'
        },
        {
          name: 'Sports Complex',
          type: 'sports',
          location: 'Behind Block D',
          coordinates: { latitude: 17.4442, longitude: 78.3768 },
          description: 'Indoor and outdoor sports facilities',
          facilities: ['Basketball Court', 'Tennis Court', 'Gym', 'Swimming Pool'],
          timings: 'Mon-Sun: 6:00 AM - 9:00 PM',
          contact: '+91-40-12345682'
        }
      ];

      await Navigation.insertMany(sampleNavigation);
      console.log(`✅ Added ${sampleNavigation.length} navigation points`);
    }

    // Add sample events if none exist
    if (eventCount === 0) {
      console.log('\n🎉 Adding sample events...');
      const sampleEvents = [
        {
          title: 'Tech Fest 2025',
          description: 'Annual technology festival with competitions, workshops, and exhibitions',
          startDate: new Date('2025-03-15T09:00:00'),
          endDate: new Date('2025-03-17T18:00:00'),
          location: 'Main Auditorium',
          type: 'fest',
          organizer: 'Computer Science Club',
          contactEmail: 'techfest@campus.edu',
          contactPhone: '+91-40-12345683',
          maxParticipants: 500,
          registrationDeadline: new Date('2025-03-10T23:59:59'),
          tags: ['technology', 'competition', 'workshop'],
          status: 'upcoming'
        },
        {
          title: 'AI Workshop Series',
          description: 'Three-day workshop on Artificial Intelligence and Machine Learning',
          startDate: new Date('2025-02-20T10:00:00'),
          endDate: new Date('2025-02-22T16:00:00'),
          location: 'CS Lab 1',
          type: 'workshop',
          organizer: 'Dr. John Smith',
          contactEmail: 'ai.workshop@campus.edu',
          contactPhone: '+91-40-12345684',
          maxParticipants: 50,
          registrationDeadline: new Date('2025-02-15T23:59:59'),
          tags: ['AI', 'machine learning', 'workshop'],
          status: 'upcoming'
        },
        {
          title: 'Cultural Night',
          description: 'Evening of music, dance, and cultural performances',
          startDate: new Date('2025-04-05T18:00:00'),
          endDate: new Date('2025-04-05T22:00:00'),
          location: 'Open Air Theatre',
          type: 'cultural',
          organizer: 'Cultural Committee',
          contactEmail: 'cultural@campus.edu',
          contactPhone: '+91-40-12345685',
          maxParticipants: 1000,
          registrationDeadline: new Date('2025-04-01T23:59:59'),
          tags: ['cultural', 'music', 'dance'],
          status: 'upcoming'
        }
      ];

      await Event.insertMany(sampleEvents);
      console.log(`✅ Added ${sampleEvents.length} events`);
    }

    // Final count
    const finalCourseCount = await Course.countDocuments();
    const finalFacultyCount = await Faculty.countDocuments();
    const finalNavigationCount = await Navigation.countDocuments();
    const finalEventCount = await Event.countDocuments();

    console.log('\n=== FINAL DATA COUNT ===');
    console.log(`Courses: ${finalCourseCount}`);
    console.log(`Faculty: ${finalFacultyCount}`);
    console.log(`Navigation: ${finalNavigationCount}`);
    console.log(`Events: ${finalEventCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Database populated successfully!');
    console.log('🔄 Please refresh your frontend to see the data.');

  } catch (error) {
    console.error('❌ Error populating data:', error);
  }
}

populateData();
