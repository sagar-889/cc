import React, { useEffect, useState } from 'react';
import { 
  Calendar, BookOpen, FileText, Sparkles, TrendingUp, Clock, 
  Brain, Target, Zap, CheckCircle, AlertCircle, Users, 
  GraduationCap, Search, ClipboardList, Bot, MessageSquare,
  Settings, Award, Activity, BarChart3
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { timetableAPI, courseAPI, eventAPI } from '../utils/api';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    courses: 0,
    upcomingClasses: 0,
    events: 0,
    materials: 0
  });
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Agentic AI States
  const [agenticDashboard, setAgenticDashboard] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [goalInput, setGoalInput] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [agenticLoading, setAgenticLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [examPreps, setExamPreps] = useState([]);
  const [automationStatus, setAutomationStatus] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchAgenticData();
  }, []);

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  const fetchDashboardData = async () => {
    try {
      const [timetableRes, coursesRes, eventsRes] = await Promise.all([
        timetableAPI.get(),
        courseAPI.getEnrolled(),
        eventAPI.getAll({ status: 'upcoming' })
      ]);

      const timetable = timetableRes.data.timetable;
      const today = format(new Date(), 'EEEE');
      
      if (timetable) {
        const todayEntries = timetable.entries.filter(entry => entry.day === today);
        setTodayClasses(todayEntries);
        setStats(prev => ({ ...prev, upcomingClasses: todayEntries.length }));
      }

      setStats(prev => ({
        ...prev,
        courses: coursesRes.data.count || 0,
        events: eventsRes.data.count || 0
      }));

      setUpcomingEvents(eventsRes.data.events.slice(0, 3));
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgenticData = async () => {
    try {
      const token = getToken();
      const [dashboardRes, planRes, assignmentsRes, examPrepsRes, automationRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/agentic/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/agentic-ai/my-plan`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/agentic/assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/agentic/exam-prep`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/agentic-ai/automation-status`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAgenticDashboard(dashboardRes.data.dashboard);
      setCurrentPlan(planRes.data.hasPlan ? planRes.data : null);
      setAssignments(assignmentsRes.data.assignments || []);
      setExamPreps(examPrepsRes.data.examPreps || []);
      setAutomationStatus(automationRes.data);
    } catch (error) {
      console.error('Agentic data fetch error:', error);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalInput.trim()) return;
    
    setAgenticLoading(true);
    try {
      const token = getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agentic-ai/understand-goals`,
        { goal: goalInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Goal created successfully!');
        setShowGoalModal(false);
        setGoalInput('');
        fetchAgenticData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to create goal');
    } finally {
      setAgenticLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agentic-ai/complete-task`,
        { taskId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Task completed!');
        fetchAgenticData();
      }
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className={`rounded-xl shadow-3d p-6 card-3d ${colorClass} transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-90 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 text-white">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 flex items-center justify-center backdrop-blur-sm">
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pastel-purple border-t-transparent shadow-glow-purple"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-pastel-purple rounded-full opacity-20 animate-ping"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pastel-purple to-pastel-pink rounded-xl p-8 text-white shadow-3d card-3d relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-float"></div>
        <h1 className="text-3xl font-bold mb-2 relative z-10">Welcome back, {user?.name}! 👋</h1>
        <p className="text-white text-opacity-90 relative z-10">
          {user?.department && `${user.department} • `}
          {user?.year && `Year ${user.year} • `}
          {user?.semester && `Semester ${user.semester}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          label="Enrolled Courses"
          value={stats.courses}
          colorClass="card-green"
        />
        <StatCard
          icon={Calendar}
          label="Today's Classes"
          value={stats.upcomingClasses}
          colorClass="card-yellow"
        />
        <StatCard
          icon={ClipboardList}
          label="Active Assignments"
          value={assignments.filter(a => a.status !== 'completed').length}
          colorClass="card-pink"
        />
        <StatCard
          icon={Brain}
          label="AI Automations"
          value={automationStatus?.automatedTasks?.length || 0}
          colorClass="card-purple"
        />
      </div>

      {/* Agentic AI Goal Achievement Section */}
      {currentPlan ? (
        <div className="bg-gradient-to-r from-pastel-purple to-pastel-pink rounded-xl p-6 text-white shadow-3d card-3d">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Target className="mr-3 animate-float" size={28} />
              <div>
                <h2 className="text-xl font-bold">Current Goal</h2>
                <p className="text-purple-100">{currentPlan.plan?.goal?.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{currentPlan.progress?.overallProgress || 0}%</p>
              <p className="text-purple-100 text-sm">Complete</p>
            </div>
          </div>
          
          {currentPlan.plan?.actionPlan?.phases && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {currentPlan.plan.actionPlan.phases.slice(0, 3).map((phase, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{phase.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{phase.tasks?.length || 0} tasks</span>
                    <span className="text-sm">{phase.progress || 0}% done</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-6 text-center">
          <Target className="mx-auto mb-4 text-gray-400" size={48} />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Set Your AI-Powered Goal</h2>
          <p className="text-gray-600 mb-4">Let our AI help you achieve your academic and career objectives</p>
          <button
            onClick={() => setShowGoalModal(true)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Goal with AI
          </button>
        </div>
      )}

      {/* Agentic AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assignment Manager */}
        <div className="bg-dark-lighter rounded-xl shadow-3d p-6 card-3d border border-dark-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center text-text-primary">
              <ClipboardList className="mr-2 text-pastel-green" size={20} />
              AI Assignment Manager
            </h3>
            <span className="bg-pastel-green bg-opacity-20 text-pastel-green px-2 py-1 rounded-full text-xs">
              {assignments.filter(a => a.status !== 'completed').length} Active
            </span>
          </div>
          <p className="text-text-secondary text-sm mb-4">Intelligent assignment scheduling and management</p>
          <button 
            onClick={() => window.location.href = '/assignment-manager'}
            className="w-full py-2 bg-pastel-green bg-opacity-20 text-pastel-green rounded-lg hover:bg-opacity-30 hover:shadow-glow-green transition-all card-3d"
          >
            Manage Assignments
          </button>
        </div>

        {/* Exam Preparation */}
        <div className="bg-dark-lighter rounded-xl shadow-3d p-6 card-3d border border-dark-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center text-text-primary">
              <GraduationCap className="mr-2 text-pastel-yellow" size={20} />
              AI Exam Prep
            </h3>
            <span className="bg-pastel-yellow bg-opacity-20 text-pastel-yellow px-2 py-1 rounded-full text-xs">
              {examPreps.length} Plans
            </span>
          </div>
          <p className="text-text-secondary text-sm mb-4">Personalized study plans and progress tracking</p>
          <button 
            onClick={() => window.location.href = '/exam-prep'}
            className="w-full py-2 bg-pastel-yellow bg-opacity-20 text-pastel-yellow rounded-lg hover:bg-opacity-30 hover:shadow-glow-yellow transition-all card-3d"
          >
            View Study Plans
          </button>
        </div>

        {/* Event Registration */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Sparkles className="mr-2 text-purple-600" size={20} />
              Smart Event Finder
            </h3>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
              AI Powered
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Find and register for relevant events automatically</p>
          <button 
            onClick={() => window.location.href = '/event-registration-agent'}
            className="w-full py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
          >
            Find Events
          </button>
        </div>

        {/* Material Finder */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Search className="mr-2 text-orange-600" size={20} />
              AI Material Finder
            </h3>
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
              Smart Search
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Intelligent study material discovery and organization</p>
          <button 
            onClick={() => window.location.href = '/material-finder'}
            className="w-full py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Find Materials
          </button>
        </div>

        {/* AI Assistant */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Bot className="mr-2 text-indigo-600" size={20} />
              AI Assistant
            </h3>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
              24/7 Available
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Get instant help with academic questions</p>
          <button 
            onClick={() => window.location.href = '/ai-assistant'}
            className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Chat with AI
          </button>
        </div>

        {/* Agentic Features Hub */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Zap className="mr-2 text-yellow-600" size={20} />
              All AI Features
            </h3>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
              Complete Suite
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Access all agentic AI features in one place</p>
          <button 
            onClick={() => window.location.href = '/agentic-features'}
            className="w-full py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            Explore All Features
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Clock className="mr-2 text-primary-600" size={24} />
              Today's Schedule
            </h2>
          </div>
          
          {todayClasses.length > 0 ? (
            <div className="space-y-3">
              {todayClasses.map((entry, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{entry.course?.name || 'Course'}</p>
                    <p className="text-sm text-gray-600">{entry.course?.code || ''}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {entry.startTime} - {entry.endTime} • {entry.room}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    entry.type === 'lecture' ? 'bg-blue-100 text-blue-700' :
                    entry.type === 'lab' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {entry.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-2 opacity-50" />
              <p>No classes scheduled for today</p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Sparkles className="mr-2 text-primary-600" size={24} />
              Upcoming Events
            </h2>
          </div>
          
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{event.organizer}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(event.startDate), 'MMM dd, yyyy')} • {event.location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.type === 'workshop' ? 'bg-blue-100 text-blue-700' :
                      event.type === 'hackathon' ? 'bg-green-100 text-green-700' :
                      event.type === 'fest' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Sparkles size={48} className="mx-auto mb-2 opacity-50" />
              <p>No upcoming events</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/timetable'}
            className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-center"
          >
            <Calendar className="mx-auto mb-2 text-primary-600" size={24} />
            <p className="text-sm font-medium">View Timetable</p>
          </button>
          <button 
            onClick={() => window.location.href = '/courses'}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
          >
            <BookOpen className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-sm font-medium">Browse Courses</p>
          </button>
          <button 
            onClick={() => window.location.href = '/materials'}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
          >
            <FileText className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-sm font-medium">Study Materials</p>
          </button>
          <button 
            onClick={() => window.location.href = '/agentic-ai-assistant'}
            className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
          >
            <Brain className="mx-auto mb-2 text-orange-600" size={24} />
            <p className="text-sm font-medium">AI Assistant</p>
          </button>
        </div>
      </div>

      {/* Goal Creation Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Create AI-Powered Goal</h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your goal
              </label>
              <textarea
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g., I want to improve my programming skills in Python and get ready for internship interviews"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                disabled={agenticLoading || !goalInput.trim()}
                className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {agenticLoading ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
