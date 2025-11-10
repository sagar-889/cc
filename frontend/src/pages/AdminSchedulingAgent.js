import React, { useState } from 'react';
import { Calendar, Sparkles, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminSchedulingAgent = () => {
  const [loading, setLoading] = useState(false);
  const [scheduleType, setScheduleType] = useState('timetable');
  const [scheduleData, setScheduleData] = useState({
    department: '',
    year: '',
    section: '',
    semester: '',
    courses: '',
    startDate: '',
    numberOfSections: '1'
  });
  const [generatedSchedule, setGeneratedSchedule] = useState(null);

  const scheduleTypes = [
    {
      id: 'timetable',
      name: 'Timetable Generation',
      icon: Calendar,
      description: 'Generate optimal class timetables with no conflicts',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'exam_schedule',
      name: 'Exam Schedule',
      icon: Clock,
      description: 'Create exam schedules with proper spacing',
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'room_allocation',
      name: 'Room Allocation',
      icon: Users,
      description: 'Optimize room assignments for events and classes',
      color: 'from-green-600 to-emerald-600'
    },
    {
      id: 'faculty_workload',
      name: 'Faculty Workload Balancing',
      icon: Users,
      description: 'Balance teaching load across faculty members',
      color: 'from-orange-600 to-red-600'
    }
  ];

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  const generateSchedule = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let payload = {};

      if (scheduleType === 'timetable') {
        endpoint = '/admin/agentic/scheduling/timetable';
        const courseList = scheduleData.courses.split(',').map(c => ({ name: c.trim() }));
        payload = {
          department: scheduleData.department,
          year: scheduleData.year,
          courses: courseList
        };
      } else if (scheduleType === 'exam_schedule') {
        endpoint = '/admin/agentic/scheduling/exam-schedule';
        const courseList = scheduleData.courses.split(',').map(c => ({ name: c.trim() }));
        payload = {
          courses: courseList,
          startDate: scheduleData.startDate
        };
      } else {
        endpoint = '/admin/agentic/scheduling/optimize';
        payload = {
          scheduleType,
          data: scheduleData
        };
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setGeneratedSchedule(response.data);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <Calendar className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Automated Scheduling Agent</h1>
              <p className="text-blue-100 text-lg">
                AI-powered timetable generation and resource optimization
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Type Selection */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Select Schedule Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduleTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  onClick={() => setScheduleType(type.id)}
                  className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                    scheduleType === type.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Schedule Details</h2>
          <div className="space-y-4">
            {(scheduleType === 'timetable' || scheduleType === 'exam_schedule') && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                    <input
                      type="text"
                      value={scheduleData.department}
                      onChange={(e) => setScheduleData({...scheduleData, department: e.target.value})}
                      placeholder="e.g., CSE"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year *</label>
                    <select
                      value={scheduleData.year}
                      onChange={(e) => setScheduleData({...scheduleData, year: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Year</option>
                      <option value="1">First Year</option>
                      <option value="2">Second Year</option>
                      <option value="3">Third Year</option>
                      <option value="4">Fourth Year</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
                    <select
                      value={scheduleData.section}
                      onChange={(e) => setScheduleData({...scheduleData, section: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Sections</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                      <option value="E">Section E</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Semester *</label>
                    <select
                      value={scheduleData.semester}
                      onChange={(e) => setScheduleData({...scheduleData, semester: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Semester</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Sections</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={scheduleData.numberOfSections}
                      onChange={(e) => setScheduleData({...scheduleData, numberOfSections: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Courses (comma-separated) *</label>
                  <textarea
                    value={scheduleData.courses}
                    onChange={(e) => setScheduleData({...scheduleData, courses: e.target.value})}
                    placeholder="e.g., Data Structures, DBMS, Operating Systems, Computer Networks, Software Engineering"
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    💡 Enter course names separated by commas
                  </p>
                </div>
              </>
            )}

            {scheduleType === 'exam_schedule' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={scheduleData.startDate}
                  onChange={(e) => setScheduleData({...scheduleData, startDate: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              onClick={generateSchedule}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Optimal Schedule
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Schedule */}
        {generatedSchedule && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-green-600 flex items-center gap-2">
              <CheckCircle className="w-8 h-8" />
              Schedule Generated Successfully!
            </h3>

            {/* Timetable */}
            {generatedSchedule.timetable && (
              <div className="space-y-4">
                {Object.entries(generatedSchedule.timetable).map(([day, slots]) => (
                  <div key={day} className="border-2 border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-lg mb-3">{day}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(slots).map(([time, course]) => (
                        <div key={time} className="bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-xs text-gray-600">{time}</p>
                          <p className="font-semibold text-sm">{course.name || course}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exam Schedule */}
            {generatedSchedule.schedule && (
              <div className="space-y-3">
                {generatedSchedule.schedule.map((exam, idx) => (
                  <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">{exam.course}</p>
                      <p className="text-sm text-gray-600">{new Date(exam.date).toLocaleDateString()} • {exam.time}</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-semibold">
                      {exam.room}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {generatedSchedule.recommendations && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                <h4 className="font-bold text-lg mb-4 text-green-700">AI Recommendations</h4>
                <ul className="space-y-2">
                  {generatedSchedule.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSchedulingAgent;
