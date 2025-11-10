import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Save, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [faculty, setFaculty] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    department: '',
    credits: 3,
    semester: '',
    year: new Date().getFullYear(),
    instructor: '',
    difficulty: 'intermediate',
    maxStudents: 50,
    prerequisites: [],
    syllabus: ''
  });

  const [prerequisiteInput, setPrerequisiteInput] = useState('');

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/faculty`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFaculty(response.data.faculty);
    } catch (error) {
      console.error('Fetch faculty error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPrerequisite = () => {
    if (prerequisiteInput.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prerequisiteInput.trim()]
      }));
      setPrerequisiteInput('');
    }
  };

  const removePrerequisite = (index) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      await axios.post(
        `${process.env.REACT_APP_API_URL}/courses`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Course added successfully!');
      navigate('/courses');
    } catch (error) {
      console.error('Add course error:', error);
      toast.error(error.response?.data?.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BookOpen className="mr-3 text-primary-600" size={32} />
            Add New Course
          </h1>
          <p className="text-gray-600 mt-1">Create a new course for students</p>
        </div>
        <button
          onClick={() => navigate('/courses')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., CS101"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Introduction to Programming"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credits *
              </label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                min="1"
                max="6"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Semester</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="2024"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level *
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Students *
              </label>
              <input
                type="number"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe the course objectives and content..."
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Instructor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructor
          </label>
          <select
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Instructor</option>
            {faculty.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name} - {f.designation}
              </option>
            ))}
          </select>
        </div>

        {/* Prerequisites */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prerequisites
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={prerequisiteInput}
              onChange={(e) => setPrerequisiteInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
              placeholder="e.g., CS100"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={addPrerequisite}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.prerequisites.map((prereq, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center space-x-2"
              >
                <span>{prereq}</span>
                <button
                  type="button"
                  onClick={() => removePrerequisite(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Syllabus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Syllabus
          </label>
          <textarea
            name="syllabus"
            value={formData.syllabus}
            onChange={handleChange}
            rows="6"
            placeholder="Enter course syllabus and topics..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Save size={20} />
            <span>{loading ? 'Adding...' : 'Add Course'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;
