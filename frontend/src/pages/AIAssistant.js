import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, BookOpen, Target, Calendar, Zap } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState('study-plan');
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [careerAdvice, setCareerAdvice] = useState(null);
  const [examPrep, setExamPrep] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const { user } = useAuthStore();

  const tabs = [
    { id: 'study-plan', label: 'Study Plan', icon: Calendar },
    { id: 'career', label: 'Career Advisor', icon: Target },
    { id: 'exam-prep', label: 'Exam Prep', icon: BookOpen },
    { id: 'learning-path', label: 'Learning Path', icon: TrendingUp }
  ];

  const generateStudyPlan = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agentic-ai/study-plan`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudyPlan(response.data.studyPlan);
      toast.success('Study plan generated!');
    } catch (error) {
      console.error('Generate study plan error:', error);
      toast.error('Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  const getCareerAdvice = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agentic-ai/career-advice`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCareerAdvice(response.data.careerAdvice);
      toast.success('Career advice generated!');
    } catch (error) {
      console.error('Career advice error:', error);
      toast.error('Failed to get career advice');
    } finally {
      setLoading(false);
    }
  };

  const generateExamPrep = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agentic-ai/exam-prep`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExamPrep(response.data.examPrep);
      toast.success('Exam prep plan generated!');
    } catch (error) {
      console.error('Exam prep error:', error);
      toast.error('Failed to generate exam prep');
    } finally {
      setLoading(false);
    }
  };

  const generateLearningPath = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agentic-ai/learning-path`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLearningPath(response.data.learningPath);
      toast.success('Learning path created!');
    } catch (error) {
      console.error('Learning path error:', error);
      toast.error('Failed to create learning path');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'study-plan':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="text-blue-600" size={32} />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI Study Plan Generator</h3>
                  <p className="text-gray-600">Get a personalized weekly study schedule</p>
                </div>
              </div>
              <button
                onClick={generateStudyPlan}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Generating...' : 'Generate Study Plan'}
              </button>
            </div>

            {studyPlan && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="font-bold text-lg mb-4">Your Personalized Study Plan</h4>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700">{studyPlan}</pre>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <Zap className="text-yellow-500 mb-3" size={24} />
                <h4 className="font-semibold mb-2">Smart Scheduling</h4>
                <p className="text-sm text-gray-600">AI optimizes your study time based on your timetable and preferences</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <Brain className="text-purple-500 mb-3" size={24} />
                <h4 className="font-semibold mb-2">Adaptive Learning</h4>
                <p className="text-sm text-gray-600">Plan adjusts based on your progress and learning style</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <Target className="text-green-500 mb-3" size={24} />
                <h4 className="font-semibold mb-2">Goal Tracking</h4>
                <p className="text-sm text-gray-600">Set and track your academic goals with AI guidance</p>
              </div>
            </div>
          </div>
        );

      case 'career':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="text-purple-600" size={32} />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI Career Advisor</h3>
                  <p className="text-gray-600">Get personalized career guidance and skill recommendations</p>
                </div>
              </div>
              <button
                onClick={getCareerAdvice}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Analyzing...' : 'Get Career Advice'}
              </button>
            </div>

            {careerAdvice && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="font-bold text-lg mb-4">Career Guidance for You</h4>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700">{careerAdvice}</pre>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="font-semibold mb-3">Skills to Develop</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Technical Skills
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Soft Skills
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Industry Knowledge
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="font-semibold mb-3">Recommended Actions</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Build Projects
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Seek Internships
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Network Actively
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'exam-prep':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="text-green-600" size={32} />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI Exam Preparation Coach</h3>
                  <p className="text-gray-600">Get strategies and practice materials for exams</p>
                </div>
              </div>
              <button
                onClick={generateExamPrep}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Preparing...' : 'Generate Exam Strategy'}
              </button>
            </div>

            {examPrep && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="font-bold text-lg mb-4">Your Exam Preparation Strategy</h4>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700">{examPrep}</pre>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">7 Days</div>
                <p className="text-sm text-gray-600">Before Exam</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3 Hours</div>
                <p className="text-sm text-gray-600">Daily Study</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">5 Topics</div>
                <p className="text-sm text-gray-600">To Cover</p>
              </div>
            </div>
          </div>
        );

      case 'learning-path':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="text-orange-600" size={32} />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI Learning Path Creator</h3>
                  <p className="text-gray-600">Get a structured roadmap for your learning journey</p>
                </div>
              </div>
              <button
                onClick={generateLearningPath}
                disabled={loading}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Learning Path'}
              </button>
            </div>

            {learningPath && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="font-bold text-lg mb-4">Your Personalized Learning Path</h4>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700">{learningPath}</pre>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-semibold mb-4">Learning Milestones</h4>
              <div className="space-y-4">
                {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level, index) => (
                  <div key={level} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{level}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: index === 0 ? '100%' : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Brain size={48} />
          <div>
            <h1 className="text-3xl font-bold">AI Study Assistant</h1>
            <p className="text-primary-100 mt-1">
              Your personal AI-powered learning companion with multiple specialized agents
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Features Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Sparkles className="mr-2 text-yellow-500" size={24} />
          Agentic AI Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Multi-Agent System</h4>
            <p className="text-sm text-blue-700">Multiple specialized AI agents working together</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Context-Aware</h4>
            <p className="text-sm text-purple-700">AI understands your profile and history</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Collaborative AI</h4>
            <p className="text-sm text-green-700">Agents collaborate for complex queries</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2">Continuous Learning</h4>
            <p className="text-sm text-orange-700">AI learns from your interactions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
