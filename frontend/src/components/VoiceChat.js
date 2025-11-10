import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VoiceChat = ({ isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      initializeVoiceChat();
    } else {
      cleanup();
    }

    return () => cleanup();
  }, [isOpen]);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onerror = handleSpeechError;
      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current.start();
        }
      };
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const initializeVoiceChat = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/voiceChat/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSessionId(response.data.sessionId);
      setMessages([{
        role: 'assistant',
        content: 'Hi! I\'m your AI voice assistant. How can I help you today?',
        timestamp: new Date()
      }]);
      
      if (audioEnabled) {
        speak('Hi! I\'m your AI voice assistant. How can I help you today?');
      }
    } catch (error) {
      console.error('Initialize voice chat error:', error);
      toast.error('Failed to start voice chat');
    }
  };

  const cleanup = async () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
    }
    if (sessionId) {
      try {
        const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
        await axios.post(
          `${process.env.REACT_APP_API_URL}/voiceChat/end`,
          { sessionId },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } catch (error) {
        console.error('End session error:', error);
      }
    }
    setSessionId(null);
    setMessages([]);
    setTranscript('');
  };

  const handleSpeechResult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      setTranscript(finalTranscript.trim());
      processVoiceMessage(finalTranscript.trim());
    } else {
      setTranscript(interimTranscript);
    }
  };

  const handleSpeechError = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'no-speech') {
      // User didn't speak, continue listening
      return;
    }
    toast.error('Voice recognition error: ' + event.error);
    setIsRecording(false);
  };

  const processVoiceMessage = async (text) => {
    if (!text.trim()) return;

    setIsProcessing(true);

    // Add user message
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/voiceChat/message`,
        {
          sessionId: sessionId || undefined,
          transcript: text
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update session ID if it was created
      if (response.data.sessionId && !sessionId) {
        setSessionId(response.data.sessionId);
      }

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response
      if (audioEnabled) {
        if (response.data.audioResponse) {
          // Play OpenAI TTS audio
          playAudioResponse(response.data.audioResponse);
        } else {
          // Use browser TTS
          speak(response.data.response);
        }
      }

      setTranscript('');
    } catch (error) {
      console.error('Process voice message error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to process message');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Start recording error:', error);
        toast.error('Failed to start recording');
      }
    }
  };

  const speak = (text) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const playAudioResponse = (base64Audio) => {
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        toast.error('Failed to play audio');
      };
      audio.play();
    } catch (error) {
      console.error('Play audio error:', error);
      toast.error('Failed to play audio');
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[600px] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">AI Voice Assistant</h2>
              <p className="text-primary-100 text-sm">Speak naturally, I'm listening...</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {/* Live Transcript */}
          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] p-4 rounded-2xl bg-primary-100 text-primary-900 border-2 border-primary-300">
                <p className="text-sm italic">{transcript}</p>
                <p className="text-xs opacity-70 mt-1">Speaking...</p>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader className="animate-spin text-primary-600" size={20} />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-white border-t rounded-b-2xl">
          <div className="flex items-center justify-center space-x-6">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all ${
                audioEnabled
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-red-100 text-red-600'
              }`}
              title={audioEnabled ? 'Mute audio' : 'Unmute audio'}
            >
              {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>

            {/* Record Button */}
            <button
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`p-8 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg'
              }`}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>

            {/* Speaking Indicator */}
            <div className={`p-4 rounded-full ${isSpeaking ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Phone size={24} className={isSpeaking ? 'text-green-600 animate-pulse' : 'text-gray-400'} />
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {isRecording ? (
                <span className="text-red-600 font-semibold">● Recording...</span>
              ) : isSpeaking ? (
                <span className="text-green-600 font-semibold">Speaking...</span>
              ) : (
                'Click the microphone to start talking'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;
