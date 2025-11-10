import React, { useState } from 'react';
import { X, Download, Eye, FileText, Video, File, ExternalLink, BookOpen, FileImage, Image } from 'lucide-react';

const MaterialViewer = ({ material, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !material) return null;

  const handleDownload = async () => {
    setLoading(true);
    try {
      // For files stored on server (uploads/materials/...)
      if (material.fileUrl?.startsWith('/uploads/')) {
        const link = document.createElement('a');
        link.href = `${process.env.REACT_APP_API_URL}${material.fileUrl}`;
        link.download = material.fileName || material.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For external URLs (Google Drive, etc.)
        window.open(material.fileUrl, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => {
    if (material.fileUrl?.startsWith('/uploads/')) {
      // For server files, open in new tab
      window.open(`${process.env.REACT_APP_API_URL}${material.fileUrl}`, '_blank');
    } else {
      // For external URLs, open in new tab
      window.open(material.fileUrl, '_blank');
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText size={48} className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText size={48} className="text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText size={48} className="text-orange-500" />;
      case 'image':
        return <Image size={48} className="text-green-500" />;
      case 'video':
        return <Video size={48} className="text-purple-500" />;
      case 'book':
        return <BookOpen size={48} className="text-indigo-500" />;
      default:
        return <File size={48} className="text-gray-500" />;
    }
  };

  const canPreview = (fileType) => {
    return ['pdf', 'image'].includes(fileType);
  };

  const getFileTypeDisplayName = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
        return 'Word Document';
      case 'docx':
        return 'Word Document';
      case 'ppt':
        return 'PowerPoint Presentation';
      case 'pptx':
        return 'PowerPoint Presentation';
      case 'image':
        return 'Image File';
      case 'video':
        return 'Video File';
      case 'book':
        return 'E-Book';
      default:
        return 'Document';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            {getFileIcon(material.fileType)}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{material.title}</h2>
              <p className="text-sm text-gray-600">{material.course?.name || 'Course'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {material.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{material.description}</p>
            </div>
          )}

          {/* Material Preview/Actions */}
          <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Material</h3>
              <p className="text-sm text-gray-600 mb-2">
                {getFileTypeDisplayName(material.fileType)}
              </p>
              <p className="text-xs text-gray-500">
                File: {material.fileName || material.title}
                {material.fileSize && (
                  <span className="ml-2">({(material.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {canPreview(material.fileType) && (
                <button
                  onClick={handleView}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye size={20} className="mr-2" />
                  View Material
                </button>
              )}

              <button
                onClick={handleDownload}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Download size={20} className="mr-2" />
                {loading ? 'Downloading...' : 'Download File'}
              </button>

              {material.fileUrl && !material.fileUrl.startsWith('/uploads/') && (
                <button
                  onClick={() => window.open(material.fileUrl, '_blank')}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <ExternalLink size={20} className="mr-2" />
                  Open Externally
                </button>
              )}
            </div>

            {!canPreview(material.fileType) && (
              <p className="text-sm text-gray-500 mt-4 text-center max-w-md">
                This file type will be downloaded for viewing in your default application.
                <br />
                <span className="font-medium">Supported preview types:</span> PDF, Images
              </p>
            )}
          </div>

          {/* Material Details */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Category:</span>
              <p className="text-gray-600 capitalize">{material.category}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">File Type:</span>
              <p className="text-gray-600 capitalize">{material.fileType}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Uploaded by:</span>
              <p className="text-gray-600">{material.uploadedBy?.name || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Downloads:</span>
              <p className="text-gray-600">{material.downloads || 0}</p>
            </div>
          </div>

          {/* Tags */}
          {material.tags && material.tags.length > 0 && (
            <div className="mt-4">
              <span className="font-medium text-gray-700">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {material.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialViewer;
