import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, Zap, BookOpen, Calendar, Users, FileText, GraduationCap, Clock, Target, CheckCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentAgenticAIFeatures = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('actions');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Get user profile for personalized actions
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const user = JSON.parse(authStorage)?.state?.user;
      setUserProfile(user);
    }
  }, []);

  // Agentic actions for students
  const studentActions = [
    {
      id: 'enroll_course',
      title: 'Course Enrollment',
      description: 'Enroll in courses automatically',
      icon: GraduationCap,
      category: 'academic',
      example: 'Enroll me in CS101 - Computer Science',
      actionType: 'enroll_course'
    },
    {
      id: 'find_materials',
      title: 'Find Study Materials',
      description: 'Search and access study materials',
      icon: BookOpen,
      category: 'learning',
      example: 'Find materials about data structures and algorithms',
      actionType: 'search_materials'
    },
    {
      id: 'event_discovery',
      title: 'Discover Events',
      description: 'Find relevant events and workshops',
      icon: Calendar,
      category: 'events',
      example: 'Find hackathons and coding competitions this month',
      actionType: 'search_events'
    },
    {
      id: 'faculty_contact',
      title: 'Contact Faculty',
      description: 'Find and contact faculty members',
      icon: Users,
      category: 'support',
      example: 'Find Professor Smith in Computer Science department',
      actionType: 'find_faculty'
    },
    {
      id: 'study_plan',
      title: 'Generate Study Plan',
      description: 'Create personalized study schedules',
      icon: Clock,
      category: 'planning',
      example: 'Create a study plan for my enrolled courses',
      actionType: 'generate_study_plan'
    },
    {
      id: 'assignment_help',
      title: 'Assignment Assistance',
      description: 'Get help with assignments and projects',
      icon: FileText,
      category: 'help',
      example: 'Help me understand this data structures assignment',
      actionType: 'assignment_help'
    }
  ];

  const quickCommands = [
    { text: "Enroll in CS101", action: "enroll_course", example: "Enroll me in CS101 - Computer Science" },
    { text: "Find study materials", action: "find_materials", example: "Find materials about machine learning" },
    { text: "Discover events", action: "event_discovery", example: "Find tech events this week" },
    { text: "Contact faculty", action: "faculty_contact", example: "Find Professor in CSE department" },
    { text: "Study plan", action: "study_plan", example: "Create study plan for my courses" },
    { text: "Assignment help", action: "assignment_help", example: "Help with my algorithms assignment" }
  ];

  const handleAgenticAction = async (actionType, example) => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: example })
      });

      const data = await response.json();

      if (data.success) {
        setResponses(prev => [...prev, {
          type: 'action',
          actionType,
          content: example,
          response: data.response,
          timestamp: new Date()
        }]);
        toast.success('Action completed successfully!');
      } else {
        toast.error('Action failed');
      }
    } catch (error) {
      console.error('Agentic action error:', error);
      toast.error('Failed to execute action');
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
        setTranscript('Sample: Enroll me in CS101');
      }, 2000);
    } else {
      toast.error('Voice recognition not supported in this browser');
    }
  };

  const executeTranscript = () => {
    if (transcript.trim()) {
      handleAgenticAction('voice_command', transcript.trim());
      setTranscript('');
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      enroll_course: GraduationCap,
      search_materials: BookOpen,
      search_events: Calendar,
      find_faculty: Users,
      generate_study_plan: Clock,
      assignment_help: FileText
    };
    const Icon = icons[actionType] || Target;
    return <Icon size={16} className="text-purple-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-3">
          <Bot size={40} />
          <div>
            <h1 className="text-3xl font-bold">Agentic AI Student Assistant</h1>
            <p className="text-blue-100 mt-1">Perform actions, get help, and manage your academic life</p>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      {userProfile && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Your Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{userProfile.name}</p>
              <p className="text-sm text-gray-600">Student</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{userProfile.department}</p>
              <p className="text-sm text-gray-600">Department</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">Year {userProfile.year}</p>
              <p className="text-sm text-gray-600">Academic Year</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{userProfile.enrolledCourses?.length || 0}</p>
              <p className="text-sm text-gray-600">Enrolled Courses</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'actions', label: 'Agentic Actions', icon: Zap },
            { id: 'voice', label: 'Voice Commands', icon: MessageSquare },
            { id: 'history', label: 'Action History', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
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
          {/* Quick Commands */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickCommands.map((command, index) => (
                <button
                  key={index}
                  onClick={() => handleAgenticAction(command.action, command.example)}
                  disabled={loading}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {getActionIcon(command.action)}
                    <span className="font-medium text-gray-900">{command.text}</span>
                  </div>
                  <p className="text-sm text-gray-600">Click to execute</p>
                </button>
              ))}
            </div>
          </div>

          {/* Agentic Actions Grid */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentActions.map(action => (
                <div key={action.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <action.icon size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Example:</p>
                    <p className="text-sm text-gray-600 italic">"{action.example}"</p>
                  </div>
                  <button
                    onClick={() => handleAgenticAction(action.actionType, action.example)}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <MessageSquare size={20} />
                <span>{isListening ? 'Listening...' : 'Start Voice Input'}</span>
              </button>

              {transcript && (
                <button
                  onClick={executeTranscript}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
            <h3 className="font-semibold text-gray-900 mb-3">Try These Voice Commands:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Enroll me in Data Structures course",
                "Find study materials for algorithms",
                "Show me hackathons this month",
                "Find Professor Smith in CSE",
                "Create a study plan for my courses",
                "Help me with my assignment"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleAgenticAction('voice_command', example)}
                  disabled={loading}
                  className="text-left p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-colors disabled:opacity-50"
                >
                  <span className="text-sm text-gray-700">{example}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Action History</h2>

          {responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No actions executed yet</p>
              <p className="text-sm mt-1">Try some agentic actions to see history here</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {responses.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(item.actionType)}
                      <span className="font-medium text-gray-900 capitalize">
                        {item.actionType.replace('_', ' ')} Action
                      </span>
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
                    <p className="text-sm font-medium text-green-900 mb-1">Result:</p>
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
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Executing agentic action...</span>
          </div>
        </div>
      )}

      {/* Feature Benefits */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="mr-2 text-green-600" size={24} />
          Agentic AI Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Zap size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Actions</h3>
            <p className="text-sm text-gray-600">Execute commands immediately without browsing multiple pages</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Bot size={24} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Automation</h3>
            <p className="text-sm text-gray-600">AI understands context and performs the right actions automatically</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <MessageSquare size={24} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Voice & Text</h3>
            <p className="text-sm text-gray-600">Use voice commands or text - works with both interfaces</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAgenticAIFeatures;
