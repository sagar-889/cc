import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, BookOpen, Target, TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ExamPrepAgent = () => {
  const [loading, setLoading] = useState(false);
  const [examPreps, setExamPreps] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newExam, setNewExam] = useState({
    examName: '',
    examDate: '',
    topics: ''
  });

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  useEffect(() => {
    fetchExamPreps();
  }, []);

  const fetchExamPreps = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/exam-prep`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setExamPreps(response.data.examPreps || []);
    } catch (error) {
      console.error('Fetch exam preps error:', error);
    }
  };

  const handleCreateExamPrep = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const topics = newExam.topics.split(',').map(t => t.trim()).filter(t => t);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/exam-prep/create`,
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
        setShowCreateForm(false);
        fetchExamPreps();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create exam prep plan');
    } finally {
      setLoading(false);
    }
  };

  const viewExamDetails = async (examId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/exam-prep/${examId}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSelectedExam(response.data.examPrep);
    } catch (error) {
      toast.error('Failed to fetch exam details');
    }
  };

  const updateProgress = async (examId, topicIndex, completed, confidence) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/exam-prep/${examId}/progress`,
        {
          topicIndex,
          completed,
          confidence,
          studyHours: 1
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('Progress updated!');
      viewExamDetails(examId);
      fetchExamPreps();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const calculateDaysUntilExam = (examDate) => {
    const days = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Exam Preparation Automation</h1>
              <p className="text-green-100 text-lg">
                AI-powered comprehensive exam preparation plans
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-green-600" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">1</div>
              <p className="font-semibold text-sm">Enter Exam</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">2</div>
              <p className="font-semibold text-sm">AI Analyzes</p>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">3</div>
              <p className="font-semibold text-sm">Creates Plan</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">4</div>
              <p className="font-semibold text-sm">Finds Materials</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">5</div>
              <p className="font-semibold text-sm">Generates Tests</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">6</div>
              <p className="font-semibold text-sm">Tracks Progress</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-6 h-6" />
            {showCreateForm ? 'Hide Form' : 'Create New Exam Preparation Plan'}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">Create Exam Preparation Plan</h3>
            <form onSubmit={handleCreateExamPrep} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Name *</label>
                <input
                  type="text"
                  value={newExam.examName}
                  onChange={(e) => setNewExam({...newExam, examName: e.target.value})}
                  placeholder="e.g., DBMS Mid-Term Exam"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Date & Time *</label>
                <input
                  type="datetime-local"
                  value={newExam.examDate}
                  onChange={(e) => setNewExam({...newExam, examDate: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Topics (comma-separated)</label>
                <textarea
                  value={newExam.topics}
                  onChange={(e) => setNewExam({...newExam, topics: e.target.value})}
                  placeholder="e.g., Relational Model, SQL Queries, Normalization, Transactions, Indexing"
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 Tip: List all major topics that will be covered in the exam
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Creating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Exam Prep Plan with AI
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Exam Preps List */}
        {!selectedExam && examPreps.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6">Your Exam Preparations ({examPreps.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {examPreps.map((exam) => {
                const daysUntil = calculateDaysUntilExam(exam.examDate);
                const isUpcoming = daysUntil > 0;
                
                return (
                  <div
                    key={exam._id}
                    onClick={() => viewExamDetails(exam._id)}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-800 mb-2">{exam.examName}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(exam.examDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className={`text-center px-4 py-2 rounded-lg ${isUpcoming ? 'bg-green-600' : 'bg-gray-400'} text-white`}>
                        <p className="text-2xl font-bold">{Math.abs(daysUntil)}</p>
                        <p className="text-xs">{isUpcoming ? 'days left' : 'days ago'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{exam.progress?.overallProgress || 0}%</p>
                        <p className="text-xs text-gray-600">Progress</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{exam.progress?.topicsCompleted || 0}/{exam.progress?.totalTopics || 0}</p>
                        <p className="text-xs text-gray-600">Topics</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{exam.progress?.studyHours || 0}h</p>
                        <p className="text-xs text-gray-600">Studied</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-pink-600">{exam.flashcards?.length || 0}</p>
                        <p className="text-xs text-gray-600">Flashcards</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Overall Progress</span>
                        <span className="font-bold text-green-600">{exam.progress?.overallProgress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                          style={{ width: `${exam.progress?.overallProgress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Exam Details View */}
        {selectedExam && (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedExam(null)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              ← Back to All Exams
            </button>

            {/* Exam Header */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedExam.examName}</h2>
                  <p className="text-lg text-gray-600">
                    {new Date(selectedExam.examDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {calculateDaysUntilExam(selectedExam.examDate)} days until exam
                  </p>
                </div>
                <div className="text-center bg-gradient-to-br from-green-100 to-emerald-100 px-8 py-6 rounded-xl">
                  <p className="text-5xl font-bold text-green-600">{selectedExam.progress?.overallProgress || 0}%</p>
                  <p className="text-sm text-gray-600 mt-2">Overall Progress</p>
                </div>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Target className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-800">{selectedExam.progress?.topicsCompleted || 0}/{selectedExam.progress?.totalTopics || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Topics Completed</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-800">{selectedExam.progress?.studyHours || 0}h</p>
                <p className="text-sm text-gray-600 mt-2">Study Hours</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <BookOpen className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-800">{selectedExam.studyMaterials?.length || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Study Materials</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Zap className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-800">{selectedExam.flashcards?.length || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Flashcards</p>
              </div>
            </div>

            {/* Syllabus */}
            {selectedExam.syllabus && selectedExam.syllabus.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-green-600" />
                  Syllabus Breakdown
                </h3>
                <div className="space-y-4">
                  {selectedExam.syllabus.map((topic, idx) => (
                    <div key={idx} className="border-2 border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-800">{topic.topic}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {topic.subtopics?.map((subtopic, sidx) => (
                              <span key={sidx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                {subtopic}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={topic.completed}
                            onChange={(e) => updateProgress(selectedExam._id, idx, e.target.checked, topic.confidence)}
                            className="w-8 h-8 text-green-600 rounded focus:ring-green-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <div className="flex gap-2">
                          {['low', 'medium', 'high'].map((level) => (
                            <button
                              key={level}
                              onClick={() => updateProgress(selectedExam._id, idx, topic.completed, level)}
                              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                topic.confidence === level
                                  ? level === 'high' ? 'bg-green-600 text-white' :
                                    level === 'medium' ? 'bg-yellow-600 text-white' :
                                    'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preparation Plan */}
            {selectedExam.preparationPlan && selectedExam.preparationPlan.phases && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  Preparation Plan ({selectedExam.preparationPlan.totalWeeks} weeks)
                </h3>
                <div className="space-y-6">
                  {selectedExam.preparationPlan.phases.map((phase, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-800">{phase.phaseName}</h4>
                          <p className="text-sm text-gray-600">{phase.duration} • {phase.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 ml-16">
                        {phase.tasks?.map((task, tidx) => (
                          <div key={tidx} className="flex items-center gap-3 bg-white rounded-lg p-3">
                            <CheckCircle className={`w-5 h-5 ${task.completed ? 'text-green-600' : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{task.taskName}</p>
                              <p className="text-sm text-gray-600">{task.description}</p>
                            </div>
                            <span className="text-sm text-gray-500">{task.deadline}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practice Tests */}
            {selectedExam.practiceTests && selectedExam.practiceTests.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Target className="w-8 h-8 text-blue-600" />
                  Practice Tests Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedExam.practiceTests.map((test, idx) => (
                    <div key={idx} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-lg text-gray-800">{test.testName}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Scheduled: {new Date(test.scheduledDate).toLocaleDateString()}
                      </p>
                      {test.completed && test.score !== null && (
                        <p className="text-sm font-semibold text-blue-600 mt-2">
                          Score: {test.score}/{test.totalMarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedExam && examPreps.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Exam Preparations Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first exam preparation plan to get AI-powered study guidance!
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Create First Exam Prep Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamPrepAgent;
