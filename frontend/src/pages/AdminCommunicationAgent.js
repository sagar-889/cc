import React, { useState } from 'react';
import { MessageSquare, Sparkles, Send, Users, Calendar, Mail, Bell } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminCommunicationAgent = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('announcement');
  const [announcementData, setAnnouncementData] = useState({
    topic: '',
    targetAudience: 'All Students',
    urgency: 'normal'
  });
  const [targetedMessageData, setTargetedMessageData] = useState({
    message: '',
    role: '',
    department: '',
    year: ''
  });
  const [generatedAnnouncement, setGeneratedAnnouncement] = useState('');
  const [targetedResult, setTargetedResult] = useState(null);

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  const draftAnnouncement = async () => {
    if (!announcementData.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/agentic/communication/draft`,
        announcementData,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setGeneratedAnnouncement(response.data.announcement);
        toast.success('Announcement drafted successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to draft announcement');
    } finally {
      setLoading(false);
    }
  };

  const sendTargetedMessage = async () => {
    if (!targetedMessageData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      const filters = {};
      if (targetedMessageData.role) filters.role = targetedMessageData.role;
      if (targetedMessageData.department) filters.department = targetedMessageData.department;
      if (targetedMessageData.year) filters.year = targetedMessageData.year;

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/agentic/communication/targeted`,
        {
          message: targetedMessageData.message,
          filters
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setTargetedResult(response.data);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-red-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <MessageSquare className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Communication Automation</h1>
              <p className="text-pink-100 text-lg">
                AI-powered announcements, notifications, and targeted messaging
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('announcement')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'announcement'
                  ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-5 h-5 inline mr-2" />
              Draft Announcement
            </button>
            <button
              onClick={() => setActiveTab('targeted')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'targeted'
                  ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Send className="w-5 h-5 inline mr-2" />
              Targeted Messaging
            </button>
            <button
              onClick={() => setActiveTab('campaign')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'campaign'
                  ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Mail className="w-5 h-5 inline mr-2" />
              Email Campaign
            </button>
          </div>
        </div>

        {/* Draft Announcement Tab */}
        {activeTab === 'announcement' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Draft Announcement with AI</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Topic *</label>
                <input
                  type="text"
                  value={announcementData.topic}
                  onChange={(e) => setAnnouncementData({...announcementData, topic: e.target.value})}
                  placeholder="e.g., Mid-term exam schedule released"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
                <select
                  value={announcementData.targetAudience}
                  onChange={(e) => setAnnouncementData({...announcementData, targetAudience: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option>All Students</option>
                  <option>All Faculty</option>
                  <option>CSE Department</option>
                  <option>ECE Department</option>
                  <option>First Year Students</option>
                  <option>Final Year Students</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level</label>
                <select
                  value={announcementData.urgency}
                  onChange={(e) => setAnnouncementData({...announcementData, urgency: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <button
                onClick={draftAnnouncement}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Drafting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Announcement with AI
                  </>
                )}
              </button>

              {generatedAnnouncement && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-green-700 flex items-center gap-2">
                      <Sparkles className="w-6 h-6" />
                      AI-Generated Announcement
                    </h3>
                    <button
                      onClick={() => copyToClipboard(generatedAnnouncement)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-gray-700 font-sans">{generatedAnnouncement}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Targeted Messaging Tab */}
        {activeTab === 'targeted' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Send Targeted Message</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                <textarea
                  value={targetedMessageData.message}
                  onChange={(e) => setTargetedMessageData({...targetedMessageData, message: e.target.value})}
                  placeholder="Enter your message here..."
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role Filter</label>
                  <select
                    value={targetedMessageData.role}
                    onChange={(e) => setTargetedMessageData({...targetedMessageData, role: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">All Roles</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department Filter</label>
                  <input
                    type="text"
                    value={targetedMessageData.department}
                    onChange={(e) => setTargetedMessageData({...targetedMessageData, department: e.target.value})}
                    placeholder="e.g., CSE"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year Filter</label>
                  <input
                    type="text"
                    value={targetedMessageData.year}
                    onChange={(e) => setTargetedMessageData({...targetedMessageData, year: e.target.value})}
                    placeholder="e.g., 2024"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <button
                onClick={sendTargetedMessage}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Users className="w-6 h-6" />
                    Calculate Target Audience
                  </>
                )}
              </button>

              {targetedResult && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mt-6">
                  <h3 className="text-xl font-bold text-blue-700 mb-4">
                    Message will be sent to {targetedResult.targetUsers} users
                  </h3>
                  
                  {targetedResult.recipients && targetedResult.recipients.length > 0 && (
                    <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
                      <h4 className="font-semibold mb-3">Recipients:</h4>
                      <div className="space-y-2">
                        {targetedResult.recipients.slice(0, 20).map((recipient, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200">
                            <div>
                              <p className="font-semibold text-sm">{recipient.name}</p>
                              <p className="text-xs text-gray-600">{recipient.email}</p>
                            </div>
                          </div>
                        ))}
                        {targetedResult.recipients.length > 20 && (
                          <p className="text-sm text-gray-600 text-center py-2">
                            ... and {targetedResult.recipients.length - 20} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email Campaign Tab */}
        {activeTab === 'campaign' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Create Email Campaign</h2>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-8 text-center">
              <Mail className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Email Campaign Builder</h3>
              <p className="text-gray-600 mb-6">
                Create and schedule email campaigns for students and faculty
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-white rounded-lg p-4">
                  <Calendar className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-bold mb-1">Schedule Campaigns</h4>
                  <p className="text-sm text-gray-600">Plan and schedule email campaigns in advance</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <Users className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="font-bold mb-1">Segment Audience</h4>
                  <p className="text-sm text-gray-600">Target specific groups with personalized content</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <Sparkles className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-bold mb-1">AI-Powered</h4>
                  <p className="text-sm text-gray-600">Generate engaging email content with AI</p>
                </div>
              </div>
              <button className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommunicationAgent;
