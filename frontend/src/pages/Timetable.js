import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { timetableAPI, courseAPI } from '../utils/api';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Timetable = () => {
  const [timetable, setTimetable] = useState(null);
  const [courses, setCourses] = useState([]);
  const [clashes, setClashes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    course: '',
    room: '',
    type: 'lecture'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [timetableRes, coursesRes] = await Promise.all([
        timetableAPI.get(),
        courseAPI.getEnrolled()
      ]);
      
      setTimetable(timetableRes.data.timetable);
      setCourses(coursesRes.data.courses);
      
      if (timetableRes.data.timetable) {
        const clashRes = await timetableAPI.getClashes();
        setClashes(clashRes.data.clashes);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.course || !newEntry.room) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const response = await timetableAPI.addEntry(newEntry);
      setTimetable(response.data.timetable);
      
      if (response.data.clashes) {
        setClashes(response.data.clashes);
        toast.error('Warning: Time clash detected!');
      } else {
        toast.success('Class added successfully');
      }
      
      setShowAddModal(false);
      setNewEntry({
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        course: '',
        room: '',
        type: 'lecture'
      });
    } catch (error) {
      console.error('Add entry error:', error);
      toast.error('Failed to add class');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;

    try {
      const response = await timetableAPI.deleteEntry(entryId);
      setTimetable(response.data.timetable);
      toast.success('Class deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete class');
    }
  };

  const getEntriesForDay = (day) => {
    if (!timetable) return [];
    return timetable.entries.filter(entry => entry.day === day);
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Calendar className="mr-3 text-primary-600" size={32} />
            My Timetable
          </h1>
          <p className="text-gray-600 mt-1">Manage your class schedule</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Class
        </button>
      </div>

      {/* Clashes Warning */}
      {clashes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="text-red-600 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-red-900">Time Clashes Detected</h3>
              <p className="text-sm text-red-700 mt-1">
                You have {clashes.length} time clash(es) in your timetable. Please review and adjust.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Day</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Classes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {DAYS.map((day) => {
                const dayEntries = getEntriesForDay(day);
                return (
                  <tr key={day} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900 w-32">
                      {day}
                    </td>
                    <td className="px-4 py-4">
                      {dayEntries.length > 0 ? (
                        <div className="space-y-2">
                          {dayEntries.map((entry) => (
                            <div
                              key={entry._id}
                              className="flex items-center justify-between p-3 bg-primary-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  {entry.course?.name || 'Course'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {entry.startTime} - {entry.endTime} • {entry.room}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  entry.type === 'lecture' ? 'bg-blue-100 text-blue-700' :
                                  entry.type === 'lab' ? 'bg-green-100 text-green-700' :
                                  'bg-purple-100 text-purple-700'
                                }`}>
                                  {entry.type}
                                </span>
                                <button
                                  onClick={() => handleDeleteEntry(entry._id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No classes scheduled</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">Add Class</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={newEntry.day}
                  onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <select
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <select
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  value={newEntry.course}
                  onChange={(e) => setNewEntry({ ...newEntry, course: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <input
                  type="text"
                  value={newEntry.room}
                  onChange={(e) => setNewEntry({ ...newEntry, room: e.target.value })}
                  placeholder="e.g., Room 101, Lab A"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="seminar">Seminar</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
