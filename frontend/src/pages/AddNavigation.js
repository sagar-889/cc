import React, { useState } from 'react';
import { MapPin, Navigation, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const AddNavigation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'building',
    coordinates: {
      lat: '',
      lng: ''
    },
    floor: '',
    roomNumber: '',
    directions: '',
    accessibility: '',
    openingHours: '',
    contactInfo: '',
    imageUrl: ''
  });

  const categories = [
    'building',
    'classroom',
    'lab',
    'library',
    'cafeteria',
    'hostel',
    'sports',
    'parking',
    'office',
    'other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      setFormData({
        ...formData,
        coordinates: {
          ...formData.coordinates,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      
      const navigationData = {
        ...formData,
        coordinates: {
          lat: parseFloat(formData.coordinates.lat),
          lng: parseFloat(formData.coordinates.lng)
        }
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/navigation`,
        navigationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Navigation point added successfully!');
      navigate('/manage-navigation');
    } catch (error) {
      console.error('Error adding navigation:', error);
      toast.error(error.response?.data?.message || 'Failed to add navigation point');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/manage-navigation')}
            className="p-2 hover:bg-dark-card rounded-lg transition-all card-3d text-text-primary"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center">
              <MapPin className="mr-3 text-pastel-green" size={32} />
              Add Navigation Point
            </h1>
            <p className="text-text-secondary mt-1">Add a new location to campus navigation</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-dark-lighter rounded-xl shadow-3d p-8 card-3d border border-dark-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Location Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
                placeholder="e.g., Main Building, Library"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
              placeholder="Describe the location..."
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                name="lat"
                value={formData.coordinates.lat}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
                placeholder="e.g., 17.1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                name="lng"
                value={formData.coordinates.lng}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
                placeholder="e.g., 78.5678"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Floor
              </label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
                placeholder="e.g., Ground Floor, 2nd Floor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Room Number
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
                placeholder="e.g., A-101"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Directions
            </label>
            <textarea
              name="directions"
              value={formData.directions}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
              placeholder="How to reach this location..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Accessibility Features
              </label>
              <input
                type="text"
                name="accessibility"
                value={formData.accessibility}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
                placeholder="e.g., Wheelchair accessible, Elevator"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Opening Hours
              </label>
              <input
                type="text"
                name="openingHours"
                value={formData.openingHours}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
                placeholder="e.g., 9 AM - 5 PM"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Contact Information
              </label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
                placeholder="Phone or email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-card border border-dark-card rounded-lg focus:ring-2 focus:ring-pastel-green focus:border-transparent text-text-primary transition-all"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/manage-navigation')}
              className="px-6 py-3 bg-dark-card text-text-secondary rounded-lg hover:bg-opacity-80 transition-all card-3d"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-pastel-green to-pastel-yellow text-white rounded-lg hover:shadow-glow-green transition-all disabled:opacity-50 disabled:cursor-not-allowed card-3d flex items-center"
            >
              <Save className="mr-2" size={20} />
              {loading ? 'Adding...' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNavigation;
