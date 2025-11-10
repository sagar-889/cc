import React, { useState, useEffect } from 'react';
import { Brain, Target, CheckCircle, Clock, Zap, TrendingUp, AlertCircle, Play, Pause, LogIn } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AgenticAIAssistant = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('goal'); // goal, clarify, plan, execute
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [goalAnalysis, setGoalAnalysis] = useState(null);
  const [answers, setAnswers] = useState({});
  const [actionPlan, setActionPlan] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage'));
      const token = authData?.state?.token;
      const user = authData?.state?.user;
      
      if (token && user) {
        setIsAuthenticated(true);
        fetchCurrentPlan();
      } else {
        setIsAuthenticated(false);
        console.log('User not authenticated');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    }
  };

  const fetchCurrentPlan = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage'));
      const token = authData?.state?.token;
      
      if (!token) {
        console.log('No authentication token found');
        return;
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/agenticAI/my-plan`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.hasPlan) {
        setCurrentPlan(response.data.plan);
        setProgress(response.data.progress);
        setActionPlan(response.data.plan.actionPlan);
        setStep('execute');
      }
    } catch (error) {
      console.error('Fetch plan error:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to access your goals');
      }
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage'));
      const token = authData?.state?.token;
      
      if (!token) {
        toast.error('Please log in to set goals');
        setLoading(false);
        return;
      }
      
      console.log('Submitting goal:', goal);
      console.log('API URL:', `${process.env.REACT_APP_API_URL}/agenticAI/understand-goals`);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agenticAI/understand-goals`,
        { goal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Goal analysis response:', response.data);
      setGoalAnalysis(response.data.analysis);
      
      if (response.data.requiresInput) {
        setStep('clarify');
        toast.success('Great! Let me ask you a few questions to create the perfect plan.');
      } else {
        await createPlan();
      }
    } catch (error) {
      console.error('Goal submission error:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to set goals');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to analyze goal. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (question, answer) => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
  };

  const createPlan = async () => {
    setLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage'));
      const token = authData?.state?.token;
      
      if (!token) {
        toast.error('Please log in to create plans');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agenticAI/create-plan`,
        {
          goalDetails: {
            mainGoal: goal,
            ...goalAnalysis?.goalAnalysis
          },
          userAnswers: answers
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActionPlan(response.data.plan);
      setStep('plan');
      toast.success('Your personalized action plan is ready!');
    } catch (error) {
      console.error('Plan creation error:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to create plans');
      } else {
        toast.error('Failed to create plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const startExecution = async () => {
    setStep('execute');
    await fetchCurrentPlan();
    toast.success('Let\'s start executing your plan!');
  };

  const completeTask = async (taskId) => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agenticAI/complete-task`,
        { taskId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setProgress(response.data.progress);
        toast.success('Task completed! 🎉');
        await fetchCurrentPlan();
      }
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const executeNextTask = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agenticAI/execute-plan`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.currentTask) {
        toast.success(`Next task: ${response.data.currentTask.taskName}`);
      }
    } catch (error) {
      toast.error('Failed to execute task');
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-white rounded-xl shadow-sm p-12">
          <LogIn size={64} className="mx-auto mb-6 text-purple-600" />
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-8">
            Please log in to access the Agentic AI Goal Achievement System.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <Brain size={48} />
          <div>
            <h1 className="text-3xl font-bold">Agentic AI Assistant</h1>
            <p className="text-purple-100">Your Personal AI-Powered Goal Achievement System</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className={`p-4 rounded-lg ${step === 'goal' ? 'bg-white/20' : 'bg-white/10'}`}>
            <Target size={24} className="mb-2" />
            <p className="font-semibold">1. Set Goal</p>
          </div>
          <div className={`p-4 rounded-lg ${step === 'clarify' ? 'bg-white/20' : 'bg-white/10'}`}>
            <AlertCircle size={24} className="mb-2" />
            <p className="font-semibold">2. Clarify</p>
          </div>
          <div className={`p-4 rounded-lg ${step === 'plan' ? 'bg-white/20' : 'bg-white/10'}`}>
            <CheckCircle size={24} className="mb-2" />
            <p className="font-semibold">3. Plan</p>
          </div>
          <div className={`p-4 rounded-lg ${step === 'execute' ? 'bg-white/20' : 'bg-white/10'}`}>
            <Zap size={24} className="mb-2" />
            <p className="font-semibold">4. Execute</p>
          </div>
        </div>
      </div>

      {/* Step 1: Goal Input */}
      {step === 'goal' && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-4">What do you want to achieve?</h2>
          <p className="text-gray-600 mb-6">
            Tell me your goal, and I'll create a personalized action plan with automated tasks to help you achieve it.
          </p>
          
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Example: I want to learn machine learning and build a project within 3 months..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">💡 Tips for better results:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Be specific about what you want to achieve</li>
                <li>• Mention your timeline if you have one</li>
                <li>• Include any constraints or resources you have</li>
              </ul>
            </div>
            

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing your goal...</span>
                </>
              ) : (
                <>
                  <Brain size={20} />
                  <span>Analyze My Goal</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Clarifying Questions */}
      {step === 'clarify' && goalAnalysis && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-4">Let me understand better</h2>
          <p className="text-gray-600 mb-6">
            Answer these questions to help me create the perfect plan for you:
          </p>

          <div className="space-y-6">
            {goalAnalysis.clarifyingQuestions?.map((question, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-4">
                <label className="block text-lg font-medium text-gray-800 mb-2">
                  {index + 1}. {question}
                </label>
                <textarea
                  value={answers[question] || ''}
                  onChange={(e) => handleAnswerChange(question, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Your answer..."
                />
              </div>
            ))}
          </div>

          <button
            onClick={createPlan}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating your plan...' : 'Create My Action Plan'}
          </button>
        </div>
      )}

      {/* Step 3: Action Plan Display */}
      {step === 'plan' && actionPlan && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-3xl font-bold mb-2">{actionPlan.planTitle}</h2>
            <div className="flex items-center space-x-4 text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <Clock size={20} />
                <span>Duration: {actionPlan.totalDuration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap size={20} />
                <span>{actionPlan.phases?.length} Phases</span>
              </div>
            </div>

            {/* Automation Info */}
            {actionPlan.automationPlan && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="font-semibold text-green-800 mb-2">🤖 Automation Benefits:</p>
                <p className="text-green-700">{actionPlan.automationPlan.automationBenefits}</p>
                <div className="mt-2 text-sm text-green-600">
                  <span className="font-semibold">{actionPlan.automationPlan.automatedTasks?.length || 0}</span> tasks will be automated
                </div>
              </div>
            )}

            {/* Phases */}
            <div className="space-y-6">
              {actionPlan.phases?.map((phase, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Phase {phase.phaseNumber}: {phase.phaseName}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {phase.duration}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{phase.description}</p>

                  <div className="space-y-3">
                    {phase.tasks?.map((task, taskIndex) => (
                      <div key={taskIndex} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold">{task.taskName}</span>
                              {task.canAutomate && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  🤖 Auto
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded text-xs ${
                                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>⏱️ {task.estimatedTime}</span>
                              <span>📅 {task.deadline}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={startExecution}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-blue-700 flex items-center justify-center space-x-2"
            >
              <Play size={24} />
              <span>Start Executing My Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Execution & Progress */}
      {step === 'execute' && currentPlan && (
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span>Overall Progress</span>
                <span className="font-bold">{progress?.percentage || 0}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-4">
                <div
                  className="bg-white rounded-full h-4 transition-all duration-500"
                  style={{ width: `${progress?.percentage || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{progress?.completed || 0}</p>
                <p className="text-sm">Completed</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{progress?.total || 0}</p>
                <p className="text-sm">Total Tasks</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{progress?.currentPhase || 1}/{progress?.totalPhases || 1}</p>
                <p className="text-sm">Phase</p>
              </div>
            </div>
          </div>

          {/* Current Tasks */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">Current Phase Tasks</h3>
            {actionPlan?.phases?.[progress?.currentPhase - 1]?.tasks.map((task, index) => {
              const isCompleted = currentPlan.completedTasks?.includes(task.taskId);
              
              return (
                <div key={index} className={`border rounded-lg p-4 mb-3 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {isCompleted && <CheckCircle size={20} className="text-green-600" />}
                        <span className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {task.taskName}
                        </span>
                        {task.canAutomate && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            🤖 Automated
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    {!isCompleted && (
                      <button
                        onClick={() => completeTask(task.taskId)}
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenticAIAssistant;
