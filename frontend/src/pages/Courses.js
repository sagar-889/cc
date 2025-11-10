import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Filter, Star, Users, Award } from 'lucide-react';
import { courseAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [filterDept]);

  const fetchCourses = async () => {
    try {
      const [allCoursesRes, enrolledRes] = await Promise.all([
        courseAPI.getAll({ department: filterDept }),
        courseAPI.getEnrolled()
      ]);
      
      setCourses(allCoursesRes.data.courses);
      setEnrolledCourses(enrolledRes.data.courses);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseAPI.enroll(courseId);
      toast.success('Successfully enrolled in course');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) return;
    
    try {
      await courseAPI.unenroll(courseId);
      toast.success('Successfully unenrolled from course');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to unenroll');
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(c => c._id === courseId);
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <BookOpen className="mr-3 text-primary-600" size={32} />
          Course Catalog
        </h1>
        <p className="text-gray-600 mt-1">Browse and enroll in courses</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">My Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-xl shadow-sm p-6 border-2 border-primary-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
                      {course.code}
                    </span>
                  </div>
                  <Star className="text-yellow-500 fill-yellow-500" size={20} />
                </div>
                <h3 className="font-bold text-lg mb-2">{course.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Award size={16} className="mr-1" />
                    {course.credits} Credits
                  </span>
                  <span className="flex items-center">
                    <Users size={16} className="mr-1" />
                    {course.enrolledStudents?.length || 0}/{course.maxStudents}
                  </span>
                </div>
                <button
                  onClick={() => handleUnenroll(course._id)}
                  className="w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Unenroll
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Courses */}
      <div>
        <h2 className="text-xl font-bold mb-4">Available Courses ({filteredCourses.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                  {course.code}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                  course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {course.difficulty}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2">{course.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{course.department}</p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <Award size={16} className="mr-1" />
                  {course.credits} Credits
                </span>
                <span className="flex items-center">
                  <Users size={16} className="mr-1" />
                  {course.enrolledStudents?.length || 0}/{course.maxStudents}
                </span>
              </div>

              {course.faculty && (
                <p className="text-sm text-gray-500 mb-4">
                  Instructor: {course.faculty.name}
                </p>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Details
                </button>
                {isEnrolled(course._id) ? (
                  <button
                    onClick={() => handleUnenroll(course._id)}
                    className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Unenroll
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(course._id)}
                    disabled={course.enrolledStudents?.length >= course.maxStudents}
                    className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Enroll
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded">
                  {selectedCourse.code}
                </span>
                <h2 className="text-2xl font-bold mt-2">{selectedCourse.name}</h2>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{selectedCourse.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Credits</h3>
                  <p className="text-gray-600">{selectedCourse.credits}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Department</h3>
                  <p className="text-gray-600">{selectedCourse.department}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Semester</h3>
                  <p className="text-gray-600">{selectedCourse.semester}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Difficulty</h3>
                  <p className="text-gray-600 capitalize">{selectedCourse.difficulty}</p>
                </div>
              </div>

              {selectedCourse.prerequisites?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Prerequisites</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.prerequisites.map((prereq, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCourse.syllabus && (
                <div>
                  <h3 className="font-semibold mb-2">Syllabus</h3>
                  <p className="text-gray-600">{selectedCourse.syllabus}</p>
                </div>
              )}

              {selectedCourse.faculty && (
                <div>
                  <h3 className="font-semibold mb-2">Instructor</h3>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedCourse.faculty.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{selectedCourse.faculty.name}</p>
                      <p className="text-sm text-gray-600">{selectedCourse.faculty.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              {isEnrolled(selectedCourse._id) ? (
                <button
                  onClick={() => {
                    handleUnenroll(selectedCourse._id);
                    setSelectedCourse(null);
                  }}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Unenroll from Course
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleEnroll(selectedCourse._id);
                    setSelectedCourse(null);
                  }}
                  disabled={selectedCourse.enrolledStudents?.length >= selectedCourse.maxStudents}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Enroll in Course
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
