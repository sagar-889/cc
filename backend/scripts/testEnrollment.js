const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCourseEnrollment() {
  console.log('🧪 Testing Course Enrollment via Chatbot...\n');

  try {
    // First, let's get a valid auth token (you'll need to replace this with actual login)
    console.log('Step 1: Testing chatbot enrollment message...');
    
    // Test the chatbot enrollment message
    const chatResponse = await axios.post(
      `${BASE_URL}/chatbot/chat`,
      { message: 'enroll me in 22CS406' },
      { 
        headers: { 
          'Authorization': 'Bearer YOUR_TOKEN_HERE',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Chatbot Response:', chatResponse.data.response);
    
    // Check enrolled courses
    console.log('\nStep 2: Checking enrolled courses...');
    const enrolledResponse = await axios.get(
      `${BASE_URL}/courses/enrolled/me`,
      { 
        headers: { 
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
      }
    );
    
    console.log('✅ Enrolled Courses:', enrolledResponse.data);
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('🔐 Authentication required - this is expected for testing');
      console.log('💡 To test properly, log in through the frontend first');
    } else {
      console.error('❌ Test Error:', error.response?.data || error.message);
    }
  }
}

// Test without authentication to check API structure
async function testAPIStructure() {
  console.log('🔍 Testing API Structure...\n');
  
  try {
    // Test courses endpoint
    const coursesResponse = await axios.get(`${BASE_URL}/courses`);
    console.log('✅ Courses API working:', coursesResponse.data.count, 'courses available');
    
    if (coursesResponse.data.courses && coursesResponse.data.courses.length > 0) {
      const course = coursesResponse.data.courses[0];
      console.log('📚 Sample Course:', {
        id: course._id,
        code: course.code,
        name: course.name,
        enrolledStudents: course.enrolledStudents?.length || 0
      });
    }
    
  } catch (error) {
    console.error('❌ API Structure Test Error:', error.response?.data || error.message);
  }
}

console.log('🚀 Starting Course Enrollment Tests...\n');
testAPIStructure().then(() => {
  console.log('\n' + '='.repeat(50) + '\n');
  return testCourseEnrollment();
}).then(() => {
  console.log('\n✅ Tests completed!');
}).catch(console.error);
