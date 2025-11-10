import React, { useEffect, useState } from 'react';
import { HelpCircle, Search, Plus, ThumbsUp, CheckCircle, MessageSquare } from 'lucide-react';
import { helpdeskAPI } from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const Helpdesk = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    category: 'academic',
    tags: ''
  });
  const [answerText, setAnswerText] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchQuestions();
  }, [filterCategory, filterStatus]);

  const fetchQuestions = async () => {
    try {
      const response = await helpdeskAPI.getAll({ category: filterCategory, status: filterStatus });
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    
    if (!newQuestion.title || !newQuestion.content) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const questionData = {
        ...newQuestion,
        tags: newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await helpdeskAPI.ask(questionData);
      toast.success('Question posted successfully');
      setShowAskModal(false);
      setNewQuestion({
        title: '',
        content: '',
        category: 'academic',
        tags: ''
      });
      fetchQuestions();
    } catch (error) {
      console.error('Ask error:', error);
      toast.error('Failed to post question');
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    if (!answerText.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    try {
      await helpdeskAPI.answer(questionId, { content: answerText });
      toast.success('Answer posted successfully');
      setAnswerText('');
      
      // Refresh the selected question
      const response = await helpdeskAPI.getById(questionId);
      setSelectedQuestion(response.data.question);
      fetchQuestions();
    } catch (error) {
      console.error('Answer error:', error);
      toast.error('Failed to post answer');
    }
  };

  const handleUpvoteQuestion = async (questionId) => {
    try {
      await helpdeskAPI.upvoteQuestion(questionId);
      fetchQuestions();
      if (selectedQuestion && selectedQuestion._id === questionId) {
        const response = await helpdeskAPI.getById(questionId);
        setSelectedQuestion(response.data.question);
      }
    } catch (error) {
      console.error('Upvote error:', error);
    }
  };

  const handleUpvoteAnswer = async (questionId, answerId) => {
    try {
      await helpdeskAPI.upvoteAnswer(questionId, answerId);
      const response = await helpdeskAPI.getById(questionId);
      setSelectedQuestion(response.data.question);
    } catch (error) {
      console.error('Upvote error:', error);
    }
  };

  const handleAcceptAnswer = async (questionId, answerId) => {
    try {
      await helpdeskAPI.acceptAnswer(questionId, answerId);
      toast.success('Answer accepted');
      const response = await helpdeskAPI.getById(questionId);
      setSelectedQuestion(response.data.question);
      fetchQuestions();
    } catch (error) {
      console.error('Accept error:', error);
      toast.error('Failed to accept answer');
    }
  };

  const handleQuestionClick = async (questionId) => {
    try {
      const response = await helpdeskAPI.getById(questionId);
      setSelectedQuestion(response.data.question);
    } catch (error) {
      console.error('Fetch question error:', error);
      toast.error('Failed to load question details');
    }
  };

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-700',
      technical: 'bg-green-100 text-green-700',
      administrative: 'bg-purple-100 text-purple-700',
      general: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.general;
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
            <HelpCircle className="mr-3 text-primary-600" size={32} />
            Peer Helpdesk
          </h1>
          <p className="text-gray-600 mt-1">Ask questions and help your peers</p>
        </div>
        <button
          onClick={() => setShowAskModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Ask Question
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            <option value="academic">Academic</option>
            <option value="technical">Technical</option>
            <option value="administrative">Administrative</option>
            <option value="general">General</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <div
            key={question._id}
            onClick={() => handleQuestionClick(question._id)}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                    {question.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    question.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                    question.status === 'answered' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {question.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{question.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{question.content}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <ThumbsUp size={16} className="mr-1" />
                  {question.upvotes?.length || 0}
                </span>
                <span className="flex items-center">
                  <MessageSquare size={16} className="mr-1" />
                  {question.answers?.length || 0} answers
                </span>
                <span>{question.views || 0} views</span>
              </div>
              <span>Asked by {question.askedBy?.name}</span>
            </div>

            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {question.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>No questions found</p>
        </div>
      )}

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">Ask a Question</h2>
            
            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  required
                  placeholder="What's your question?"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  required
                  rows={6}
                  placeholder="Provide details about your question..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="academic">Academic</option>
                  <option value="technical">Technical</option>
                  <option value="administrative">Administrative</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={newQuestion.tags}
                  onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                  placeholder="e.g., programming, database, exam (comma separated)"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Details Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedQuestion.category)}`}>
                    {selectedQuestion.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedQuestion.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                    selectedQuestion.status === 'answered' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedQuestion.status}
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{selectedQuestion.title}</h2>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Question Content */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedQuestion.askedBy?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{selectedQuestion.askedBy?.name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(selectedQuestion.createdAt), 'PPp')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUpvoteQuestion(selectedQuestion._id)}
                  className="flex items-center space-x-1 px-3 py-1 border rounded-lg hover:bg-white transition-colors"
                >
                  <ThumbsUp size={16} />
                  <span>{selectedQuestion.upvotes?.length || 0}</span>
                </button>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedQuestion.content}</p>
              
              {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedQuestion.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-white text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Answers */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">
                {selectedQuestion.answers?.length || 0} Answer{selectedQuestion.answers?.length !== 1 ? 's' : ''}
              </h3>
              
              <div className="space-y-4">
                {selectedQuestion.answers?.map((answer) => (
                  <div key={answer._id} className={`p-4 rounded-lg ${answer.isAccepted ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {answer.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{answer.user?.name}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(answer.createdAt), 'PPp')}
                          </p>
                        </div>
                        {answer.isAccepted && (
                          <span className="flex items-center text-green-600 text-sm font-medium">
                            <CheckCircle size={16} className="mr-1" />
                            Accepted Answer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpvoteAnswer(selectedQuestion._id, answer._id)}
                          className="flex items-center space-x-1 px-3 py-1 border rounded-lg hover:bg-white transition-colors"
                        >
                          <ThumbsUp size={16} />
                          <span>{answer.upvotes?.length || 0}</span>
                        </button>
                        {selectedQuestion.askedBy?._id === user?._id && !answer.isAccepted && (
                          <button
                            onClick={() => handleAcceptAnswer(selectedQuestion._id, answer._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{answer.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Answer Form */}
            <div>
              <h3 className="text-lg font-bold mb-3">Your Answer</h3>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={4}
                placeholder="Write your answer here..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 mb-3"
              />
              <button
                onClick={() => handleAnswerQuestion(selectedQuestion._id)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Post Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Helpdesk;
