import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Search, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const ManageNavigation = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'building', 'classroom', 'lab', 'library', 'cafeteria', 'hostel', 'sports', 'parking', 'office', 'other'];

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [searchTerm, selectedCategory, locations]);

  const fetchLocations = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/navigation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocations(response.data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const filterLocations = () => {
    let filtered = locations;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(loc => loc.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLocations(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      await axios.delete(`${process.env.REACT_APP_API_URL}/navigation/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      building: 'bg-pastel-purple',
      classroom: 'bg-pastel-green',
      lab: 'bg-pastel-yellow',
      library: 'bg-pastel-pink',
      cafeteria: 'bg-pastel-green',
      hostel: 'bg-pastel-purple',
      sports: 'bg-pastel-yellow',
      parking: 'bg-pastel-pink',
      office: 'bg-pastel-purple',
      other: 'bg-dark-card'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pastel-green border-t-transparent shadow-glow-green"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-pastel-green rounded-full opacity-20 animate-ping"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center">
            <Map className="mr-3 text-pastel-green" size={32} />
            Manage Navigation & Places
          </h1>
          <p className="text-text-secondary mt-1">Add, edit, and manage campus locations</p>
        </div>
        <button
          onClick={() => navigate('/add-navigation')}
          className="px-6 py-3 bg-gradient-to-r from-pastel-green to-pastel-yellow text-white rounded-lg hover:shadow-glow-green transition-all card-3d flex items-center"
        >
          <Plus className="mr-2" size={20} />
          Add Location
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-dark-lighter rounded-xl shadow-3d p-6 card-3d border border-dark-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search locations..."
              className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-lighter rounded-xl shadow-3d p-6 card-3d border border-dark-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Locations</p>
              <p className="text-3xl font-bold text-text-primary mt-2">{locations.length}</p>
            </div>
            <MapPin className="text-pastel-green" size={32} />
          </div>
        </div>
        <div className="bg-dark-lighter rounded-xl shadow-3d p-6 card-3d border border-dark-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Buildings</p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {locations.filter(l => l.category === 'building').length}
              </p>
            </div>
            <MapPin className="text-pastel-purple" size={32} />
          </div>
        </div>
        <div className="bg-dark-lighter rounded-xl shadow-3d p-6 card-3d border border-dark-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Classrooms</p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {locations.filter(l => l.category === 'classroom').length}
              </p>
            </div>
            <MapPin className="text-pastel-yellow" size={32} />
          </div>
        </div>
        <div className="bg-dark-lighter rounded-xl shadow-3d p-6 card-3d border border-dark-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Other Places</p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {locations.filter(l => !['building', 'classroom'].includes(l.category)).length}
              </p>
            </div>
            <MapPin className="text-pastel-pink" size={32} />
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      {filteredLocations.length === 0 ? (
        <div className="bg-dark-lighter rounded-xl shadow-3d p-12 text-center card-3d border border-dark-card">
          <MapPin className="mx-auto text-text-secondary mb-4" size={48} />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No locations found</h3>
          <p className="text-text-secondary mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Start by adding your first location'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={() => navigate('/add-navigation')}
              className="px-6 py-3 bg-gradient-to-r from-pastel-green to-pastel-yellow text-white rounded-lg hover:shadow-glow-green transition-all card-3d inline-flex items-center"
            >
              <Plus className="mr-2" size={20} />
              Add First Location
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <div
              key={location._id}
              className="bg-dark-lighter rounded-xl shadow-3d p-6 card-3d border border-dark-card hover:shadow-glow-green transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${getCategoryColor(location.category)} rounded-lg flex items-center justify-center`}>
                    <MapPin className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{location.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(location.category)} bg-opacity-20 text-text-primary mt-1`}>
                      {location.category}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                {location.description}
              </p>

              <div className="space-y-2 mb-4">
                {location.floor && (
                  <p className="text-text-secondary text-sm">
                    <span className="font-medium">Floor:</span> {location.floor}
                  </p>
                )}
                {location.roomNumber && (
                  <p className="text-text-secondary text-sm">
                    <span className="font-medium">Room:</span> {location.roomNumber}
                  </p>
                )}
                <p className="text-text-secondary text-sm">
                  <span className="font-medium">Coordinates:</span> {location.coordinates?.lat}, {location.coordinates?.lng}
                </p>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-dark-card">
                <button
                  onClick={() => navigate(`/edit-navigation/${location._id}`)}
                  className="flex-1 px-4 py-2 bg-pastel-yellow bg-opacity-20 text-pastel-yellow rounded-lg hover:bg-opacity-30 transition-all card-3d flex items-center justify-center"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(location._id, location.name)}
                  className="flex-1 px-4 py-2 bg-pastel-pink bg-opacity-20 text-pastel-pink rounded-lg hover:bg-opacity-30 transition-all card-3d flex items-center justify-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageNavigation;
