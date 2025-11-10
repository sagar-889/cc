import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, Zap, Users, BookOpen, Calendar, FileText, Settings, TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAgenticAIFeatures = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('actions');

  // Sample agentic actions for demo
  const agenticActions = [
    {
      id: 'generate_reports',
      title: 'Generate Analytics Reports',
      description: 'Create comprehensive campus analytics and insights',
      icon: TrendingUp,
      category: 'analytics',
      example: 'Generate a student engagement report for this semester'
    },
    {
      id: 'optimize_timetable',
      title: 'Optimize Timetables',
      description: 'Auto-generate conflict-free timetables for all sections',
      icon: Calendar,
      category: 'scheduling',
      example: 'Generate timetables for all sections with proper break times'
    },
    {
      id: 'manage_users',
      title: 'User Management',
      description: 'Bulk operations on user accounts and permissions',
      icon: Users,
      category: 'users',
      example: 'Create accounts for all first-year students in CSE department'
    },
    {
      id: 'course_optimization',
      title: 'Course Optimization',
      description: 'Analyze and optimize course offerings based on demand',
      icon: BookOpen,
      category: 'academic',
      example: 'Analyze course enrollment patterns and suggest new electives'
    },
    {
      id: 'system_health',
      title: 'System Health Check',
      description: 'Monitor system performance and identify issues',
      icon: Settings,
      category: 'monitoring',
      example: 'Check system performance and identify any bottlenecks'
    }
  ];

  const quickActions = [
    { text: "Generate semester report", action: "generate_reports" },
    { text: "Optimize all timetables", action: "optimize_timetable" },
    { text: "Check system health", action: "system_health" },
    { text: "Analyze course demand", action: "course_optimization" }
  ];

  const handleVoiceCommand = async (command) => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/chatbot/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: command, transcript: command })
      });

      const data = await response.json();

      if (data.success) {
        setResponses(prev => [...prev, {
          type: 'command',
          content: command,
          response: data.response,
          timestamp: new Date()
        }]);
        toast.success('Command executed successfully!');
      } else {
        toast.error('Failed to execute command');
      }
    } catch (error) {
      console.error('Voice command error:', error);
      toast.error('Failed to process voice command');
    } finally {
      setLoading(false);
    }
  };

  const executeQuickAction = async (actionId) => {
    const action = agenticActions.find(a => a.id === actionId);
    if (!action) return;

    setLoading(true);
    try {
      await handleVoiceCommand(action.example);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      // Voice recognition implementation would go here
      setTimeout(() => {
        setIsListening(false);
        setTranscript('Sample voice command: Generate timetables for all sections');
      }, 2000);
    } else {
      toast.error('Voice recognition not supported in this browser');
    }
  };

  const executeTranscript = () => {
    if (transcript.trim()) {
      handleVoiceCommand(transcript.trim());
      setTranscript('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-3">
          <Bot size={40} />
          <div>
            <h1 className="text-3xl font-bold">Agentic AI Admin Assistant</h1>
            <p className="text-purple-100 mt-1">Execute actions, generate reports, and manage campus operations</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'actions', label: 'Agentic Actions', icon: Zap },
            { id: 'voice', label: 'Voice Commands', icon: MessageSquare },
            { id: 'responses', label: 'Response History', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => executeQuickAction(action.action)}
                  disabled={loading}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left disabled:opacity-50"
                >
                  <div className="font-medium text-gray-900 mb-1">{action.text}</div>
                  <div className="text-sm text-gray-600">Click to execute</div>
                </button>
              ))}
            </div>
          </div>

          {/* Agentic Actions Grid */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Agentic Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agenticActions.map(action => (
                <div key={action.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <action.icon size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Example Command:</p>
                    <p className="text-sm text-gray-600 italic">"{action.example}"</p>
                  </div>
                  <button
                    onClick={() => handleVoiceCommand(action.example)}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    Execute Action
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Voice Commands Tab */}
      {activeTab === 'voice' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Voice Command Interface</h2>

          {/* Voice Input */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={startVoiceListening}
                disabled={isListening}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <MessageSquare size={20} />
                <span>{isListening ? 'Listening...' : 'Start Voice Input'}</span>
              </button>

              {transcript && (
                <button
                  onClick={executeTranscript}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Execute Command
                </button>
              )}
            </div>

            {transcript && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Transcript:</p>
                <p className="text-gray-900">{transcript}</p>
              </div>
            )}
          </div>

          {/* Voice Command Examples */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Voice Command Examples:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Generate timetables for all sections",
                "Create a student engagement report",
                "Check system health and performance",
                "Analyze course enrollment patterns",
                "Find students with low attendance",
                "Generate faculty workload report"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleVoiceCommand(example)}
                  disabled={loading}
                  className="text-left p-3 bg-gray-50 rounded-lg hover:bg-purple-50 hover:border-purple-200 border border-gray-200 transition-colors disabled:opacity-50"
                >
                  <span className="text-sm text-gray-700">{example}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Response History Tab */}
      {activeTab === 'responses' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Execution History</h2>

          {responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No commands executed yet</p>
              <p className="text-sm mt-1">Execute some agentic actions to see history here</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {responses.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Target size={16} className="text-purple-600" />
                      <span className="font-medium text-gray-900">Command Executed</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-blue-900 mb-1">Command:</p>
                    <p className="text-sm text-blue-800">{item.content}</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-900 mb-1">Response:</p>
                    <p className="text-sm text-green-800">{item.response}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Status */}
      {loading && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Executing agentic action...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgenticAIFeatures;
