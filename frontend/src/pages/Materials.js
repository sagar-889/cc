import React, { useEffect, useState } from 'react';
import { FileText, Upload, Search, Download, Heart, Trash2, FileIcon, Eye } from 'lucide-react';
import { materialAPI, courseAPI } from '../utils/api';
import toast from 'react-hot-toast';
import MaterialViewer from '../components/MaterialViewer';

const Materials = () => {
  const [materials, setMaterials] = useState([
    // Sample material for testing
    {
      _id: '1',
      title: 'Sample Material',
      description: 'This is a sample material to test the interface',
      course: { code: 'CS101', name: 'Computer Science' },
      uploadedBy: { name: 'Test User' },
      fileType: 'pdf',
      category: 'notes',
      fileSize: 1024000,
      likes: [],
      downloads: 5,
      createdAt: new Date().toISOString()
    }
  ]);
  const [courses, setCourses] = useState([
    { _id: '1', code: 'CS101', name: 'Computer Science' }
  ]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    course: '',
    category: 'notes',
    file: null
  });
  
  // Get user from auth store
  const user = JSON.parse(localStorage.getItem('auth-storage'))?.state?.user || { role: 'student' };
  const isAdminOrFaculty = user?.role === 'admin' || user?.role === 'faculty';

  // Material viewer state
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showMaterialViewer, setShowMaterialViewer] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterCourse, filterCategory]);

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching materials and courses...');
      const [materialsRes, coursesRes] = await Promise.all([
        materialAPI.getAll({ course: filterCourse, category: filterCategory }),
        courseAPI.getEnrolled()
      ]);

      console.log('✅ Materials loaded:', materialsRes.data.materials?.length || 0);
      console.log('✅ Courses loaded:', coursesRes.data.courses?.length || 0);

      // Only update if we get real data
      if (materialsRes.data.materials && materialsRes.data.materials.length > 0) {
        setMaterials(materialsRes.data.materials);
      }
      if (coursesRes.data.courses && coursesRes.data.courses.length > 0) {
        setCourses(coursesRes.data.courses);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load materials');
      // Keep sample data on error
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadData.file) {
      toast.error('Please select a file');
      return;
    }
    
    if (!uploadData.title) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!uploadData.course) {
      toast.error('Please select a course');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description || '');
    formData.append('course', uploadData.course);
    formData.append('category', uploadData.category);

    try {
      await materialAPI.upload(formData);
      toast.success('Material uploaded successfully');
      setShowUploadModal(false);
      setUploadData({
        title: '',
        description: '',
        course: '',
        category: 'notes',
        file: null
      });
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload material';
      toast.error(errorMessage);
    }
  };

  const handleLike = async (id) => {
    try {
      await materialAPI.like(id);
      fetchData();
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await materialAPI.download(id);
      window.open(response.data.fileUrl, '_blank');
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const handleView = (material) => {
    setSelectedMaterial(material);
    setShowMaterialViewer(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await materialAPI.delete(id);
      toast.success('Material deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (fileType) => {
    return <FileIcon size={40} className="text-primary-600" />;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-3 text-primary-600" size={32} />
            Study Materials
          </h1>
          <p className="text-gray-600 mt-1">Access and share study resources</p>
        </div>
        {isAdminOrFaculty && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload size={20} className="mr-2" />
            Upload Material
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.code}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            <option value="notes">Notes</option>
            <option value="assignment">Assignment</option>
            <option value="syllabus">Syllabus</option>
            <option value="reference">Reference</option>
            <option value="past-paper">Past Paper</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div key={material._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              {getFileIcon(material.fileType)}
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                material.category === 'notes' ? 'bg-blue-100 text-blue-700' :
                material.category === 'assignment' ? 'bg-green-100 text-green-700' :
                material.category === 'syllabus' ? 'bg-purple-100 text-purple-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {material.category}
              </span>
            </div>

            <h3 className="font-bold text-lg mb-2 line-clamp-2">{material.title}</h3>
            
            {material.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{material.course?.code}</span>
              <span>{(material.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>By {material.uploadedBy?.name}</span>
              <span className="flex items-center">
                <Heart size={14} className="mr-1" />
                {material.likes?.length || 0}
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleView(material)}
                className="flex-1 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <Eye size={16} className="mr-1" />
                View
              </button>
              <button
                onClick={() => handleDownload(material._id)}
                className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <Download size={16} className="mr-1" />
                Download
              </button>
              {isAdminOrFaculty && (
                <button
                  onClick={() => handleDelete(material._id)}
                  className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p>No materials found</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">Upload Material</h2>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Chapter 5 Notes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                <select
                  value={uploadData.course}
                  onChange={(e) => setUploadData({ ...uploadData, course: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="notes">Notes</option>
                  <option value="assignment">Assignment</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="reference">Reference</option>
                  <option value="past-paper">Past Paper</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                <input
                  type="file"
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                  required
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 10MB</p>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Viewer Modal */}
      <MaterialViewer
        material={selectedMaterial}
        isOpen={showMaterialViewer}
        onClose={() => {
          setShowMaterialViewer(false);
          setSelectedMaterial(null);
        }}
      />
    </div>
  );
};

export default Materials;
