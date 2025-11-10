import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, Phone, MapPin, Clock, BookOpen } from 'lucide-react';
import { facultyAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  useEffect(() => {
    fetchFaculty();
  }, [filterDept]);

  const fetchFaculty = async () => {
    try {
      const response = await facultyAPI.getAll({ department: filterDept });
      setFaculty(response.data.faculty);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.specialization?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <Users className="mr-3 text-primary-600" size={32} />
          Faculty Directory
        </h1>
        <p className="text-gray-600 mt-1">Connect with faculty members</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Departments</option>
            <option value="Principal">Principal</option>
            <option value="Business Development and Administration">Business Development and Administration</option>
            <option value="Chief Controller">Chief Controller</option>
            <option value="Registrar">Registrar</option>
            <option value="Training and Placement">Training and Placement</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
          </select>
        </div>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((member) => (
          <div key={member._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.designation}</p>
                <p className="text-sm text-primary-600">{member.department}</p>
              </div>
            </div>

            {member.specialization && member.specialization.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">SPECIALIZATION</p>
                <div className="flex flex-wrap gap-1">
                  {member.specialization.slice(0, 2).map((spec, index) => (
                    <span key={index} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded">
                      {spec}
                    </span>
                  ))}
                  {member.specialization.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{member.specialization.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail size={16} className="mr-2 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-2 flex-shrink-0" />
                  <span>{member.phone}</span>
                </div>
              )}
              {member.office && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 flex-shrink-0" />
                  <span>{member.office}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedFaculty(member)}
              className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {filteredFaculty.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>No faculty members found</p>
        </div>
      )}

      {/* Faculty Details Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {selectedFaculty.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedFaculty.name}</h2>
                  <p className="text-gray-600">{selectedFaculty.designation}</p>
                  <p className="text-primary-600">{selectedFaculty.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFaculty(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {selectedFaculty.bio && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-gray-600">{selectedFaculty.bio}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Mail size={18} className="mr-3" />
                    <a href={`mailto:${selectedFaculty.email}`} className="hover:text-primary-600">
                      {selectedFaculty.email}
                    </a>
                  </div>
                  {selectedFaculty.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone size={18} className="mr-3" />
                      <span>{selectedFaculty.phone}</span>
                    </div>
                  )}
                  {selectedFaculty.office && (
                    <div className="flex items-center text-gray-600">
                      <MapPin size={18} className="mr-3" />
                      <span>{selectedFaculty.office}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedFaculty.specialization && selectedFaculty.specialization.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Areas of Specialization</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFaculty.specialization.map((spec, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFaculty.qualifications && selectedFaculty.qualifications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Qualifications</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {selectedFaculty.qualifications.map((qual, index) => (
                      <li key={index}>{qual}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedFaculty.officeHours && selectedFaculty.officeHours.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Clock size={18} className="mr-2" />
                    Office Hours
                  </h3>
                  <div className="space-y-2">
                    {selectedFaculty.officeHours.map((hours, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{hours.day}</span>
                        <span className="text-gray-600">{hours.startTime} - {hours.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFaculty.publications && selectedFaculty.publications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <BookOpen size={18} className="mr-2" />
                    Recent Publications
                  </h3>
                  <div className="space-y-2">
                    {selectedFaculty.publications.map((pub, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{pub.title}</p>
                        <p className="text-sm text-gray-600">{pub.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFaculty.availableForAppointment && (
                <div className="mt-6">
                  <button className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Request Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
