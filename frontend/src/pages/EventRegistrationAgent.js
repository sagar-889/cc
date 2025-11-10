import React, { useState } from 'react';
import { Calendar, Sparkles, CheckCircle, AlertCircle, Clock, MapPin, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EventRegistrationAgent = () => {
  const [eventQuery, setEventQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventResults, setEventResults] = useState(null);
  const [autoRegister, setAutoRegister] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = ['workshop', 'seminar', 'hackathon', 'fest', 'club', 'sports', 'cultural', 'technical'];

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  const handleEventSearch = async (e) => {
    e.preventDefault();
    if (!eventQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/events/auto-register`,
        {
          query: eventQuery,
          preferences: {
            autoRegister: autoRegister,
            categories: selectedCategories
          }
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setEventResults(response.data);
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to search events');
      console.error('Event search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <Calendar className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Event Registration Agent</h1>
              <p className="text-purple-100 text-lg">
                AI-powered event discovery and automatic registration
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                1
              </div>
              <p className="font-semibold">Describe Events</p>
              <p className="text-sm text-gray-600 mt-1">Tell AI what you're looking for</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                2
              </div>
              <p className="font-semibold">AI Searches</p>
              <p className="text-sm text-gray-600 mt-1">Finds matching events</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                3
              </div>
              <p className="font-semibold">Scores Relevance</p>
              <p className="text-sm text-gray-600 mt-1">Ranks by your interests</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                4
              </div>
              <p className="font-semibold">Auto-Registers</p>
              <p className="text-sm text-gray-600 mt-1">Registers you automatically</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleEventSearch} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                What events are you looking for?
              </label>
              <textarea
                value={eventQuery}
                onChange={(e) => setEventQuery(e.target.value)}
                placeholder="Example: Find AI and Machine Learning workshops happening this month on campus"
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Tip: Be specific about topics, timeframe, and preferences
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Event Categories (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      selectedCategories.includes(category)
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Register Toggle */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="autoRegister"
                  checked={autoRegister}
                  onChange={(e) => setAutoRegister(e.target.checked)}
                  className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500 mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="autoRegister" className="text-lg font-semibold text-gray-800 cursor-pointer">
                    🤖 Enable Automatic Registration
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    AI will automatically register you for events with relevance score above 70%. 
                    Schedule conflicts will be checked automatically.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Searching Events...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Find Events with AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {eventResults && (
          <div className="space-y-6">
            {/* Auto-Registered Events */}
            {eventResults.registeredEvents && eventResults.registeredEvents.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-green-600 flex items-center gap-3">
                  <CheckCircle className="w-8 h-8" />
                  ✅ Auto-Registered Events ({eventResults.registeredEvents.length})
                </h3>
                <div className="space-y-4">
                  {eventResults.registeredEvents.map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-800 mb-2">{item.event.title}</h4>
                          <p className="text-gray-600 mb-3">{item.event.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>{new Date(item.event.date || item.event.startDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>{new Date(item.event.date || item.event.startDate).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{item.event.location || item.event.venue}</span>
                            </div>
                            {item.event.type && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                {item.event.type}
                              </span>
                            )}
                          </div>

                          <div className="bg-white rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-600 font-medium">
                              🎯 {item.reason}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                                style={{ width: `${item.relevanceScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-green-600">
                              {item.relevanceScore}% Match
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-2xl">
                            ✓
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Events */}
            {eventResults.recommendedEvents && eventResults.recommendedEvents.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  💡 Recommended Events ({eventResults.recommendedEvents.length})
                </h3>
                <div className="space-y-4">
                  {eventResults.recommendedEvents.map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-800 mb-2">{item.event.title}</h4>
                          <p className="text-gray-600 mb-3">{item.event.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>{new Date(item.event.date || item.event.startDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>{new Date(item.event.date || item.event.startDate).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{item.event.location || item.event.venue}</span>
                            </div>
                            {item.event.type && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                {item.event.type}
                              </span>
                            )}
                          </div>

                          <div className="bg-white rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-600 font-medium">
                              🎯 {item.reason}
                            </p>
                            {item.hasConflict && (
                              <p className="text-sm text-red-600 font-medium mt-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                ⚠️ Schedule conflict detected with your timetable
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all"
                                style={{ width: `${item.relevanceScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-blue-600">
                              {item.relevanceScore}% Match
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {(!eventResults.registeredEvents || eventResults.registeredEvents.length === 0) &&
             (!eventResults.recommendedEvents || eventResults.recommendedEvents.length === 0) && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Events Found</h3>
                <p className="text-gray-600">
                  Try adjusting your search query or selecting different categories.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrationAgent;
