import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, BookOpen, Download, Sparkles, FileText, PieChart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminReportGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [filters, setFilters] = useState({});
  const [generatedReport, setGeneratedReport] = useState(null);

  const reportTypes = [
    {
      id: 'student_performance',
      name: 'Student Performance Report',
      icon: Users,
      description: 'Comprehensive analysis of student performance, engagement, and activity',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'event_analytics',
      name: 'Event Analytics Report',
      icon: Calendar,
      description: 'Event participation, attendance trends, and success metrics',
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'resource_utilization',
      name: 'Resource Utilization Report',
      icon: BookOpen,
      description: 'Material downloads, bookings, and resource usage statistics',
      color: 'from-green-600 to-emerald-600'
    },
    {
      id: 'engagement_metrics',
      name: 'Engagement Metrics Report',
      icon: TrendingUp,
      description: 'User activity, helpdesk queries, and overall platform engagement',
      color: 'from-orange-600 to-red-600'
    },
    {
      id: 'overview',
      name: 'System Overview Report',
      icon: PieChart,
      description: 'Complete overview of all campus activities and metrics',
      color: 'from-cyan-600 to-blue-600'
    }
  ];

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  const generateReport = async () => {
    if (!selectedReportType) {
      toast.error('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/agentic/reports/generate`,
        {
          reportType: selectedReportType,
          filters
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setGeneratedReport(response.data);
        toast.success('Report generated successfully!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
      console.error('Report generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!generatedReport) return;

    const reportText = JSON.stringify(generatedReport, null, 2);
    const blob = new Blob([reportText], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedReportType}_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Automated Report Generation</h1>
              <p className="text-blue-100 text-lg">
                AI-powered comprehensive reports and analytics
              </p>
            </div>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Select Report Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReportType(report.id)}
                  className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                    selectedReportType === report.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${report.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        {selectedReportType && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Filters (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedReportType === 'student_performance' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={filters.department || ''}
                      onChange={(e) => setFilters({...filters, department: e.target.value})}
                      placeholder="e.g., CSE"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                    <input
                      type="text"
                      value={filters.year || ''}
                      onChange={(e) => setFilters({...filters, year: e.target.value})}
                      placeholder="e.g., 2024"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              
              {selectedReportType === 'event_analytics' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
                    <select
                      value={filters.type || ''}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="hackathon">Hackathon</option>
                      <option value="fest">Fest</option>
                      <option value="cultural">Cultural</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Report with AI
                </>
              )}
            </button>
          </div>
        )}

        {/* Generated Report */}
        {generatedReport && (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {generatedReport.reportType.replace('_', ' ').toUpperCase()} REPORT
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Generated: {new Date(generatedReport.generatedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={downloadReport}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Report
                </button>
              </div>

              {/* AI Insights */}
              {generatedReport.insights && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-600" />
                    AI-Generated Insights
                  </h3>
                  <div className="text-gray-700 whitespace-pre-wrap">{generatedReport.insights}</div>
                </div>
              )}
            </div>

            {/* Report Data */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6">Report Data</h3>
              
              {/* Student Performance Report */}
              {generatedReport.reportType === 'student_performance' && generatedReport.data && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Students</p>
                      <p className="text-4xl font-bold text-blue-600">{generatedReport.data.totalStudents}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Active Students</p>
                      <p className="text-4xl font-bold text-green-600">{generatedReport.data.activeStudents}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Inactive Students</p>
                      <p className="text-4xl font-bold text-red-600">{generatedReport.data.inactiveStudents}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Engagement Rate</p>
                      <p className="text-4xl font-bold text-purple-600">
                        {Math.round((generatedReport.data.activeStudents / generatedReport.data.totalStudents) * 100)}%
                      </p>
                    </div>
                  </div>

                  {generatedReport.data.studentsByDepartment && (
                    <div>
                      <h4 className="font-bold text-lg mb-4">Students by Department</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(generatedReport.data.studentsByDepartment).map(([dept, count]) => (
                          <div key={dept} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="font-semibold text-gray-800">{dept}</p>
                            <p className="text-2xl font-bold text-blue-600">{count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Event Analytics Report */}
              {generatedReport.reportType === 'event_analytics' && generatedReport.data && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Events</p>
                      <p className="text-4xl font-bold text-purple-600">{generatedReport.data.totalEvents}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Participants</p>
                      <p className="text-4xl font-bold text-blue-600">{generatedReport.data.totalParticipants}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Avg Participants</p>
                      <p className="text-4xl font-bold text-green-600">{generatedReport.data.avgParticipantsPerEvent}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Upcoming Events</p>
                      <p className="text-4xl font-bold text-orange-600">{generatedReport.data.upcomingEvents}</p>
                    </div>
                  </div>

                  {generatedReport.data.eventsByType && (
                    <div>
                      <h4 className="font-bold text-lg mb-4">Events by Type</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(generatedReport.data.eventsByType).map(([type, count]) => (
                          <div key={type} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="font-semibold text-gray-800 capitalize">{type}</p>
                            <p className="text-2xl font-bold text-purple-600">{count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resource Utilization Report */}
              {generatedReport.reportType === 'resource_utilization' && generatedReport.data && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-green-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Materials</p>
                      <p className="text-4xl font-bold text-green-600">{generatedReport.data.totalMaterials}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Downloads</p>
                      <p className="text-4xl font-bold text-blue-600">{generatedReport.data.totalDownloads}</p>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Likes</p>
                      <p className="text-4xl font-bold text-pink-600">{generatedReport.data.totalLikes}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Bookings</p>
                      <p className="text-4xl font-bold text-purple-600">{generatedReport.data.totalBookings}</p>
                    </div>
                  </div>

                  {generatedReport.data.materialsByType && (
                    <div>
                      <h4 className="font-bold text-lg mb-4">Materials by Type</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(generatedReport.data.materialsByType).map(([type, count]) => (
                          <div key={type} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="font-semibold text-gray-800 capitalize">{type}</p>
                            <p className="text-2xl font-bold text-green-600">{count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Engagement Metrics Report */}
              {generatedReport.reportType === 'engagement_metrics' && generatedReport.data && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-orange-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Users</p>
                      <p className="text-4xl font-bold text-orange-600">{generatedReport.data.totalUsers}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Active Users</p>
                      <p className="text-4xl font-bold text-green-600">{generatedReport.data.activeUsers}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Helpdesk Queries</p>
                      <p className="text-4xl font-bold text-blue-600">{generatedReport.data.totalHelpdeskQueries}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Resolved Queries</p>
                      <p className="text-4xl font-bold text-purple-600">{generatedReport.data.resolvedQueries}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Overview Report */}
              {generatedReport.reportType === 'overview' && generatedReport.data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Students</p>
                    <p className="text-4xl font-bold text-blue-600">{generatedReport.data.totalStudents}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6 text-center">
                    <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Events</p>
                    <p className="text-4xl font-bold text-purple-600">{generatedReport.data.totalEvents}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Materials</p>
                    <p className="text-4xl font-bold text-green-600">{generatedReport.data.totalMaterials}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-6 text-center">
                    <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Assignments</p>
                    <p className="text-4xl font-bold text-orange-600">{generatedReport.data.totalAssignments}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedReportType && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Select a Report Type</h3>
            <p className="text-gray-600">
              Choose a report type above to generate comprehensive analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportGenerator;
