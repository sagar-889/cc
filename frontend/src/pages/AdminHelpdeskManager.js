import React, { useState, useEffect } from 'react';
import { Ticket, Sparkles, AlertCircle, CheckCircle, Clock, Zap, Filter, MessageSquare } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminHelpdeskManager = () => {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [processedResult, setProcessedResult] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [generatedResponse, setGeneratedResponse] = useState('');

  const getToken = () => {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/helpdesk`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setTickets(response.data.questions || []);
    } catch (error) {
      console.error('Fetch tickets error:', error);
    }
  };

  const autoProcessTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/agentic/helpdesk/auto-process`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setProcessedResult(response.data);
        toast.success(response.data.message);
        fetchTickets();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process tickets');
    } finally {
      setLoading(false);
    }
  };

  const generateResponse = async (ticket) => {
    setLoading(true);
    setSelectedTicket(ticket);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/agentic/helpdesk/generate-response`,
        {
          ticketId: ticket._id,
          question: ticket.question
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (response.data.success) {
        setGeneratedResponse(response.data.suggestedResponse);
        toast.success('Response generated!');
      }
    } catch (error) {
      toast.error('Failed to generate response');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getCategoryIcon = (category) => {
    return '📁';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <Ticket className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Helpdesk Ticket Management</h1>
              <p className="text-purple-100 text-lg">
                AI-powered ticket categorization, prioritization, and routing
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={autoProcessTickets}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                Auto-Process All Tickets
              </>
            )}
          </button>

          <button
            onClick={fetchTickets}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-2xl transition-all flex items-center justify-center gap-2"
          >
            <Filter className="w-6 h-6" />
            Refresh Tickets
          </button>

          <div className="bg-white rounded-xl p-4 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-3xl font-bold text-purple-600">{tickets.length}</p>
            </div>
          </div>
        </div>

        {/* Processed Result */}
        {processedResult && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-green-600 flex items-center gap-2">
              <CheckCircle className="w-8 h-8" />
              Processing Complete!
            </h3>
            <div className="space-y-3">
              {processedResult.processed?.map((item, idx) => (
                <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Ticket #{item.ticketId}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {item.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          → {item.routeTo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6">All Helpdesk Tickets ({tickets.length})</h3>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-lg text-gray-800">{ticket.studentName}</h4>
                      {ticket.category && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {getCategoryIcon(ticket.category)} {ticket.category}
                        </span>
                      )}
                      {ticket.priority && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{ticket.question}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(ticket.createdAt).toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => generateResponse(ticket)}
                    disabled={loading}
                    className="ml-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Generate Response
                  </button>
                </div>

                {selectedTicket?._id === ticket._id && generatedResponse && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mt-4">
                    <h5 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI-Generated Response:
                    </h5>
                    <p className="text-gray-700 whitespace-pre-wrap">{generatedResponse}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedResponse);
                        toast.success('Response copied to clipboard!');
                      }}
                      className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all"
                    >
                      Copy Response
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {tickets.length === 0 && (
            <div className="text-center py-12">
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Tickets Found</h3>
              <p className="text-gray-600">All helpdesk tickets have been resolved!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHelpdeskManager;
