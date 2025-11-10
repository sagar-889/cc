import React, { useEffect, useState } from 'react';
import { MapPin, Search, Navigation as NavigationIcon, Building } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { navigationAPI } from '../utils/api';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Navigation = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default center

  useEffect(() => {
    fetchLocations();
  }, [filterType]);

  const fetchLocations = async () => {
    try {
      const response = await navigationAPI.getAll({ type: filterType });
      setLocations(response.data.locations);
      
      if (response.data.locations.length > 0) {
        const firstLocation = response.data.locations[0];
        setMapCenter([firstLocation.coordinates.lat, firstLocation.coordinates.lng]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.block.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setMapCenter([location.coordinates.lat, location.coordinates.lng]);
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
          <MapPin className="mr-3 text-primary-600" size={32} />
          Campus Navigation
        </h1>
        <p className="text-gray-600 mt-1">Find your way around campus</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search locations..."
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
            <option value="building">Building</option>
            <option value="lab">Lab</option>
            <option value="classroom">Classroom</option>
            <option value="office">Office</option>
            <option value="facility">Facility</option>
            <option value="landmark">Landmark</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Locations List */}
        <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
          {filteredLocations.map((location) => (
            <div
              key={location._id}
              onClick={() => handleLocationClick(location)}
              className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${
                selectedLocation?._id === location._id ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {location.type === 'building' ? <Building size={20} className="text-primary-600" /> :
                   location.type === 'lab' ? <NavigationIcon size={20} className="text-primary-600" /> :
                   <MapPin size={20} className="text-primary-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.block}</p>
                  {location.roomNumber && (
                    <p className="text-xs text-gray-500">Room {location.roomNumber}</p>
                  )}
                  <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                    location.type === 'building' ? 'bg-blue-100 text-blue-700' :
                    location.type === 'lab' ? 'bg-green-100 text-green-700' :
                    location.type === 'facility' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {location.type}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredLocations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MapPin size={48} className="mx-auto mb-4 opacity-50" />
              <p>No locations found</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[600px]">
            <MapContainer
              center={mapCenter}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredLocations.map((location) => (
                <Marker
                  key={location._id}
                  position={[location.coordinates.lat, location.coordinates.lng]}
                  eventHandlers={{
                    click: () => handleLocationClick(location)
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{location.name}</h3>
                      <p className="text-sm text-gray-600">{location.block}</p>
                      {location.description && (
                        <p className="text-xs text-gray-500 mt-1">{location.description}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Location Details */}
          {selectedLocation && (
            <div className="mt-4 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedLocation.name}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium capitalize">{selectedLocation.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Block</p>
                  <p className="font-medium">{selectedLocation.block}</p>
                </div>
                {selectedLocation.floor && (
                  <div>
                    <p className="text-sm text-gray-500">Floor</p>
                    <p className="font-medium">{selectedLocation.floor}</p>
                  </div>
                )}
                {selectedLocation.roomNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Room</p>
                    <p className="font-medium">{selectedLocation.roomNumber}</p>
                  </div>
                )}
              </div>

              {selectedLocation.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{selectedLocation.description}</p>
                </div>
              )}

              {selectedLocation.facilities && selectedLocation.facilities.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocation.facilities.map((facility, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedLocation.openingHours && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Opening Hours</p>
                  <p className="text-gray-700">Weekdays: {selectedLocation.openingHours.weekdays}</p>
                  {selectedLocation.openingHours.weekends && (
                    <p className="text-gray-700">Weekends: {selectedLocation.openingHours.weekends}</p>
                  )}
                </div>
              )}

              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`, '_blank')}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <NavigationIcon size={18} className="mr-2" />
                Get Directions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
