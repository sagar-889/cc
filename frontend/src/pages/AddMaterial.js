import React, { useState, useEffect } from 'react';
import { FileText, Upload, BookOpen, Tag, Link as LinkIcon, HardDrive } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AddMaterial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    type: 'notes',
    fileUrl: '',
    tags: ''
  });

  const materialTypes = [
    { value: 'notes', label: 'Lecture Notes' },
    { value: 'slides', label: 'Presentation Slides' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'reference', label: 'Reference Material' },
    { value: 'book', label: 'E-Book' },
    { value: 'video', label: 'Video Tutorial' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error('Failed to load courses');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                           'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                           'text/plain', 'image/jpeg', 'image/png', 'image/gif'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, TXT, and images are allowed.');
        return;
      }
      
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '') // Remove extension
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;

      if (uploadMethod === 'file') {
        // Upload file from PC
        if (!selectedFile) {
          toast.error('Please select a file to upload');
          setLoading(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('file', selectedFile);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('course', formData.course);
        formDataToSend.append('category', formData.type);
        formDataToSend.append('tags', JSON.stringify(formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []));

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/materials/upload`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        toast.success('Material uploaded successfully!');
        navigate('/materials');
      } else {
        // Upload with URL
        const materialData = {
          ...formData,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
        };

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/materials`,
          materialData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success('Material uploaded successfully!');
        navigate('/materials');
      }
    } catch (error) {
      console.error('Upload material error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-3">
          <Upload size={40} />
          <div>
            <h1 className="text-3xl font-bold">Upload Study Material</h1>
            <p className="text-purple-100 mt-1">Share resources with your peers</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-2 text-primary-600" size={24} />
              Material Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Chapter 5 - Data Structures Notes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description of the material content..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course *
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a course...</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {materialTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* File Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <LinkIcon className="mr-2 text-primary-600" size={24} />
              File Details
            </h2>

            {/* Upload Method Toggle */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  uploadMethod === 'url'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <LinkIcon className="inline-block mr-2" size={20} />
                Upload via URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  uploadMethod === 'file'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <HardDrive className="inline-block mr-2" size={20} />
                Upload from PC
              </button>
            </div>

            {uploadMethod === 'url' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File URL *
                  </label>
                  <input
                    type="url"
                    name="fileUrl"
                    value={formData.fileUrl}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://drive.google.com/... or https://dropbox.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your file to Google Drive, Dropbox, or any cloud storage and paste the shareable link here
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📌 How to share files:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Google Drive:</strong> Upload → Right-click → Share → Copy link → Set to "Anyone with the link"</li>
                    <li>• <strong>Dropbox:</strong> Upload → Share → Create link → Copy link</li>
                    <li>• <strong>OneDrive:</strong> Upload → Share → Copy link</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="mx-auto mb-2 text-gray-400" size={40} />
                        <p className="text-sm font-medium text-gray-700">
                          {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, DOCX, PPT, PPTX, TXT, or Images (Max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <FileText className="mr-2" size={16} />
                      <span>File selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">✓ Direct Upload Benefits:</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Faster access for students</li>
                    <li>• No external dependencies</li>
                    <li>• Better privacy control</li>
                    <li>• Automatic file type detection</li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Tag className="mr-2 text-primary-600" size={24} />
              Tags (Optional)
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., algorithms, sorting, exam-prep (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add tags to help others find this material (separate with commas)
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/materials')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterial;
