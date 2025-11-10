const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const { auth } = require('../middleware/auth');
const { isAdminOrFaculty } = require('../middleware/checkRole');
const upload = require('../middleware/upload');
const aiService = require('../utils/aiService');
const path = require('path');
const fs = require('fs');
// Get all materials
router.get('/', auth, async (req, res) => {
  try {
    const { course, category, search } = req.query;

    let query = { isPublic: true };
    if (course) query.course = course;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const materials = await Material.find(query)
      .populate('course', 'code name')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: materials.length,
      materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials',
      error: error.message
    });
  }
});

// Upload material with file from PC - Admin/Faculty only
router.post('/upload', auth, isAdminOrFaculty, (req, res, next) => {
  req.uploadType = 'materials';
  next();
}, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, course, category, tags } = req.body;

    const fileType = path.extname(req.file.originalname).substring(1).toLowerCase();

    const material = new Material({
      title,
      description,
      course,
      category,
      tags: tags ? JSON.parse(tags) : [],
      uploadedBy: req.userId,
      fileUrl: `/uploads/materials/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType
    });

    await material.save();
    await material.populate('course', 'code name');
    await material.populate('uploadedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload material',
      error: error.message
    });
  }
});

// Get single material
router.get('/:id', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('course', 'code name')
      .populate('uploadedBy', 'name email');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    res.json({
      success: true,
      material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch material',
      error: error.message
    });
  }
});

// Like material
router.post('/:id/like', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    const likeIndex = material.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      material.likes.splice(likeIndex, 1);
    } else {
      material.likes.push(req.userId);
    }

    await material.save();

    res.json({
      success: true,
      message: likeIndex > -1 ? 'Like removed' : 'Material liked',
      likes: material.likes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to like material',
      error: error.message
    });
  }
});

// Download material
router.get('/:id/download', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Increment download count
    material.downloads += 1;
    await material.save();

    // Construct file path
    const filePath = path.join(__dirname, '..', material.fileUrl.replace('/uploads', 'uploads'));
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${material.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download material',
      error: error.message
    });
  }
});

// Preview material file (for browser viewing)
router.get('/:id/preview', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Extract filename from fileUrl
    const filename = path.basename(material.fileUrl);
    const filePath = path.join(__dirname, '..', 'uploads', 'materials', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Get file stats and extension
    const stats = fs.statSync(filePath);
    const fileExtension = path.extname(filename).toLowerCase();
    
    // Set content type for preview
    let contentType = 'application/octet-stream';
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.ppt':
        contentType = 'application/vnd.ms-powerpoint';
        break;
      case '.pptx':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${material.fileName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Stream the file for preview
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview material',
      error: error.message
    });
  }
});

// Serve material files directly
router.get('/file/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'materials', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileExtension = path.extname(filename).toLowerCase();
    
    // Set content type based on file extension
    let contentType = 'application/octet-stream';
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.ppt':
        contentType = 'application/vnd.ms-powerpoint';
        break;
      case '.pptx':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case '.doc':
      case '.docx':
        contentType = 'application/msword';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve file',
      error: error.message
    });
  }
});

// Generate summary
router.get('/:id/summary', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    if (material.summary) {
      return res.json({
        success: true,
        summary: material.summary
      });
    }

    // Generate summary using AI
    const summary = await aiService.summarizeText(material.description || material.title);
    material.summary = summary;
    await material.save();

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
      error: error.message
    });
  }
});

// Delete material
router.delete('/:id', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    if (material.uploadedBy.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this material'
      });
    }

    await material.deleteOne();

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete material',
      error: error.message
    });
  }
});

// Download material file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'materials', material.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment download count
    material.downloadCount = (material.downloadCount || 0) + 1;
    await material.save();

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${material.originalName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download material',
      error: error.message
    });
  }
});

// Preview material file
router.get('/:id/preview', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'materials', material.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Get file extension and set appropriate content type
    const ext = path.extname(material.filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.ppt':
        contentType = 'application/vnd.ms-powerpoint';
        break;
      case '.pptx':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${material.originalName}"`);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to preview material',
      error: error.message
    });
  }
});

// Direct file access route (for the URL pattern in your screenshot)
router.get('/file-:filename', auth, async (req, res) => {
  try {
    const filename = 'file-' + req.params.filename;
    const material = await Material.findOne({ filename: filename });
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'materials', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Get file extension and set appropriate content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.ppt':
        contentType = 'application/vnd.ms-powerpoint';
        break;
      case '.pptx':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${material.originalName || filename}"`);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to access file',
      error: error.message
    });
  }
});

module.exports = router;
