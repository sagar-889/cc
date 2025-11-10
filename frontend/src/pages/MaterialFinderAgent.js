import React, { useState } from 'react';
import { BookOpen, Sparkles, Search, Download, ThumbsUp, FileText, Folder } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MaterialFinderAgent = () => {
  const [materialQuery, setMaterialQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [materialResults, setMaterialResults] = useState(null);
  const [generateSummaries, setGenerateSummaries] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // list or organized

  const materialTypes = ['notes', 'slides', 'assignments', 'previous_papers', 'books', 'videos'];

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  const handleMaterialSearch = async (e) => {
    e.preventDefault();
    if (!materialQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agenticFeatures/materials/find`,
        {
          query: materialQuery,
          options: {
            types: selectedTypes,
            generateSummaries: generateSummaries
          }
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setMaterialResults(response.data);
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to search materials');
      console.error('Material search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <BookOpen className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Study Material Finder & Organizer</h1>
              <p className="text-blue-100 text-lg">
                AI-powered material search with intelligent ranking and organization
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                1
              </div>
              <p className="font-semibold">Describe Needs</p>
              <p className="text-sm text-gray-600 mt-1">Tell AI what you need</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                2
              </div>
              <p className="font-semibold">AI Searches</p>
              <p className="text-sm text-gray-600 mt-1">Finds all matches</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                3
              </div>
              <p className="font-semibold">Ranks & Organizes</p>
              <p className="text-sm text-gray-600 mt-1">By relevance & quality</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                4
              </div>
              <p className="font-semibold">Summarizes</p>
              <p className="text-sm text-gray-600 mt-1">AI-generated summaries</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleMaterialSearch} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                What study materials do you need?
              </label>
              <textarea
                value={materialQuery}
                onChange={(e) => setMaterialQuery(e.target.value)}
                placeholder="Example: Data Structures lecture notes and previous year question papers"
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Tip: Mention course names, topics, or specific material types
              </p>
            </div>

            {/* Material Type Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Material Types (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {materialTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      selectedTypes.includes(type)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Summaries Toggle */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="generateSummaries"
                  checked={generateSummaries}
                  onChange={(e) => setGenerateSummaries(e.target.checked)}
                  className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="generateSummaries" className="text-lg font-semibold text-gray-800 cursor-pointer">
                    🤖 Generate AI Summaries
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    AI will create brief summaries for the top 5 materials to help you quickly understand their content.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Searching Materials...
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  Find Materials with AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {materialResults && materialResults.materials && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Found {materialResults.totalFound} Materials
                  </h3>
                  <p className="text-gray-600 mt-1">Showing top {materialResults.materials.length} results</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('organized')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      viewMode === 'organized'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Folder className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                  Top Materials (Ranked by Relevance)
                </h3>
                <div className="space-y-4">
                  {materialResults.materials.map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl font-bold text-blue-600">#{idx + 1}</span>
                            <h4 className="text-xl font-bold text-gray-800">{item.material.title}</h4>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{item.material.description}</p>
                          
                          <div className="flex flex-wrap gap-3 mb-3">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                              {item.material.type}
                            </span>
                            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {item.material.likes} likes
                            </span>
                            {item.material.course && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                {item.material.course.name || item.material.course}
                              </span>
                            )}
                          </div>

                          <div className="bg-white rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-600 font-medium">
                              💡 {item.reason}
                            </p>
                          </div>

                          {/* AI Summary */}
                          {materialResults.summaries && materialResults.summaries.find(s => s.materialId === item.material._id) && (
                            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mb-3">
                              <p className="text-sm font-semibold text-gray-700 mb-1">🤖 AI Summary:</p>
                              <p className="text-sm text-gray-600">
                                {materialResults.summaries.find(s => s.materialId === item.material._id).summary}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all"
                                style={{ width: `${item.relevanceScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-blue-600">
                              {item.relevanceScore}% Relevant
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Organized View */}
            {viewMode === 'organized' && materialResults.organized && (
              <div className="space-y-6">
                {/* By Course */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Folder className="w-8 h-8 text-blue-600" />
                    Organized by Course
                  </h3>
                  {Object.entries(materialResults.organized.byCourse).map(([courseName, materials]) => (
                    <div key={courseName} className="mb-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        {courseName} ({materials.length})
                      </h4>
                      <div className="space-y-2 ml-8">
                        {materials.map((item, idx) => (
                          <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="font-semibold text-gray-800">{item.material.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{item.material.type} • {item.relevanceScore}% relevant</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* By Type */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-indigo-600" />
                    Organized by Type
                  </h3>
                  {Object.entries(materialResults.organized.byType).map(([type, materials]) => (
                    <div key={type} className="mb-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-600" />
                        {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)} ({materials.length})
                      </h4>
                      <div className="space-y-2 ml-8">
                        {materials.map((item, idx) => (
                          <div key={idx} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <p className="font-semibold text-gray-800">{item.material.title}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.material.course?.name || 'General'} • {item.relevanceScore}% relevant
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialFinderAgent;
