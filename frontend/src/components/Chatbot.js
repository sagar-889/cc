import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Zap, BookOpen, Calendar, Users, GraduationCap } from 'lucide-react';
import { chatbotAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '🧠 Hi! I\'m your Intelligent AI Assistant for Campus Companion!\n\n💡 **I can help you with:**\n• Enroll/unenroll in courses\n• Solve math problems step-by-step\n• Find and organize materials\n• Register you for events\n• Generate content and assignments\n• Provide directions and navigation\n• Answer complex questions with reasoning\n\n🚀 **Try me:** "Enroll me in CS101", "Solve 2x + 5 = 15", "Find materials about AI"',
      intelligent: true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition failed');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickActions = [
    {
      text: "Enroll in Course",
      example: "Enroll me in CS101",
      icon: GraduationCap,
      color: "bg-blue-500"
    },
    {
      text: "Find Materials",
      example: "Find materials about algorithms",
      icon: BookOpen,
      color: "bg-green-500"
    },
    {
      text: "Discover Events",
      example: "Find hackathons this month",
      icon: Calendar,
      color: "bg-purple-500"
    },
    {
      text: "Contact Faculty",
      example: "Find Professor Smith",
      icon: Users,
      color: "bg-orange-500"
    }
  ];

  const handleQuickAction = (example) => {
    setInput(example);
    handleSend(example);
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { type: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotAPI.chat(text.trim());
      const data = response.data;

      // Create intelligent bot message with analysis
      const botMessage = {
        type: 'bot',
        text: data.response,
        intelligent: data.intelligent,
        analysis: data.analysis,
        actions: data.actions,
        actionResults: data.actionResults,
        isAction: data.actions && data.actions.length > 0,
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, botMessage]);

      // Show analysis in console for debugging
      if (data.analysis) {
        console.log('🧠 AI Analysis:', data.analysis);
        console.log('⚡ Actions Performed:', data.actions);
        console.log('📊 Results:', data.actionResults);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Try fallback chat if intelligent chat fails
      try {
        const fallbackResponse = await chatbotAPI.fallbackChat(text.trim());
        const botMessage = {
          type: 'bot',
          text: fallbackResponse.data.response,
          isFallback: true
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (fallbackError) {
        const errorMessage = {
          type: 'bot',
          text: '🤖 I encountered a technical issue, but I\'m still here to help! Could you try rephrasing your question or ask me something else?',
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-600 transition-all z-50 flex items-center justify-center animate-pulse"
        title="Agentic AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center">
                  <Zap size={20} className="mr-2" />
                  Agentic AI Assistant
                </h3>
                <p className="text-xs text-purple-100">Performs actions, not just answers</p>
              </div>
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-1 hover:bg-purple-400 rounded transition-colors"
                title="Quick Actions"
              >
                <Zap size={16} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="bg-gray-50 p-3 border-b">
              <p className="text-xs font-medium text-gray-600 mb-2">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleQuickAction(action.example);
                      setShowQuickActions(false);
                    }}
                    className={`${action.color} text-white text-xs py-2 px-3 rounded-lg hover:opacity-90 transition-opacity flex items-center`}
                  >
                    <action.icon size={14} className="mr-1" />
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                      : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : message.isAction
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : message.intelligent
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Show intelligent analysis */}
                  {message.intelligent && message.analysis && (
                    <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                      <div className="flex items-center text-blue-700 font-medium mb-1">
                        🧠 AI Analysis: {message.analysis.intent}
                      </div>
                      {message.analysis.complexity && (
                        <div className="text-blue-600">
                          Complexity: {message.analysis.complexity}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Show actions performed */}
                  {message.isAction && message.actions && (
                    <div className="mt-2 text-xs">
                      <div className="text-green-600 font-medium mb-1">
                        ⚡ Actions Performed:
                      </div>
                      {message.actions.map((action, idx) => (
                        <div key={idx} className="text-green-700 ml-2">
                          • {action.type.replace('_', ' ')}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Fallback indicator */}
                  {message.isFallback && (
                    <div className="mt-2 text-xs text-orange-600 font-medium">
                      ⚠️ Fallback response
                    </div>
                  )}
                  
                  {/* Standard action completed */}
                  {message.isAction && !message.actions && (
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      ✓ Action completed
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={handleVoiceInput}
                className={`p-2 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}
                title="Voice input"
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Try: 'enroll me in CS101' or 'find materials about ML'..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>

            {/* Action Hints */}
            <div className="flex flex-wrap gap-1 text-xs">
              <span className="text-gray-500">Try:</span>
              <button
                onClick={() => setInput("enroll me in CS101")}
                className="text-purple-600 hover:text-purple-800"
              >
                enroll in course
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => setInput("find materials about algorithms")}
                className="text-purple-600 hover:text-purple-800"
              >
                find materials
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => setInput("find events this month")}
                className="text-purple-600 hover:text-purple-800"
              >
                discover events
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
