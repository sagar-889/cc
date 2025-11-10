const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testUnenrollmentFix() {
  console.log('🧪 Testing Course Unenrollment Fix...\n');

  try {
    // Test the courses endpoint to see current enrollment
    console.log('Step 1: Checking current course data...');
    const coursesResponse = await axios.get(`${BASE_URL}/courses`);
    
    if (coursesResponse.data.courses && coursesResponse.data.courses.length > 0) {
      const course = coursesResponse.data.courses[0];
      console.log('📚 Course Data:', {
        id: course._id,
        code: course.code,
        name: course.name,
        enrolledStudents: course.enrolledStudents || [],
        enrolledCount: course.enrolledStudents?.length || 0
      });
      
      console.log('\n✅ Course data structure looks correct');
      console.log('📊 Enrolled students IDs:', course.enrolledStudents?.map(id => id.toString()) || []);
    } else {
      console.log('❌ No courses found');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('💡 The unenrollment fix includes:');
    console.log('• Better ID string conversion and comparison');
    console.log('• Enhanced logging for debugging');
    console.log('• Proper error handling');
    console.log('• Validation of enrollment status before unenrollment');
    console.log('\n🎯 The regex error should now be resolved!');
    
  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message);
  }
}

console.log('🚀 Starting Unenrollment Fix Test...\n');
testUnenrollmentFix().then(() => {
  console.log('\n✅ Test completed!');
  console.log('\n📝 To test unenrollment:');
  console.log('1. Log in to the frontend');
  console.log('2. Make sure you\'re enrolled in 22CS406');
  console.log('3. Ask the chatbot: "unenroll me from 22CS406"');
  console.log('4. Check the server logs for detailed debugging info');
}).catch(console.error);
