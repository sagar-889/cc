import React, { useState } from 'react';
import { UserPlus, Save, X, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AddFaculty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    office: '',
    bio: '',
    specialization: [],
    qualifications: [],
    officeHours: [],
    availableForAppointment: true
  });

  const [specializationInput, setSpecializationInput] = useState('');
  const [qualificationInput, setQualificationInput] = useState('');
  const [officeHourInput, setOfficeHourInput] = useState({
    day: '',
    startTime: '',
    endTime: ''
  });

  const departments = [
    'Computer Science and Engineering',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Artificial Intelligence and Data Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'English',
    'Management Studies'
  ];

  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Senior Lecturer',
    'Lecturer',
    'Head of Department',
    'Dean',
    'Director'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addSpecialization = () => {
    if (specializationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, specializationInput.trim()]
      }));
      setSpecializationInput('');
    }
  };

  const removeSpecialization = (index) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter((_, i) => i !== index)
    }));
  };

  const addQualification = () => {
    if (qualificationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, qualificationInput.trim()]
      }));
      setQualificationInput('');
    }
  };

  const removeQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const addOfficeHour = () => {
    if (officeHourInput.day && officeHourInput.startTime && officeHourInput.endTime) {
      setFormData(prev => ({
        ...prev,
        officeHours: [...prev.officeHours, { ...officeHourInput }]
      }));
      setOfficeHourInput({ day: '', startTime: '', endTime: '' });
    }
  };

  const removeOfficeHour = (index) => {
    setFormData(prev => ({
      ...prev,
      officeHours: prev.officeHours.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/faculty`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Faculty member added successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Add faculty error:', error);
      toast.error(error.response?.data?.message || 'Failed to add faculty member');
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
            <UserPlus className="mr-3 text-primary-600" size={32} />
            Add Faculty Member
          </h1>
          <p className="text-gray-600 mt-2">Add a new faculty member to the system</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
        >
          <X size={20} className="mr-2" />
          Cancel
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Dr. John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="john.doe@vignan.ac.in"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Location
              </label>
              <input
                type="text"
                name="office"
                value={formData.office}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Room 301, CSE Block"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation *
              </label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Designation</option>
                {designations.map(des => (
                  <option key={des} value={des}>{des}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio / About
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Brief description about the faculty member..."
            />
          </div>
        </div>

        {/* Specialization */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Areas of Specialization</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={specializationInput}
              onChange={(e) => setSpecializationInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Machine Learning, Data Structures"
            />
            <button
              type="button"
              onClick={addSpecialization}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
            >
              <Plus size={20} className="mr-1" />
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.specialization.map((spec, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center"
              >
                {spec}
                <button
                  type="button"
                  onClick={() => removeSpecialization(index)}
                  className="ml-2 text-primary-900 hover:text-primary-700"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Qualifications */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Qualifications</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={qualificationInput}
              onChange={(e) => setQualificationInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Ph.D. in Computer Science, IIT Delhi"
            />
            <button
              type="button"
              onClick={addQualification}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
            >
              <Plus size={20} className="mr-1" />
              Add
            </button>
          </div>
          <div className="space-y-2">
            {formData.qualifications.map((qual, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">{qual}</span>
                <button
                  type="button"
                  onClick={() => removeQualification(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Office Hours */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Office Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <select
              value={officeHourInput.day}
              onChange={(e) => setOfficeHourInput(prev => ({ ...prev, day: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Day</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <input
              type="time"
              value={officeHourInput.startTime}
              onChange={(e) => setOfficeHourInput(prev => ({ ...prev, startTime: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="time"
              value={officeHourInput.endTime}
              onChange={(e) => setOfficeHourInput(prev => ({ ...prev, endTime: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addOfficeHour}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center"
            >
              <Plus size={20} className="mr-1" />
              Add
            </button>
          </div>
          <div className="space-y-2">
            {formData.officeHours.map((hour, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">
                  {hour.day}: {hour.startTime} - {hour.endTime}
                </span>
                <button
                  type="button"
                  onClick={() => removeOfficeHour(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="availableForAppointment"
              checked={formData.availableForAppointment}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Available for student appointments
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center"
          >
            <Save size={20} className="mr-2" />
            {loading ? 'Adding...' : 'Add Faculty Member'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFaculty;
