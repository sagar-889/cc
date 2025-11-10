import React, { useState, useEffect } from 'react';
import { 
  Calendar, BookOpen, ClipboardList, GraduationCap, 
  Search, Sparkles, TrendingUp, Clock, CheckCircle,
  AlertCircle, FileText, Users, Zap, Target
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AgenticFeatures = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Event Registration State
  const [eventQuery, setEventQuery] = useState('');
  const [eventResults, setEventResults] = useState(null);
  const [autoRegister, setAutoRegister] = useState(false);
  
  // Material Finder State
  const [materialQuery, setMaterialQuery] = useState('');
  const [materialResults, setMaterialResults] = useState(null);
  const [generateSummaries, setGenerateSummaries] = useState(false);
  
  // Assignment Manager State
  const [assignments, setAssignments] = useState([]);
  const [assignmentSchedule, setAssignmentSchedule] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    dueDate: '',
    priority: 'medium',
    estimatedHours: 2
  });
  
  // Exam Prep State
  const [examPreps, setExamPreps] = useState([]);
  const [newExam, setNewExam] = useState({
    examName: '',
    examDate: '',
    topics: ''
  });
  
  // Dashboard State
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/agentic/dashboard`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  // Event Registration Agent
  const handleEventSearch = async (e) => {
    e.preventDefault();
    if (!eventQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agentic/events/auto-register`,
        {
          query: eventQuery,
          preferences: {
            autoRegister: autoRegister,
            categories: []
          }
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setEventResults(response.data);
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to search events');
    } finally {
      setLoading(false);
    }
  };

  // Material Finder Agent
  const handleMaterialSearch = async (e) => {
    e.preventDefault();
    if (!materialQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agentic/materials/find`,
        {
          query: materialQuery,
          options: {
            generateSummaries: generateSummaries
          }
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setMaterialResults(response.data);
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to search materials');
    } finally {
      setLoading(false);
    }
  };

  // Assignment Manager
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agentic/assignments/create`,
        newAssignment,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      toast.success('Assignment created!');
      setNewAssignment({ title: '', dueDate: '', priority: 'medium', estimatedHours: 2 });
      fetchAssignmentManagement();
    } catch (error) {
      toast.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentManagement = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/agentic/assignments/manage`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setAssignments(response.data.assignments);
        setAssignmentSchedule(response.data);
        toast.success('Assignment schedule generated!');
      }
    } catch (error) {
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  // Exam Prep
  const handleCreateExamPrep = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const topics = newExam.topics.split(',').map(t => t.trim()).filter(t => t);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agentic/exam-prep/create`,
        {
          examName: newExam.examName,
          examDate: newExam.examDate,
          topics: topics
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setNewExam({ examName: '', examDate: '', topics: '' });
        fetchExamPreps();
      }
    } catch (error) {
      toast.error('Failed to create exam prep plan');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamPreps = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/agentic/exam-prep`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setExamPreps(response.data.examPreps || []);
    } catch (error) {
      console.error('Fetch exam preps error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Agentic AI Features</h1>
              <p className="text-purple-100 mt-2">AI-powered automation for your campus life</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Target className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'events'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Event Registration
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'materials'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Material Finder
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'assignments'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'exams'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            Exam Prep
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Assignments</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pending:</span>
                  <span className="font-bold text-2xl">{dashboard?.assignments?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgent:</span>
                  <span className="font-bold text-red-600">{dashboard?.assignments?.urgent || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-bold text-green-600">{dashboard?.assignments?.completed || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Exams</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Upcoming:</span>
                  <span className="font-bold text-2xl">{dashboard?.exams?.total || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Bookings</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active:</span>
                  <span className="font-bold text-2xl">{dashboard?.bookings?.total || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Registration Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              Event Registration Agent
            </h2>
            
            <form onSubmit={handleEventSearch} className="mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What events are you looking for?
                </label>
                <input
                  type="text"
                  value={eventQuery}
                  onChange={(e) => setEventQuery(e.target.value)}
                  placeholder="e.g., Find AI workshops this month"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="autoRegister"
                  checked={autoRegister}
                  onChange={(e) => setAutoRegister(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="autoRegister" className="text-sm font-medium text-gray-700">
                  Auto-register me for highly relevant events (score &gt; 70%)
                </label>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Find Events'}
              </button>
            </form>

            {/* Event Results */}
            {eventResults && (
              <div className="space-y-6">
                {eventResults.registeredEvents?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6" />
                      Auto-Registered Events ({eventResults.registeredEvents.length})
                    </h3>
                    <div className="space-y-3">
                      {eventResults.registeredEvents.map((item, idx) => (
                        <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-bold text-lg">{item.event.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="text-green-600 font-semibold">
                              Relevance: {item.relevanceScore}%
                            </span>
                            <span className="text-gray-500">
                              {new Date(item.event.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {eventResults.recommendedEvents?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2">
                      <Sparkles className="w-6 h-6" />
                      Recommended Events ({eventResults.recommendedEvents.length})
                    </h3>
                    <div className="space-y-3">
                      {eventResults.recommendedEvents.map((item, idx) => (
                        <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-bold text-lg">{item.event.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="text-blue-600 font-semibold">
                              Relevance: {item.relevanceScore}%
                            </span>
                            {item.hasConflict && (
                              <span className="text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Schedule Conflict
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Material Finder Tab */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
              Study Material Finder & Organizer
            </h2>
            
            <form onSubmit={handleMaterialSearch} className="mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What materials do you need?
                </label>
                <input
                  type="text"
                  value={materialQuery}
                  onChange={(e) => setMaterialQuery(e.target.value)}
                  placeholder="e.g., Data Structures notes and previous year papers"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="generateSummaries"
                  checked={generateSummaries}
                  onChange={(e) => setGenerateSummaries(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="generateSummaries" className="text-sm font-medium text-gray-700">
                  Generate AI summaries for top materials
                </label>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Find Materials'}
              </button>
            </form>

            {/* Material Results */}
            {materialResults?.materials && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">
                  Found {materialResults.totalFound} Materials
                </h3>
                {materialResults.materials.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-lg">{item.material.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.material.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-purple-600 font-semibold">
                        Relevance: {item.relevanceScore}%
                      </span>
                      <span className="text-gray-500">{item.material.type}</span>
                      <span className="text-gray-500">❤️ {item.material.likes} likes</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">{item.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {/* Create Assignment */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <ClipboardList className="w-8 h-8 text-purple-600" />
                Assignment & Deadline Manager
              </h2>
              
              <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="e.g., DBMS Assignment 2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newAssignment.priority}
                    onChange={(e) => setNewAssignment({...newAssignment, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={newAssignment.estimatedHours}
                    onChange={(e) => setNewAssignment({...newAssignment, estimatedHours: parseInt(e.target.value)})}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Assignment'}
                  </button>
                </div>
              </form>

              <button
                onClick={fetchAssignmentManagement}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Generate Optimal Study Schedule'}
              </button>
            </div>

            {/* Assignment Schedule */}
            {assignmentSchedule && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Your Optimal Study Schedule</h3>
                
                {/* Workload Analysis */}
                {assignmentSchedule.workloadAnalysis && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h4 className="font-bold text-lg mb-4">Workload Analysis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Assignments</p>
                        <p className="text-2xl font-bold">{assignmentSchedule.workloadAnalysis.totalAssignments}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Hours</p>
                        <p className="text-2xl font-bold">{assignmentSchedule.workloadAnalysis.totalEstimatedHours}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Next Week</p>
                        <p className="text-2xl font-bold">{assignmentSchedule.workloadAnalysis.nextWeekAssignments}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Intensity</p>
                        <p className={`text-2xl font-bold ${
                          assignmentSchedule.workloadAnalysis.workloadIntensity === 'high' ? 'text-red-600' :
                          assignmentSchedule.workloadAnalysis.workloadIntensity === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {assignmentSchedule.workloadAnalysis.workloadIntensity.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Urgent Tasks */}
                {assignmentSchedule.urgentTasks?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                    <h4 className="font-bold text-lg mb-4 text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-6 h-6" />
                      Urgent Tasks ({assignmentSchedule.urgentTasks.length})
                    </h4>
                    <div className="space-y-2">
                      {assignmentSchedule.urgentTasks.map((task, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="font-medium">{task.title}</span>
                          <span className="text-red-600 font-bold">{task.daysRemaining} days left</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weekly Schedule */}
                {assignmentSchedule.studySchedule?.weekly && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">Weekly Schedule</h4>
                    {assignmentSchedule.studySchedule.weekly.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h5 className="font-bold">{item.title}</h5>
                        <p className="text-sm text-gray-600">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                        <div className="mt-3 space-y-2">
                          {item.allocationPlan?.map((plan, pidx) => (
                            <div key={pidx} className="flex items-center gap-3 text-sm">
                              <Clock className="w-4 h-4 text-purple-600" />
                              <span className="font-medium">{plan.day}</span>
                              <span className="text-gray-600">{plan.hours} hours</span>
                              <span className="text-gray-400">{new Date(plan.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {assignmentSchedule.studySchedule?.recommendations && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                    <h4 className="font-bold text-lg mb-4 text-green-600">AI Recommendations</h4>
                    <ul className="space-y-2">
                      {assignmentSchedule.studySchedule.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Exam Prep Tab */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-purple-600" />
                Exam Preparation Automation
              </h2>
              
              <form onSubmit={handleCreateExamPrep} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Name
                  </label>
                  <input
                    type="text"
                    value={newExam.examName}
                    onChange={(e) => setNewExam({...newExam, examName: e.target.value})}
                    placeholder="e.g., DBMS Mid-Term Exam"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newExam.examDate}
                    onChange={(e) => setNewExam({...newExam, examDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topics (comma-separated)
                  </label>
                  <textarea
                    value={newExam.topics}
                    onChange={(e) => setNewExam({...newExam, topics: e.target.value})}
                    placeholder="e.g., SQL, Normalization, Transactions, Indexing"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating Plan...' : 'Create Exam Prep Plan'}
                </button>
              </form>
            </div>

            {/* Exam Preps List */}
            {examPreps.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Your Exam Preparations</h3>
                <div className="space-y-4">
                  {examPreps.map((exam, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h4 className="font-bold text-xl">{exam.examName}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Exam Date: {new Date(exam.examDate).toLocaleDateString()}
                      </p>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {exam.progress?.overallProgress || 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Topics</p>
                          <p className="text-2xl font-bold">
                            {exam.progress?.topicsCompleted || 0}/{exam.progress?.totalTopics || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Study Hours</p>
                          <p className="text-2xl font-bold">{exam.progress?.studyHours || 0}h</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Flashcards</p>
                          <p className="text-2xl font-bold">{exam.flashcards?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgenticFeatures;
