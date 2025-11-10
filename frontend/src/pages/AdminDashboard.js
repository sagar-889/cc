import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, FileText, Calendar, TrendingUp, 
  UserPlus, Brain, BarChart3, Activity, Award, Clock, Zap,
  Bot, MessageSquare, Settings, Target, AlertTriangle,
  CheckCircle, Search, ClipboardList, Shield, Database,
  Cpu, Network, Globe, Mail, Phone, HelpCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  // Agentic AI States
  const [agenticStats, setAgenticStats] = useState(null);
  const [activeReports, setActiveReports] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [automationQueue, setAutomationQueue] = useState([]);
  const [aiCommand, setAiCommand] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);
  const [recentActions, setRecentActions] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchAgenticData();
  }, []);

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  const fetchDashboardStats = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/dashboard/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgenticData = async () => {
    try {
      const token = getToken();
      // Simulate agentic data for now - replace with actual API calls
      setAgenticStats({
        totalAutomations: 15,
        activeReports: 3,
        systemHealth: 98,
        pendingTickets: 12
      });
      
      setActiveReports([
        { id: 1, name: 'Student Engagement Report', status: 'generating', progress: 75 },
        { id: 2, name: 'Course Performance Analysis', status: 'completed', progress: 100 },
        { id: 3, name: 'System Usage Statistics', status: 'pending', progress: 0 }
      ]);

      setAutomationQueue([
        { id: 1, task: 'Generate timetables for new semester', status: 'running' },
        { id: 2, task: 'Process bulk user registrations', status: 'queued' },
        { id: 3, task: 'Send welcome emails to new students', status: 'completed' }
      ]);

      setRecentActions([
        { action: 'Generated semester report', timestamp: new Date(), status: 'success' },
        { action: 'Optimized timetable conflicts', timestamp: new Date(), status: 'success' },
        { action: 'Processed 50 helpdesk tickets', timestamp: new Date(), status: 'success' }
      ]);
    } catch (error) {
      console.error('Agentic data fetch error:', error);
    }
  };

  const executeAICommand = async () => {
    if (!aiCommand.trim()) return;
    
    setCommandLoading(true);
    try {
      const token = getToken();
      // Simulate AI command execution
      toast.success(`AI Command executed: ${aiCommand}`);
      setAiCommand('');
      
      // Add to recent actions
      setRecentActions(prev => [
        { action: aiCommand, timestamp: new Date(), status: 'success' },
        ...prev.slice(0, 4)
      ]);
    } catch (error) {
      toast.error('Failed to execute AI command');
    } finally {
      setCommandLoading(false);
    }
  };

  const getAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/ai/insights`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInsights(response.data.insights);
      toast.success('AI insights generated!');
    } catch (error) {
      console.error('AI insights error:', error);
      toast.error('Failed to generate insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">AI-Powered Campus Management System</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={getAIInsights}
            disabled={loadingInsights}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Brain size={20} />
            <span>{loadingInsights ? 'Generating...' : 'Get AI Insights'}</span>
          </button>
          <button
            onClick={() => window.location.href = '/admin/agentic-features'}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Zap size={20} />
            <span>AI Features</span>
          </button>
        </div>
      </div>

      {/* AI Command Interface */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center mb-4">
          <Bot className="mr-3" size={28} />
          <div>
            <h2 className="text-xl font-bold">AI Command Center</h2>
            <p className="text-blue-100">Execute administrative tasks with natural language</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <input
            type="text"
            value={aiCommand}
            onChange={(e) => setAiCommand(e.target.value)}
            placeholder="e.g., Generate student performance report for CSE department"
            className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500"
            onKeyPress={(e) => e.key === 'Enter' && executeAICommand()}
          />
          <button
            onClick={executeAICommand}
            disabled={commandLoading || !aiCommand.trim()}
            className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            {commandLoading ? 'Executing...' : 'Execute'}
          </button>
        </div>

        {/* Quick AI Commands */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            'Generate semester report',
            'Optimize all timetables',
            'Check system health',
            'Process pending tickets',
            'Send announcements'
          ].map((cmd, index) => (
            <button
              key={index}
              onClick={() => setAiCommand(cmd)}
              className="px-3 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats?.overview.totalStudents || 0}
          icon={Users}
          color="blue"
          change="+12%"
        />
        <StatCard
          title="AI Automations"
          value={agenticStats?.totalAutomations || 0}
          icon={Zap}
          color="green"
          change="+5"
        />
        <StatCard
          title="System Health"
          value={`${agenticStats?.systemHealth || 0}%`}
          icon={Cpu}
          color="purple"
          change="+2%"
        />
        <StatCard
          title="Pending Tickets"
          value={agenticStats?.pendingTickets || 0}
          icon={HelpCircle}
          color="orange"
          change="-8"
        />
      </div>

      {/* Agentic AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <BarChart3 className="mr-2 text-blue-600" size={20} />
              AI Report Generator
            </h3>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
              {activeReports.length} Active
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Generate comprehensive analytics and insights</p>
          <button 
            onClick={() => window.location.href = '/admin/report-generator'}
            className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Generate Reports
          </button>
        </div>

        {/* Helpdesk Manager */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <HelpCircle className="mr-2 text-green-600" size={20} />
              AI Helpdesk Manager
            </h3>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
              Auto-Processing
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Intelligent ticket management and responses</p>
          <button 
            onClick={() => window.location.href = '/admin/helpdesk-manager'}
            className="w-full py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
          >
            Manage Tickets
          </button>
        </div>

        {/* Scheduling Agent */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Calendar className="mr-2 text-purple-600" size={20} />
              AI Scheduling Agent
            </h3>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
              Optimized
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Automated timetable and resource scheduling</p>
          <button 
            onClick={() => window.location.href = '/admin/scheduling-agent'}
            className="w-full py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
          >
            Optimize Schedules
          </button>
        </div>

        {/* User Manager */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Users className="mr-2 text-orange-600" size={20} />
              AI User Manager
            </h3>
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
              Bulk Operations
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Intelligent user management and analytics</p>
          <button 
            onClick={() => window.location.href = '/admin/user-manager'}
            className="w-full py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Manage Users
          </button>
        </div>

        {/* Communication Agent */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Mail className="mr-2 text-indigo-600" size={20} />
              AI Communication Agent
            </h3>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
              Automated
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Smart announcements and targeted messaging</p>
          <button 
            onClick={() => window.location.href = '/admin/communication-agent'}
            className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Send Messages
          </button>
        </div>

        {/* All AI Features */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Brain className="mr-2 text-red-600" size={20} />
              All AI Features
            </h3>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
              Complete Suite
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Access all administrative AI features</p>
          <button 
            onClick={() => window.location.href = '/admin/agentic-ai-features'}
            className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            Explore All Features
          </button>
        </div>
      </div>

      {/* AI Activity Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automation Queue */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Zap className="mr-2 text-blue-600" size={24} />
              Automation Queue
            </h2>
          </div>
          <div className="space-y-3">
            {automationQueue.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.task}</p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      item.status === 'running' ? 'bg-green-500' :
                      item.status === 'queued' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></span>
                    <span className="text-xs text-gray-600 capitalize">{item.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent AI Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Activity className="mr-2 text-green-600" size={24} />
              Recent AI Actions
            </h2>
          </div>
          <div className="space-y-3">
            {recentActions.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="text-green-500 mt-0.5" size={16} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{action.action}</p>
                  <p className="text-xs text-gray-500">
                    {action.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick AI Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Settings className="mr-2 text-purple-600" size={24} />
            Quick AI Actions
          </h2>
          <div className="space-y-3">
            <QuickActionButton
              icon={BarChart3}
              label="Generate Report"
              onClick={() => window.location.href = '/admin/report-generator'}
            />
            <QuickActionButton
              icon={Calendar}
              label="Optimize Schedules"
              onClick={() => window.location.href = '/admin/scheduling-agent'}
            />
            <QuickActionButton
              icon={HelpCircle}
              label="Process Tickets"
              onClick={() => window.location.href = '/admin/helpdesk-manager'}
            />
            <QuickActionButton
              icon={Users}
              label="Manage Users"
              onClick={() => window.location.href = '/admin/user-manager'}
            />
            <QuickActionButton
              icon={Mail}
              label="Send Announcements"
              onClick={() => window.location.href = '/admin/communication-agent'}
            />
          </div>
        </div>
      </div>

      {/* Students by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <BarChart3 className="mr-2 text-primary-600" size={24} />
            Students by Department
          </h2>
          <div className="space-y-4">
            {stats?.studentsByDepartment?.map((dept, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{dept._id}</span>
                  <span className="text-sm font-bold text-gray-900">{dept.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ 
                      width: `${(dept.count / stats.overview.totalStudents) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Award className="mr-2 text-primary-600" size={24} />
            Top Enrolled Courses
          </h2>
          <div className="space-y-4">
            {stats?.topCourses?.slice(0, 5).map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{course.code}</p>
                  <p className="text-sm text-gray-600">{course.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">{course.enrolledCount}</p>
                  <p className="text-xs text-gray-500">/ {course.maxStudents}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {insights && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Brain className="mr-2 text-purple-600" size={24} />
            AI-Powered Insights
          </h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700 text-sm bg-white p-4 rounded-lg">
              {insights}
            </pre>
          </div>
        </div>
      )}

      {/* System Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">System Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <OverviewItem label="Total Users" value={stats?.overview.totalUsers || 0} />
          <OverviewItem label="Faculty Members" value={stats?.overview.totalFaculty || 0} />
          <OverviewItem label="Total Events" value={stats?.overview.totalEvents || 0} />
          <OverviewItem label="Active Events" value={stats?.overview.activeEvents || 0} />
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, change }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        {change && (
          <span className="text-sm font-semibold text-green-600 flex items-center">
            <TrendingUp size={16} className="mr-1" />
            {change}
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
  >
    <Icon size={20} className="text-primary-600" />
    <span className="font-medium text-gray-700">{label}</span>
  </button>
);

// Overview Item Component
const OverviewItem = ({ label, value }) => (
  <div className="text-center p-4 bg-gray-50 rounded-lg">
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-600 mt-1">{label}</p>
  </div>
);

export default AdminDashboard;
