import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Phone, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EnhancedVoiceChat = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          handleVoiceInput(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text, voice = 'female') => {
    if (!audioEnabled || !synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Clean text for speech
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Get available voices
    const voices = synthRef.current.getVoices();
    
    // Try to find a female voice
    const femaleVoice = voices.find(v => 
      v.name.toLowerCase().includes('female') || 
      v.name.toLowerCase().includes('woman') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('victoria') ||
      v.name.toLowerCase().includes('karen') ||
      (v.lang.includes('en') && v.name.toLowerCase().includes('google'))
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    } else {
      // Fallback to first English voice
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    // Voice settings for more natural speech
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.1; // Slightly higher pitch for female voice
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleVoiceInput = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript('');

    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/voiceChat/message`,
        { query: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiResponse = response.data.response || 'I\'m here to help!';
      
      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response
      if (audioEnabled) {
        speakText(aiResponse);
      }

    } catch (error) {
      console.error('Voice chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (audioEnabled) {
        speakText(errorMessage.content);
      }
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Phone size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Voice Assistant</h2>
                <p className="text-pink-100 text-sm">Speak naturally, I'm listening...</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Voice Visualization */}
          <div className="flex items-center justify-center space-x-2 h-16">
            {isListening ? (
              <>
                <div className="w-2 h-8 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-12 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-16 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-12 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-2 h-8 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </>
            ) : isSpeaking ? (
              <>
                <div className="w-2 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-10 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-14 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-10 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-2 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles size={20} />
                <span className="text-sm">Ready to chat</span>
              </div>
            )}
          </div>

          {/* Live Transcript */}
          {transcript && (
            <div className="mt-4 bg-white/20 rounded-lg p-3">
              <p className="text-sm italic">"{transcript}"</p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm'
              } rounded-2xl px-4 py-3`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div className="p-6 bg-white border-t border-gray-200 rounded-b-2xl">
          <div className="flex items-center justify-center space-x-4">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all ${
                audioEnabled
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={audioEnabled ? 'Mute voice' : 'Unmute voice'}
            >
              {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>

            {/* Main Mic Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
              className={`p-8 rounded-full transition-all transform hover:scale-105 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : isSpeaking
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
              } text-white shadow-lg`}
              title={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </button>

            {/* Stop Speaking */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-4 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-all"
                title="Stop speaking"
              >
                <VolumeX size={24} />
              </button>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {isListening ? (
                <span className="text-red-600 font-semibold">🎤 Listening...</span>
              ) : isSpeaking ? (
                <span className="text-purple-600 font-semibold">🔊 Speaking...</span>
              ) : (
                <span>Click the microphone to start talking</span>
              )}
            </p>
          </div>

          {/* Tips */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 text-center">
              💡 <strong>Tip:</strong> Speak clearly and naturally. I can answer questions, solve problems, and help with your studies!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVoiceChat;
