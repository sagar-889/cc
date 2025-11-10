import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, RefreshCw, CheckCircle, AlertTriangle, Zap, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const TimetableGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);

  useEffect(() => {
    fetchStatus();
    fetchOptimizationSuggestions();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/timetable/status', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const fetchOptimizationSuggestions = async () => {
    try {
      const response = await fetch('/api/admin/timetable/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`
        },
        body: JSON.stringify({
          constraints: {
            year1to3: { startTime: '08:15', endTime: '16:00' },
            finalYear: { startTime: '10:00', endTime: '16:10' }
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        setOptimizationSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch optimization suggestions:', error);
    }
  };

  const generateAllTimetables = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/admin/timetable/generate-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`✅ Generated timetables for ${data.result.successful} sections`);
        fetchStatus(); // Refresh status
      } else {
        toast.error('❌ Failed to generate timetables');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate timetables');
    } finally {
      setGenerating(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'faculty_conflict': return <Users size={16} className="text-red-500" />;
      case 'room_conflict': return <Settings size={16} className="text-orange-500" />;
      case 'timing_violation': return <Clock size={16} className="text-yellow-500" />;
      case 'optimization': return <Zap size={16} className="text-blue-500" />;
      default: return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-3">
          <Calendar size={40} />
          <div>
            <h1 className="text-3xl font-bold">Automated Timetable Generator</h1>
            <p className="text-blue-100 mt-1">AI-powered timetable generation with conflict resolution</p>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sections</p>
              <p className="text-2xl font-bold text-gray-900">{status?.stats?.total || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Auto-Generated</p>
              <p className="text-2xl font-bold text-green-600">{status?.stats?.automated || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent (24h)</p>
              <p className="text-2xl font-bold text-purple-600">{status?.stats?.recent || 0}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conflicts</p>
              <p className="text-2xl font-bold text-red-600">{optimizationSuggestions.filter(s => s.type.includes('conflict')).length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Timetable Management</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Generate All Timetables */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Generate All Timetables</h3>
            <p className="text-sm text-gray-600 mb-4">
              Automatically generate timetables for all sections with proper constraints and faculty assignments.
            </p>

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">📋 Generation Rules:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>1st-3rd Year:</strong> 8:15 AM - 4:00 PM</li>
                <li>• <strong>Final Year:</strong> 10:00 AM - 4:10 PM</li>
                <li>• <strong>Morning Break:</strong> 15 minutes</li>
                <li>• <strong>Lunch Break:</strong> 1 hour</li>
                <li>• <strong>Auto Faculty Assignment:</strong> No conflicts</li>
              </ul>
            </div>

            <button
              onClick={generateAllTimetables}
              disabled={generating}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {generating ? (
                <>
                  <RefreshCw size={20} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={20} className="mr-2" />
                  Generate All Timetables
                </>
              )}
            </button>
          </div>

          {/* Optimization Suggestions */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">AI Optimization Suggestions</h3>
            <p className="text-sm text-gray-600 mb-4">
              AI-powered analysis of current timetables for improvements and conflict resolution.
            </p>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {optimizationSuggestions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No optimization suggestions available</p>
              ) : (
                optimizationSuggestions.slice(0, 5).map((suggestion, index) => (
                  <div key={index} className={`p-3 rounded-lg ${getSeverityColor(suggestion.severity)}`}>
                    <div className="flex items-start space-x-2">
                      {getTypeIcon(suggestion.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{suggestion.message}</p>
                        <p className="text-xs mt-1 opacity-75">{suggestion.suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Timetables */}
      {status?.recentTimetables && status.recentTimetables.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Timetable Activity</h2>

          <div className="space-y-3">
            {status.recentTimetables.map((timetable, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {timetable.section?.name || 'Unknown Section'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {timetable.entries?.length || 0} classes • Generated: {timetable.generatedBy}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {timetable.lastGenerated ?
                      new Date(timetable.lastGenerated).toLocaleDateString() :
                      'Not generated'
                    }
                  </p>
                  {timetable.generatedBy === 'automated_system' && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      <CheckCircle size={12} className="mr-1" />
                      Auto-Generated
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableGenerator;
