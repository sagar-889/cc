import React, { useState, useEffect } from 'react';
import { ClipboardList, Sparkles, Clock, AlertCircle, CheckCircle, Zap, TrendingUp, Calendar, FileText, Download, Edit3, Wand2, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AssignmentManagerAgent = () => {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [assignmentSchedule, setAssignmentSchedule] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    estimatedHours: 2,
    type: 'assignment',
    difficulty: 'medium'
  });

  // AI Content Generator States
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [problemStatement, setProblemStatement] = useState('');
  const [requirements, setRequirements] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/assignments`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Fetch assignments error:', error);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/assignments/create`,
        newAssignment,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      toast.success('Assignment created successfully!');
      setNewAssignment({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        estimatedHours: 2,
        type: 'assignment',
        difficulty: 'medium'
      });
      setShowCreateForm(false);
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/assignments/manage`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setAssignmentSchedule(response.data);
        toast.success('Optimal study schedule generated!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  };

  const updateAssignmentStatus = async (assignmentId, status) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/assignments/${assignmentId}`,
        { status },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('Assignment updated!');
      fetchAssignments();
      if (assignmentSchedule) generateSchedule();
    } catch (error) {
      toast.error('Failed to update assignment');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[priority] || colors.medium;
  };

  const getIntensityColor = (intensity) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[intensity] || colors.medium;
  };

  // AI Content Generator Functions
  const openContentGenerator = (assignment) => {
    setSelectedAssignment(assignment);
    setProblemStatement('');
    setRequirements('');
    setGeneratedContent('');
    setIsEditing(false);
    setShowContentGenerator(true);
  };

  const generateAssignmentContent = async () => {
    if (!problemStatement.trim()) {
      toast.error('Please enter a problem statement');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/assignments/generate-content`,
        {
          assignmentTitle: selectedAssignment?.title || 'Assignment',
          problemStatement,
          requirements,
          type: selectedAssignment?.type || 'assignment'
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setGeneratedContent(response.data.content);
        setIsEditing(true);
        toast.success('Assignment content generated!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAsIEEE = async () => {
    if (!generatedContent) {
      toast.error('No content to download');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/assignments/convert-ieee`,
        {
          content: generatedContent,
          title: selectedAssignment?.title || 'assignment',
          format: 'txt'
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/plain' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedAssignment?.title || 'assignment'}_IEEE_Format.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Downloaded as IEEE formatted text file!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
    }
  };

  const copyToClipboard = () => {
    if (!generatedContent) {
      toast.error('No content to copy');
      return;
    }

    navigator.clipboard.writeText(generatedContent).then(() => {
      toast.success('Content copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy content');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <ClipboardList className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Assignment & Deadline Manager</h1>
              <p className="text-orange-100 text-lg">
                AI-powered workload analysis and optimal study scheduling
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-600" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">1</div>
              <p className="font-semibold">Add Assignments</p>
              <p className="text-sm text-gray-600 mt-1">Create your tasks</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">2</div>
              <p className="font-semibold">AI Analyzes</p>
              <p className="text-sm text-gray-600 mt-1">Workload assessment</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">3</div>
              <p className="font-semibold">Checks Timetable</p>
              <p className="text-sm text-gray-600 mt-1">Finds free slots</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">4</div>
              <p className="font-semibold">Creates Schedule</p>
              <p className="text-sm text-gray-600 mt-1">Optimal allocation</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">5</div>
              <p className="font-semibold">Sets Reminders</p>
              <p className="text-sm text-gray-600 mt-1">Automated alerts</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-6 h-6" />
            {showCreateForm ? 'Hide Form' : 'Create New Assignment'}
          </button>
          
          <button
            onClick={generateSchedule}
            disabled={loading || assignments.length === 0}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* Create Assignment Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">Create New Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assignment Title *</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  placeholder="e.g., DBMS Assignment 2 - Normalization"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  placeholder="Brief description of the assignment..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date & Time *</label>
                <input
                  type="datetime-local"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={newAssignment.type}
                  onChange={(e) => setNewAssignment({...newAssignment, type: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="exam">Exam</option>
                  <option value="quiz">Quiz</option>
                  <option value="presentation">Presentation</option>
                  <option value="lab">Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <select
                  value={newAssignment.priority}
                  onChange={(e) => setNewAssignment({...newAssignment, priority: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <select
                  value={newAssignment.difficulty}
                  onChange={(e) => setNewAssignment({...newAssignment, difficulty: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Hours</label>
                <input
                  type="number"
                  value={newAssignment.estimatedHours}
                  onChange={(e) => setNewAssignment({...newAssignment, estimatedHours: parseInt(e.target.value)})}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Current Assignments */}
        {assignments.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">Your Assignments ({assignments.length})</h3>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment._id} className={`border-2 rounded-lg p-4 ${getPriorityColor(assignment.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{assignment.title}</h4>
                      <p className="text-sm mt-1">Due: {new Date(assignment.dueDate).toLocaleString()}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-white rounded-full">{assignment.type}</span>
                        <span className="text-xs px-2 py-1 bg-white rounded-full">{assignment.estimatedHours}h</span>
                        <span className="text-xs px-2 py-1 bg-white rounded-full">{assignment.difficulty}</span>
                      </div>
                      <button
                        onClick={() => openContentGenerator(assignment)}
                        className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        Generate Assignment Content with AI
                      </button>
                    </div>
                    <select
                      value={assignment.status}
                      onChange={(e) => updateAssignmentStatus(assignment._id, e.target.value)}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI-Generated Schedule */}
        {assignmentSchedule && (
          <div className="space-y-6">
            {/* Workload Analysis */}
            {assignmentSchedule.workloadAnalysis && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                  Workload Analysis
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Total Assignments</p>
                    <p className="text-4xl font-bold text-orange-600">{assignmentSchedule.workloadAnalysis.totalAssignments}</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Total Hours</p>
                    <p className="text-4xl font-bold text-blue-600">{assignmentSchedule.workloadAnalysis.totalEstimatedHours}h</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Next Week</p>
                    <p className="text-4xl font-bold text-purple-600">{assignmentSchedule.workloadAnalysis.nextWeekAssignments}</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Intensity</p>
                    <p className={`text-3xl font-bold ${getIntensityColor(assignmentSchedule.workloadAnalysis.workloadIntensity)}`}>
                      {assignmentSchedule.workloadAnalysis.workloadIntensity.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Urgent Tasks */}
            {assignmentSchedule.urgentTasks && assignmentSchedule.urgentTasks.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-red-600 flex items-center gap-3">
                  <AlertCircle className="w-8 h-8" />
                  ⚠️ Urgent Tasks ({assignmentSchedule.urgentTasks.length})
                </h3>
                <div className="space-y-3">
                  {assignmentSchedule.urgentTasks.map((task, idx) => (
                    <div key={idx} className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{task.title}</p>
                        <p className="text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-red-600">{task.daysRemaining}</p>
                        <p className="text-sm text-gray-600">days left</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Schedule */}
            {assignmentSchedule.studySchedule && assignmentSchedule.studySchedule.weekly && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  Your Optimal Study Schedule
                </h3>
                <div className="space-y-4">
                  {assignmentSchedule.studySchedule.weekly.map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-800">{item.title}</h4>
                          <p className="text-sm text-gray-600">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-gray-700">Study Plan:</p>
                        {item.allocationPlan && item.allocationPlan.map((plan, pidx) => (
                          <div key={pidx} className="flex items-center gap-3 bg-white rounded-lg p-3">
                            <Clock className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold text-gray-800">{plan.day}</span>
                            <span className="text-purple-600 font-bold">{plan.hours} hours</span>
                            <span className="text-gray-500">{new Date(plan.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {assignmentSchedule.studySchedule && assignmentSchedule.studySchedule.recommendations && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-green-600 flex items-center gap-3">
                  <Zap className="w-8 h-8" />
                  AI Study Recommendations
                </h3>
                <div className="space-y-3">
                  {assignmentSchedule.studySchedule.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {assignments.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Assignments Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first assignment to get started with AI-powered scheduling!
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Create First Assignment
            </button>
          </div>
        )}

        {/* AI Content Generator Modal */}
        {showContentGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                      <Wand2 className="w-8 h-8" />
                      AI Assignment Content Generator
                    </h2>
                    <p className="text-purple-100 mt-2">
                      {selectedAssignment?.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowContentGenerator(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                {!generatedContent ? (
                  /* Input Form */
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Problem Statement *
                      </label>
                      <textarea
                        value={problemStatement}
                        onChange={(e) => setProblemStatement(e.target.value)}
                        placeholder="Describe the assignment problem statement in detail...&#10;&#10;Example: Create a database management system for a library that handles book inventory, member registration, and borrowing transactions. The system should support CRUD operations and implement proper normalization."
                        rows="8"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Requirements & Guidelines (Optional)
                      </label>
                      <textarea
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="Specify any specific requirements, word count, format, sections to include, etc...&#10;&#10;Example:&#10;- Minimum 2000 words&#10;- Include ER diagrams&#10;- Explain normalization up to 3NF&#10;- Provide SQL queries for all operations"
                        rows="6"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={generateAssignmentContent}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          Generating Content...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Generate Assignment Content with AI
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Generated Content */
                  <div className="space-y-6">
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <p className="text-green-800 font-semibold">
                        Assignment content generated successfully! You can now edit, research, and refine it.
                      </p>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Edit3 className="w-5 h-5" />
                        Generated Content (Editable)
                      </label>
                      <textarea
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        rows="20"
                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        💡 Tip: Edit the content, add your research, and customize it before downloading
                      </p>
                    </div>

                    {/* Download Options */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Download className="w-6 h-6 text-blue-600" />
                        Download & Copy Options
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={downloadAsIEEE}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Download IEEE Format (.txt)
                        </button>
                        <button
                          onClick={copyToClipboard}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <FileText className="w-5 h-5" />
                          Copy to Clipboard
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-4 text-center">
                        📄 Download as IEEE formatted text file or copy to paste into Word/Google Docs
                      </p>
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-gray-700">
                          💡 <strong>Tip:</strong> After copying, paste into Microsoft Word or Google Docs and apply IEEE template for proper formatting.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setGeneratedContent('');
                          setIsEditing(false);
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                      >
                        Generate New Content
                      </button>
                      <button
                        onClick={() => setShowContentGenerator(false)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentManagerAgent;
