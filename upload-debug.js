// Upload Debug Script
// Run this in browser console (F12) when on Add Material page

console.log('🔍 Upload Debug Info:');

// Check form data
const form = document.querySelector('form');
const formData = new FormData(form);
console.log('📝 Form data entries:');
for (let [key, value] of formData.entries()) {
  console.log(`${key}: ${value}`);
}

// Check if courses are loaded
console.log('📚 Courses available:', window.courses?.length || 'Not found');

// Check current state
console.log('🔐 Auth state:', JSON.parse(localStorage.getItem('auth-storage'))?.state);

// Test API endpoint
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(data => console.log('🏥 Backend health:', data))
  .catch(e => console.log('❌ Backend not reachable:', e.message));
