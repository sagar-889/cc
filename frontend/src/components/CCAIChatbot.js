import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, FileText, Sparkles, X, Minimize2, Maximize2, Download } from 'lucide-react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import jsPDF from 'jspdf';

const CCAIChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const detectIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('generate code') || lowerMessage.includes('write code') || 
        lowerMessage.includes('create a program') || lowerMessage.includes('code for')) {
      return 'code_generation';
    }
    
    if (lowerMessage.includes('create pdf') || lowerMessage.includes('make pdf') || 
        lowerMessage.includes('generate pdf') || lowerMessage.includes('pdf of')) {
      return 'pdf_creation';
    }
    
    if (lowerMessage.includes('solve') || lowerMessage.includes('calculate') || 
        lowerMessage.includes('find the solution')) {
      return 'problem_solving';
    }
    
    return 'general_chat';
  };

  const extractCodeFromResponse = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const matches = [];
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push({
        language: match[1] || 'javascript',
        code: match[2].trim()
      });
    }
    
    return matches;
  };

  const generatePDF = (content, filename = 'CC-AI-Document.pdf') => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('CC-AI Generated Document', margin, margin);
      
      // Date
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 10);
      
      // Content
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(content, maxWidth);
      let y = margin + 25;
      
      lines.forEach(line => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 7;
      });
      
      // Save
      doc.save(filename);
      
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      return false;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const intent = detectIntent(input);
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      
      let endpoint = '/chatbot/chat';
      let requestData = { message: input };

      // Route to appropriate endpoint based on intent
      if (intent === 'code_generation') {
        endpoint = '/chatbot/code-help';
        requestData = { query: input, language: 'auto-detect' };
      } else if (intent === 'problem_solving') {
        endpoint = '/chatbot/solve-math';
        requestData = { problem: input };
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiResponse = response.data.response || response.data.solution || response.data.help || 'I\'m here to help!';
      
      // Check if response contains code
      const codeBlocks = extractCodeFromResponse(aiResponse);
      
      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        codeBlocks: codeBlocks.length > 0 ? codeBlocks : null,
        intent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-generate PDF if requested
      if (intent === 'pdf_creation') {
        setTimeout(() => {
          const pdfGenerated = generatePDF(aiResponse);
          if (pdfGenerated) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: '✅ PDF generated successfully! Check your downloads folder.',
              timestamp: new Date()
            }]);
          }
        }, 500);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    // Could add a toast notification here
  };

  const downloadCode = (code, language) => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css'
    };
    
    const ext = extensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cc-ai-code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold">CC-AI Assistant</h3>
              <p className="text-xs text-blue-100">Your intelligent companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-[460px] overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    }`}>
                      {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Code Blocks */}
                      {message.codeBlocks && message.codeBlocks.map((block, idx) => (
                        <div key={idx} className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                          <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Code size={16} />
                              <span className="text-sm">{block.language}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyCode(block.code)}
                                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                              >
                                Copy
                              </button>
                              <button
                                onClick={() => downloadCode(block.code, block.language)}
                                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded flex items-center space-x-1"
                              >
                                <Download size={12} />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                          <SyntaxHighlighter
                            language={block.language}
                            style={vscDarkPlus}
                            customStyle={{ margin: 0, fontSize: '12px' }}
                          >
                            {block.code}
                          </SyntaxHighlighter>
                        </div>
                      ))}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Sparkles size={12} />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Code size={12} />
                  <span>Code Gen</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText size={12} />
                  <span>PDF Export</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CCAIChatbot;
