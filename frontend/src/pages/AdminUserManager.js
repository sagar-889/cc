import React, { useState } from 'react';
import { Users, Sparkles, UserPlus, AlertTriangle, CheckCircle, Upload, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminUserManager = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bulk_create');
  const [bulkUsers, setBulkUsers] = useState('');
  const [inactiveUsers, setInactiveUsers] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [createdUsers, setCreatedUsers] = useState(null);

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  const handleBulkCreate = async () => {
    if (!bulkUsers.trim()) {
      toast.error('Please enter user data');
      return;
    }

    setLoading(true);
    try {
      // Parse CSV format: name,email,role,department,year
      const lines = bulkUsers.trim().split('\n');
      const users = lines.map(line => {
        const [name, email, role, department, year] = line.split(',').map(s => s.trim());
        return { name, email, role: role || 'student', department, year };
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/agentic/users/bulk-create`,
        { users },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setCreatedUsers(response.data);
        toast.success(response.data.message);
        setBulkUsers('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create users');
    } finally {
      setLoading(false);
    }
  };

  const detectInactiveUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/agentic/users/inactive?days=30`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setInactiveUsers(response.data);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to detect inactive users');
    } finally {
      setLoading(false);
    }
  };

  const detectAnomalies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/agentic/users/anomalies`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setAnomalies(response.data);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to detect anomalies');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `John Doe,john@example.com,student,CSE,2024
Jane Smith,jane@example.com,student,ECE,2023
Bob Johnson,bob@example.com,faculty,CSE,`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk_users_template.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Smart User Management</h1>
              <p className="text-green-100 text-lg">
                AI-powered bulk operations and user monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('bulk_create')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'bulk_create'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              Bulk Create Users
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'inactive'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              Detect Inactive Users
            </button>
            <button
              onClick={() => setActiveTab('anomalies')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'anomalies'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              Detect Anomalies
            </button>
          </div>
        </div>

        {/* Bulk Create Tab */}
        {activeTab === 'bulk_create' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Bulk Create Users</h2>
              <button
                onClick={downloadTemplate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                User Data (CSV Format: name,email,role,department,year)
              </label>
              <textarea
                value={bulkUsers}
                onChange={(e) => setBulkUsers(e.target.value)}
                placeholder="John Doe,john@example.com,student,CSE,2024&#10;Jane Smith,jane@example.com,student,ECE,2023"
                rows="10"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
              />
              <p className="text-sm text-gray-600 mt-2">
                💡 Each line should contain: name, email, role, department, year (separated by commas)
              </p>
            </div>

            <button
              onClick={handleBulkCreate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Creating Users...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Create Users with AI Validation
                </>
              )}
            </button>

            {/* Created Users Result */}
            {createdUsers && (
              <div className="mt-8 space-y-4">
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    Successfully Created: {createdUsers.created?.length || 0} users
                  </h3>
                  <div className="space-y-2">
                    {createdUsers.created?.map((user, idx) => (
                      <div key={idx} className="bg-white border border-green-200 rounded-lg p-3">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-green-600 mt-1">
                          Default Password: {user.defaultPassword}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {createdUsers.errors && createdUsers.errors.length > 0 && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-red-700 mb-4">
                      Errors: {createdUsers.errors.length}
                    </h3>
                    <div className="space-y-2">
                      {createdUsers.errors.map((error, idx) => (
                        <div key={idx} className="bg-white border border-red-200 rounded-lg p-3">
                          <p className="font-semibold text-red-600">{error.email}</p>
                          <p className="text-sm text-gray-600">{error.error}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Inactive Users Tab */}
        {activeTab === 'inactive' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Detect Inactive Users</h2>
            <p className="text-gray-600 mb-6">
              Find users who haven't logged in for the past 30 days
            </p>

            <button
              onClick={detectInactiveUsers}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Detecting...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Detect Inactive Users
                </>
              )}
            </button>

            {inactiveUsers && (
              <div className="mt-8">
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-yellow-700 mb-2">
                    Found {inactiveUsers.inactiveUsers?.length || 0} inactive users
                  </h3>
                  <p className="text-sm text-gray-600">
                    Users inactive for {inactiveUsers.cutoffDays} days or more
                  </p>
                </div>

                {inactiveUsers.recommendations && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-bold mb-2">AI Recommendations:</h4>
                    <ul className="space-y-1">
                      {inactiveUsers.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  {inactiveUsers.inactiveUsers?.map((user, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {user.department} • Year {user.year}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          Inactive
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Anomalies Tab */}
        {activeTab === 'anomalies' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Detect Account Anomalies</h2>
            <p className="text-gray-600 mb-6">
              Find suspicious patterns, incomplete profiles, and unusual account activities
            </p>

            <button
              onClick={detectAnomalies}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Detecting...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Detect Anomalies with AI
                </>
              )}
            </button>

            {anomalies && (
              <div className="mt-8">
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-red-700">
                    Found {anomalies.anomalies?.length || 0} anomalies
                  </h3>
                </div>

                <div className="space-y-2">
                  {anomalies.anomalies?.map((anomaly, idx) => (
                    <div key={idx} className="bg-gray-50 border-2 border-red-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{anomaly.email}</p>
                          <p className="text-sm text-red-600 mt-1">{anomaly.message}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          anomaly.type === 'incomplete_profile' 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {anomaly.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {anomalies.anomalies?.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No Anomalies Found</h3>
                    <p className="text-gray-600">All user accounts are in good standing!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManager;
