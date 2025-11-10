const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');
const { isAdminOrFaculty } = require('../middleware/checkRole');
const aiService = require('../utils/aiService');

// Get all courses (public access)
router.get('/', async (req, res) => {
  try {
    const { department, semester, search } = req.query;
    
    let query = {};
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('faculty', 'name email department')
      .sort({ code: 1 });

    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

// Get single course
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'name email department designation')
      .populate('enrolledStudents', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
});

// Create new course (Admin/Faculty only)
router.post('/', auth, isAdminOrFaculty, async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      credits,
      department,
      semester,
      year,
      instructor,
      difficulty,
      maxStudents,
      prerequisites,
      syllabus
    } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    // Create new course
    const course = new Course({
      code: code.toUpperCase(),
      name,
      description,
      credits,
      department,
      semester: semester || 'Fall',
      year: year || new Date().getFullYear(),
      faculty: instructor || null,
      difficulty: difficulty || 'intermediate',
      maxStudents: maxStudents || 60,
      prerequisites: prerequisites || [],
      syllabus: syllabus || ''
    });

    await course.save();

    // Populate faculty details
    await course.populate('faculty', 'name email department designation');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
});

// Get course recommendations
router.get('/recommend/me', auth, async (req, res) => {
  try {
    const user = req.user;
    const courses = await Course.find({
      semester: user.semester,
      department: user.department
    }).limit(20);

    const recommendations = await aiService.recommendCourses(
      {
        interests: user.interests,
        department: user.department,
        semester: user.semester
      },
      courses
    );

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Enroll in course
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.enrolledStudents.includes(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }

    course.enrolledStudents.push(req.userId);
    await course.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to enroll',
      error: error.message
    });
  }
});

// Unenroll from course
router.post('/:id/unenroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== req.userId.toString()
    );

    await course.save();

    res.json({
      success: true,
      message: 'Successfully unenrolled from course',
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unenroll',
      error: error.message
    });
  }
});

// Get enrolled courses
router.get('/enrolled/me', auth, async (req, res) => {
  try {
    const courses = await Course.find({
      enrolledStudents: req.userId
    }).populate('faculty', 'name email');

    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses',
      error: error.message
    });
  }
});

module.exports = router;
