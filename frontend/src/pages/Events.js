import React, { useEffect, useState } from 'react';
import { Sparkles, Search, Calendar, MapPin, Users, ExternalLink } from 'lucide-react';
import { eventAPI } from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [filterType, filterStatus]);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getAll({ type: filterType, status: filterStatus });
      setEvents(response.data.events);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await eventAPI.register(eventId);
      toast.success('Successfully registered for event');
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  const handleUnregister = async (eventId) => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) return;
    
    try {
      await eventAPI.unregister(eventId);
      toast.success('Successfully unregistered from event');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to unregister');
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventTypeColor = (type) => {
    const colors = {
      workshop: 'bg-blue-100 text-blue-700',
      seminar: 'bg-green-100 text-green-700',
      hackathon: 'bg-purple-100 text-purple-700',
      fest: 'bg-pink-100 text-pink-700',
      club: 'bg-orange-100 text-orange-700',
      sports: 'bg-red-100 text-red-700',
      cultural: 'bg-yellow-100 text-yellow-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <Sparkles className="mr-3 text-primary-600" size={32} />
          Campus Events
        </h1>
        <p className="text-gray-600 mt-1">Discover and join campus activities</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="hackathon">Hackathon</option>
            <option value="fest">Fest</option>
            <option value="club">Club</option>
            <option value="sports">Sports</option>
            <option value="cultural">Cultural</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {event.poster && (
              <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
                <Sparkles size={48} className="text-white opacity-50" />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                  {event.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                  event.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {event.status}
                </span>
              </div>

              <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-2 flex-shrink-0" />
                  <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users size={16} className="mr-2 flex-shrink-0" />
                  <span>By {event.organizer}</span>
                </div>
              </div>

              {event.maxParticipants && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Participants</span>
                    <span>{event.participants?.length || 0}/{event.maxParticipants}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${((event.participants?.length || 0) / event.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Details
                </button>
                {event.status === 'upcoming' && (
                  <button
                    onClick={() => handleRegister(event._id)}
                    disabled={event.maxParticipants && event.participants?.length >= event.maxParticipants}
                    className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
          <p>No events found</p>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(selectedEvent.type)}`}>
                    {selectedEvent.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedEvent.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                    selectedEvent.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedEvent.status}
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Start Date</h3>
                  <p className="text-gray-600">{format(new Date(selectedEvent.startDate), 'PPP')}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">End Date</h3>
                  <p className="text-gray-600">{format(new Date(selectedEvent.endDate), 'PPP')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Location</h3>
                <p className="text-gray-600">{selectedEvent.location}</p>
                {selectedEvent.venue && (
                  <p className="text-sm text-gray-500">{selectedEvent.venue}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-1">Organized By</h3>
                <p className="text-gray-600">{selectedEvent.organizer}</p>
              </div>

              {selectedEvent.contactEmail && (
                <div>
                  <h3 className="font-semibold mb-1">Contact</h3>
                  <p className="text-gray-600">{selectedEvent.contactEmail}</p>
                  {selectedEvent.contactPhone && (
                    <p className="text-gray-600">{selectedEvent.contactPhone}</p>
                  )}
                </div>
              )}

              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.maxParticipants && (
                <div>
                  <h3 className="font-semibold mb-2">Registration Status</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Participants</span>
                    <span>{selectedEvent.participants?.length || 0}/{selectedEvent.maxParticipants}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full"
                      style={{ width: `${((selectedEvent.participants?.length || 0) / selectedEvent.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {selectedEvent.registrationLink && (
                <a
                  href={selectedEvent.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink size={18} className="mr-2" />
                  External Registration Link
                </a>
              )}
            </div>

            {selectedEvent.status === 'upcoming' && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    handleRegister(selectedEvent._id);
                    setSelectedEvent(null);
                  }}
                  disabled={selectedEvent.maxParticipants && selectedEvent.participants?.length >= selectedEvent.maxParticipants}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedEvent.maxParticipants && selectedEvent.participants?.length >= selectedEvent.maxParticipants
                    ? 'Event Full'
                    : 'Register for Event'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
