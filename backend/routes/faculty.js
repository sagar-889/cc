const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const { auth } = require('../middleware/auth');

// Get all faculty (public access)
router.get('/', async (req, res) => {
  try {
    const { department, search } = req.query;
    
    let query = {};
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { specialization: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const faculty = await Faculty.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: faculty.length,
      faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty',
      error: error.message
    });
  }
});

// Get single faculty
router.get('/:id', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty',
      error: error.message
    });
  }
});

// Get faculty by department
router.get('/department/:dept', auth, async (req, res) => {
  try {
    const faculty = await Faculty.find({
      department: req.params.dept
    }).sort({ name: 1 });

    res.json({
      success: true,
      count: faculty.length,
      faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty',
      error: error.message
    });
  }
});

module.exports = router;
