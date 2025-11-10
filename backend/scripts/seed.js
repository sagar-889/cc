const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Event = require('../models/Event');
const Navigation = require('../models/Navigation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-companion';

// Sample data
const sampleFaculty = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    phone: '+1-555-0101',
    department: 'Computer Science',
    designation: 'Professor',
    office: 'CS Building, Room 301',
    specialization: ['Artificial Intelligence', 'Machine Learning', 'Data Science'],
    qualifications: ['PhD in Computer Science', 'MS in AI'],
    officeHours: [
      { day: 'Monday', startTime: '10:00', endTime: '12:00' },
      { day: 'Wednesday', startTime: '14:00', endTime: '16:00' }
    ],
    bio: 'Dr. Johnson specializes in AI and has published over 50 research papers.',
    availableForAppointment: true
  },
  {
    name: 'Prof. Michael Chen',
    email: 'michael.chen@university.edu',
    phone: '+1-555-0102',
    department: 'Computer Science',
    designation: 'Associate Professor',
    office: 'CS Building, Room 205',
    specialization: ['Software Engineering', 'Web Development', 'Cloud Computing'],
    qualifications: ['PhD in Software Engineering', 'MS in Computer Science'],
    officeHours: [
      { day: 'Tuesday', startTime: '11:00', endTime: '13:00' },
      { day: 'Thursday', startTime: '15:00', endTime: '17:00' }
    ],
    bio: 'Prof. Chen has 15 years of industry experience before joining academia.',
    availableForAppointment: true
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@university.edu',
    phone: '+1-555-0103',
    department: 'Mathematics',
    designation: 'Professor',
    office: 'Math Building, Room 401',
    specialization: ['Applied Mathematics', 'Statistics', 'Numerical Analysis'],
    qualifications: ['PhD in Mathematics', 'MS in Statistics'],
    officeHours: [
      { day: 'Monday', startTime: '13:00', endTime: '15:00' },
      { day: 'Friday', startTime: '10:00', endTime: '12:00' }
    ],
    bio: 'Dr. Rodriguez focuses on applied mathematics and statistical modeling.',
    availableForAppointment: true
  }
];

const sampleCourses = [
  {
    code: 'CS101',
    name: 'Introduction to Programming',
    description: 'Fundamentals of programming using Python. Covers variables, control structures, functions, and basic algorithms.',
    credits: 4,
    department: 'Computer Science',
    semester: 1,
    prerequisites: [],
    syllabus: 'Introduction to programming concepts, Python basics, data structures, algorithms',
    maxStudents: 60,
    tags: ['programming', 'python', 'beginner'],
    difficulty: 'beginner'
  },
  {
    code: 'CS201',
    name: 'Data Structures and Algorithms',
    description: 'Study of fundamental data structures and algorithms. Includes arrays, linked lists, trees, graphs, sorting, and searching.',
    credits: 4,
    department: 'Computer Science',
    semester: 3,
    prerequisites: ['CS101'],
    syllabus: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, Searching',
    maxStudents: 50,
    tags: ['algorithms', 'data-structures', 'intermediate'],
    difficulty: 'intermediate'
  },
  {
    code: 'CS301',
    name: 'Artificial Intelligence',
    description: 'Introduction to AI concepts including search algorithms, machine learning, neural networks, and natural language processing.',
    credits: 4,
    department: 'Computer Science',
    semester: 5,
    prerequisites: ['CS201'],
    syllabus: 'Search algorithms, ML basics, Neural Networks, NLP, Computer Vision',
    maxStudents: 40,
    tags: ['ai', 'machine-learning', 'advanced'],
    difficulty: 'advanced'
  },
  {
    code: 'CS202',
    name: 'Database Management Systems',
    description: 'Comprehensive study of database design, SQL, normalization, transactions, and database administration.',
    credits: 3,
    department: 'Computer Science',
    semester: 4,
    prerequisites: ['CS101'],
    syllabus: 'Database design, SQL, Normalization, Transactions, Indexing',
    maxStudents: 55,
    tags: ['database', 'sql', 'intermediate'],
    difficulty: 'intermediate'
  },
  {
    code: 'CS302',
    name: 'Web Development',
    description: 'Full-stack web development covering HTML, CSS, JavaScript, React, Node.js, and MongoDB.',
    credits: 4,
    department: 'Computer Science',
    semester: 5,
    prerequisites: ['CS101'],
    syllabus: 'HTML/CSS, JavaScript, React, Node.js, Express, MongoDB',
    maxStudents: 45,
    tags: ['web-development', 'javascript', 'react', 'intermediate'],
    difficulty: 'intermediate'
  },
  {
    code: 'MATH201',
    name: 'Linear Algebra',
    description: 'Study of vector spaces, matrices, linear transformations, eigenvalues, and applications.',
    credits: 3,
    department: 'Mathematics',
    semester: 3,
    prerequisites: [],
    syllabus: 'Vectors, Matrices, Linear Transformations, Eigenvalues, Applications',
    maxStudents: 60,
    tags: ['mathematics', 'linear-algebra', 'intermediate'],
    difficulty: 'intermediate'
  },
  {
    code: 'MATH301',
    name: 'Probability and Statistics',
    description: 'Probability theory, random variables, distributions, hypothesis testing, and statistical inference.',
    credits: 3,
    department: 'Mathematics',
    semester: 5,
    prerequisites: ['MATH201'],
    syllabus: 'Probability, Random Variables, Distributions, Hypothesis Testing',
    maxStudents: 50,
    tags: ['statistics', 'probability', 'intermediate'],
    difficulty: 'intermediate'
  }
];

const sampleEvents = [
  {
    title: 'TechFest 2025',
    description: 'Annual technology festival featuring hackathons, workshops, and tech talks from industry experts.',
    type: 'fest',
    organizer: 'Computer Science Department',
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-03-17'),
    location: 'Main Campus',
    venue: 'Auditorium and CS Labs',
    registrationRequired: true,
    registrationLink: 'https://university.edu/techfest',
    maxParticipants: 500,
    tags: ['technology', 'hackathon', 'workshop'],
    contactEmail: 'techfest@university.edu',
    contactPhone: '+1-555-0200',
    status: 'upcoming'
  },
  {
    title: 'AI/ML Workshop',
    description: 'Hands-on workshop on machine learning fundamentals and practical applications using Python.',
    type: 'workshop',
    organizer: 'AI Club',
    startDate: new Date('2025-02-20'),
    endDate: new Date('2025-02-20'),
    location: 'CS Building',
    venue: 'Lab 101',
    registrationRequired: true,
    maxParticipants: 50,
    tags: ['ai', 'machine-learning', 'workshop'],
    contactEmail: 'aiclub@university.edu',
    status: 'upcoming'
  },
  {
    title: 'Career Fair 2025',
    description: 'Meet recruiters from top tech companies. Bring your resume and portfolio!',
    type: 'seminar',
    organizer: 'Career Services',
    startDate: new Date('2025-04-10'),
    endDate: new Date('2025-04-10'),
    location: 'Main Campus',
    venue: 'Sports Complex',
    registrationRequired: false,
    tags: ['career', 'recruitment', 'networking'],
    contactEmail: 'careers@university.edu',
    status: 'upcoming'
  },
  {
    title: 'Coding Competition',
    description: 'Test your programming skills in this competitive coding event. Prizes for top performers!',
    type: 'hackathon',
    organizer: 'Coding Club',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-03-01'),
    location: 'CS Building',
    venue: 'Lab 201',
    registrationRequired: true,
    maxParticipants: 100,
    tags: ['coding', 'competition', 'programming'],
    contactEmail: 'codingclub@university.edu',
    status: 'upcoming'
  }
];

const sampleLocations = [
  {
    name: 'Computer Science Building',
    type: 'building',
    block: 'Block A',
    description: 'Main building for Computer Science department with labs and faculty offices',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    department: 'Computer Science',
    facilities: ['Labs', 'Classrooms', 'Faculty Offices', 'Library'],
    openingHours: { weekdays: '8:00 AM - 8:00 PM', weekends: '9:00 AM - 5:00 PM' },
    isAccessible: true,
    tags: ['cs', 'labs', 'building']
  },
  {
    name: 'CS Lab 101',
    type: 'lab',
    block: 'Block A',
    floor: 1,
    roomNumber: '101',
    description: 'Programming lab with 50 workstations',
    coordinates: { lat: 40.7129, lng: -74.0061 },
    department: 'Computer Science',
    facilities: ['Computers', 'Projector', 'Whiteboard'],
    openingHours: { weekdays: '8:00 AM - 8:00 PM', weekends: 'Closed' },
    isAccessible: true,
    tags: ['lab', 'programming']
  },
  {
    name: 'Mathematics Building',
    type: 'building',
    block: 'Block B',
    description: 'Mathematics department building with classrooms and research facilities',
    coordinates: { lat: 40.7130, lng: -74.0062 },
    department: 'Mathematics',
    facilities: ['Classrooms', 'Faculty Offices', 'Study Rooms'],
    openingHours: { weekdays: '8:00 AM - 7:00 PM', weekends: '9:00 AM - 4:00 PM' },
    isAccessible: true,
    tags: ['mathematics', 'building']
  },
  {
    name: 'Main Library',
    type: 'facility',
    block: 'Central Campus',
    description: 'University main library with extensive collection and study spaces',
    coordinates: { lat: 40.7131, lng: -74.0063 },
    facilities: ['Books', 'Study Rooms', 'Computers', 'WiFi', 'Printing'],
    openingHours: { weekdays: '7:00 AM - 11:00 PM', weekends: '9:00 AM - 9:00 PM' },
    isAccessible: true,
    tags: ['library', 'study', 'books']
  },
  {
    name: 'Student Center',
    type: 'facility',
    block: 'Central Campus',
    description: 'Hub for student activities, cafeteria, and recreation',
    coordinates: { lat: 40.7132, lng: -74.0064 },
    facilities: ['Cafeteria', 'Recreation Room', 'Meeting Rooms', 'ATM'],
    openingHours: { weekdays: '7:00 AM - 10:00 PM', weekends: '9:00 AM - 8:00 PM' },
    isAccessible: true,
    tags: ['student-center', 'cafeteria', 'recreation']
  },
  {
    name: 'Auditorium',
    type: 'facility',
    block: 'Block C',
    description: 'Main auditorium for events, seminars, and presentations',
    coordinates: { lat: 40.7133, lng: -74.0065 },
    facilities: ['Seating 500', 'Stage', 'Audio/Visual Equipment', 'AC'],
    openingHours: { weekdays: '8:00 AM - 9:00 PM', weekends: 'By Booking' },
    isAccessible: true,
    tags: ['auditorium', 'events', 'seminars']
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Faculty.deleteMany({});
    await Course.deleteMany({});
    await Event.deleteMany({});
    await Navigation.deleteMany({});

    // Insert faculty
    console.log('👨‍🏫 Inserting faculty...');
    const faculty = await Faculty.insertMany(sampleFaculty);
    console.log(`✅ Inserted ${faculty.length} faculty members`);

    // Insert courses and link to faculty
    console.log('📚 Inserting courses...');
    const coursesWithFaculty = sampleCourses.map((course, index) => ({
      ...course,
      faculty: faculty[index % faculty.length]._id
    }));
    const courses = await Course.insertMany(coursesWithFaculty);
    console.log(`✅ Inserted ${courses.length} courses`);

    // Insert events
    console.log('🎉 Inserting events...');
    const events = await Event.insertMany(sampleEvents);
    console.log(`✅ Inserted ${events.length} events`);

    // Insert navigation locations
    console.log('🗺️  Inserting navigation locations...');
    const locations = await Navigation.insertMany(sampleLocations);
    console.log(`✅ Inserted ${locations.length} locations`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Faculty: ${faculty.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Events: ${events.length}`);
    console.log(`   - Locations: ${locations.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
