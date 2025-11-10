const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
require('dotenv').config();

const facultyData = [
  {
    name: 'Mr. Kiran Kumar Raveti',
    email: 'kiran.raveti@vignan.ac.in',
    phone: '+91 9876543210',
    department: 'Principal',
    designation: 'Principal',
    office: 'Principal Office, Admin Block',
    bio: 'Principal of the institution with extensive experience in educational administration and leadership.',
    specialization: ['Educational Leadership', 'Academic Administration', 'Strategic Planning'],
    qualifications: ['Ph.D. in Education Management', 'M.Tech in Computer Science'],
    officeHours: [
      { day: 'Monday', startTime: '10:00', endTime: '12:00' },
      { day: 'Wednesday', startTime: '10:00', endTime: '12:00' },
      { day: 'Friday', startTime: '10:00', endTime: '12:00' }
    ],
    availableForAppointment: true
  },
  {
    name: 'Mr. K. Srujan Raju',
    email: 'srujan.raju@vignan.ac.in',
    phone: '+91 9876543211',
    department: 'Business Development and Administration',
    designation: 'Director - BDA',
    office: 'BDA Office, Admin Block',
    bio: 'Director of Business Development and Administration, focusing on institutional growth and strategic partnerships.',
    specialization: ['Business Development', 'Strategic Partnerships', 'Institutional Growth', 'Administration'],
    qualifications: ['MBA in Business Administration', 'B.Tech in Engineering'],
    officeHours: [
      { day: 'Tuesday', startTime: '11:00', endTime: '13:00' },
      { day: 'Thursday', startTime: '11:00', endTime: '13:00' }
    ],
    availableForAppointment: true
  },
  {
    name: 'Mr. P. Vijaya Babu',
    email: 'vijaya.babu@vignan.ac.in',
    phone: '+91 9876543212',
    department: 'Chief Controller',
    designation: 'Chief Controller',
    office: 'Controller Office, Admin Block',
    bio: 'Chief Controller overseeing academic operations, examinations, and administrative coordination.',
    specialization: ['Academic Operations', 'Examination Management', 'Administrative Coordination', 'Quality Assurance'],
    qualifications: ['M.Tech in Computer Science', 'B.Tech in Engineering'],
    officeHours: [
      { day: 'Monday', startTime: '14:00', endTime: '16:00' },
      { day: 'Wednesday', startTime: '14:00', endTime: '16:00' },
      { day: 'Friday', startTime: '14:00', endTime: '16:00' }
    ],
    availableForAppointment: true
  },
  {
    name: 'Mr. K. Ramesh',
    email: 'ramesh.k@vignan.ac.in',
    phone: '+91 9876543213',
    department: 'Registrar',
    designation: 'Registrar',
    office: 'Registrar Office, Admin Block',
    bio: 'Registrar managing student records, admissions, and academic documentation.',
    specialization: ['Student Records Management', 'Admissions', 'Academic Documentation', 'Compliance'],
    qualifications: ['M.A. in Public Administration', 'B.A. in Political Science'],
    officeHours: [
      { day: 'Monday', startTime: '09:00', endTime: '11:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '11:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '11:00' }
    ],
    availableForAppointment: true
  },
  {
    name: 'Dr. E. Deepak Chowdary',
    email: 'deepak.chowdary@vignan.ac.in',
    phone: '+91 9876543214',
    department: 'Training and Placement',
    designation: 'Director - Training and Placement',
    office: 'T&P Office, Admin Block',
    bio: 'Director of Training and Placement, facilitating career opportunities and industry connections for students.',
    specialization: ['Career Counseling', 'Industry Relations', 'Placement Strategy', 'Skill Development'],
    qualifications: ['Ph.D. in Human Resource Management', 'MBA in HR', 'B.Tech in Computer Science'],
    officeHours: [
      { day: 'Monday', startTime: '15:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '15:00', endTime: '17:00' },
      { day: 'Friday', startTime: '15:00', endTime: '17:00' }
    ],
    availableForAppointment: true
  }
];

async function seedFaculty() {
  console.log('🌱 Seeding Faculty Data...\n');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing faculty (optional - comment out if you want to keep existing data)
    // await Faculty.deleteMany({});
    // console.log('🗑️  Cleared existing faculty data\n');

    // Check for duplicates and add only new faculty
    let addedCount = 0;
    let skippedCount = 0;

    for (const facultyInfo of facultyData) {
      const existing = await Faculty.findOne({ email: facultyInfo.email });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${facultyInfo.name} (already exists)`);
        skippedCount++;
      } else {
        const faculty = new Faculty(facultyInfo);
        await faculty.save();
        console.log(`✅ Added: ${facultyInfo.name} - ${facultyInfo.designation}`);
        addedCount++;
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('🎉 Faculty Seeding Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Added: ${addedCount} faculty members`);
    console.log(`⏭️  Skipped: ${skippedCount} (already exist)`);
    console.log(`📊 Total: ${addedCount + skippedCount} faculty members processed`);
    
    // Display all faculty
    const allFaculty = await Faculty.find().select('name email designation department');
    console.log('\n📋 All Faculty in Database:');
    console.log('═══════════════════════════════════════');
    allFaculty.forEach((f, index) => {
      console.log(`${index + 1}. ${f.name}`);
      console.log(`   Designation: ${f.designation}`);
      console.log(`   Department: ${f.department}`);
      console.log(`   Email: ${f.email}\n`);
    });

    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error seeding faculty:');
    console.error(error.message);
    
    if (error.code === 11000) {
      console.error('\n💡 Duplicate key error. Some faculty members already exist.');
      console.error('   This is normal if you\'re running the script multiple times.');
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the seeding function
seedFaculty();
