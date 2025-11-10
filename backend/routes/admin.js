const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Material = require('../models/Material');
const Event = require('../models/Event');
const Faculty = require('../models/Faculty');
const Navigation = require('../models/Navigation');
const advancedAI = require('../utils/advancedAI');
const { auth } = require('../middleware/auth');
const { isAdmin, isAdminOrFaculty } = require('../middleware/checkRole');

// ==================== DASHBOARD STATISTICS ====================

// Get admin dashboard statistics
router.get('/dashboard/stats', auth, isAdmin, async (req, res) => {
  try {
    // Get counts
    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalCourses,
      totalMaterials,
      totalEvents,
      activeEvents
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Faculty.countDocuments(),
      Course.countDocuments(),
      Material.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ status: 'upcoming' })
    ]);

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get students by year
    const studentsByYear = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get students by department
    const studentsByDepartment = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get course enrollment stats
    const courseStats = await Course.aggregate([
      {
        $project: {
          name: 1,
          code: 1,
          enrolledCount: { $size: '$enrolledStudents' },
          maxStudents: 1
        }
      },
      { $sort: { enrolledCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: {
        overview: {
          totalUsers,
          totalStudents,
          totalFaculty,
          totalCourses,
          totalMaterials,
          totalEvents,
          activeEvents,
          recentUsers
        },
        studentsByYear,
        studentsByDepartment,
        topCourses: courseStats
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users with filters
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const { role, department, year, search, page = 1, limit = 20 } = req.query;

    let query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (year) query.year = parseInt(year);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get user details
router.get('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's enrolled courses
    const enrolledCourses = await Course.find({
      enrolledStudents: user._id
    }).select('code name credits');

    res.json({
      success: true,
      user,
      enrolledCourses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
});

// Update user
router.put('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { name, email, role, department, year, semester } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, year, semester },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove user from enrolled courses
    await Course.updateMany(
      { enrolledStudents: user._id },
      { $pull: { enrolledStudents: user._id } }
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// ==================== COURSE MANAGEMENT ====================

// Get all courses (admin view with more details)
router.get('/courses', auth, isAdminOrFaculty, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('faculty', 'name email department')
      .populate('enrolledStudents', 'name email studentId')
      .sort({ createdAt: -1 });

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

// Update course
router.put('/courses/:id', auth, isAdminOrFaculty, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('faculty', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
});

// Delete course
router.delete('/courses/:id', auth, isAdmin, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete related materials
    await Material.deleteMany({ course: course._id });

    res.json({
      success: true,
      message: 'Course and related materials deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
});

// ==================== MATERIAL MANAGEMENT ====================

// Get all materials
router.get('/materials', auth, isAdminOrFaculty, async (req, res) => {
  try {
    const materials = await Material.find()
      .populate('course', 'code name')
      .populate('uploadedBy', 'name email')
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

// Delete material
router.delete('/materials/:id', auth, isAdminOrFaculty, async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // TODO: Delete file from storage

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

// ==================== EVENT MANAGEMENT ====================

// Get all events
router.get('/events', auth, isAdminOrFaculty, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .populate('registeredStudents', 'name email studentId')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

// Update event
router.put('/events/:id', auth, isAdminOrFaculty, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
});

// Delete event
router.delete('/events/:id', auth, isAdminOrFaculty, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
});

// ==================== FACULTY MANAGEMENT ====================

// Create faculty
router.post('/faculty', auth, isAdmin, async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    await faculty.save();

    res.status(201).json({
      success: true,
      message: 'Faculty added successfully',
      faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add faculty',
      error: error.message
    });
  }
});

// Update faculty
router.put('/faculty/:id', auth, isAdmin, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty updated successfully',
      faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update faculty',
      error: error.message
    });
  }
});

// Delete faculty
router.delete('/faculty/:id', auth, isAdmin, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete faculty',
      error: error.message
    });
  }
});

// ==================== ADMIN AI ASSISTANT ====================

// AI-powered insights and recommendations for admin
router.post('/ai/insights', auth, isAdmin, async (req, res) => {
  try {
    // Get current statistics
    const stats = await getAdminStats();

    const query = `As an admin AI assistant, analyze this campus data and provide insights:

**Statistics:**
- Total Students: ${stats.totalStudents}
- Total Courses: ${stats.totalCourses}
- Total Materials: ${stats.totalMaterials}
- Active Events: ${stats.activeEvents}
- Recent Users (7 days): ${stats.recentUsers}

**Students by Department:**
${stats.studentsByDepartment.map(d => `- ${d._id}: ${d.count} students`).join('\n')}

**Top Enrolled Courses:**
${stats.topCourses.map(c => `- ${c.code}: ${c.enrolledCount}/${c.maxStudents} students`).join('\n')}

Provide:
1. Key insights and trends
2. Recommendations for improvement
3. Potential issues to address
4. Growth opportunities`;

    const insights = await advancedAI.chat(query, req.userId, { role: 'admin' });

    res.json({
      success: true,
      insights,
      stats
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
});

// AI-powered report generation
router.post('/ai/generate-report', auth, isAdmin, async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;

    const stats = await getAdminStats();

    const query = `Generate a comprehensive ${reportType} report for the period ${startDate} to ${endDate}.

Include:
1. Executive Summary
2. Key Metrics and Statistics
3. Trends and Analysis
4. Recommendations
5. Action Items

Current Data:
- Students: ${stats.totalStudents}
- Courses: ${stats.totalCourses}
- Materials: ${stats.totalMaterials}
- Events: ${stats.totalEvents}`;

    const report = await advancedAI.chat(query, req.userId, { role: 'admin' });

    res.json({
      success: true,
      report,
      reportType,
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
});

// AI-powered content suggestions
router.post('/ai/content-suggestions', auth, isAdmin, async (req, res) => {
  try {
    const { contentType } = req.body; // 'course', 'event', 'material'

    const stats = await getAdminStats();

    const query = `Based on current campus data, suggest new ${contentType}s that would benefit students:

Current Offerings:
- Departments: ${stats.studentsByDepartment.map(d => d._id).join(', ')}
- Total Students: ${stats.totalStudents}
- Current Courses: ${stats.totalCourses}

Provide 5 specific suggestions with:
1. Title/Name
2. Description
3. Target audience
4. Expected benefits
5. Implementation priority`;

    const suggestions = await advancedAI.chat(query, req.userId, { role: 'admin' });

    res.json({
      success: true,
      suggestions,
      contentType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate suggestions',
      error: error.message
    });
  }
});

// AI-powered student engagement analysis
router.post('/ai/engagement-analysis', auth, isAdmin, async (req, res) => {
  try {
    const stats = await getAdminStats();

    const query = `Analyze student engagement based on this data:

**Enrollment Statistics:**
${stats.topCourses.map(c => `- ${c.code}: ${c.enrolledCount}/${c.maxStudents} (${Math.round(c.enrolledCount/c.maxStudents*100)}% full)`).join('\n')}

**Department Distribution:**
${stats.studentsByDepartment.map(d => `- ${d._id}: ${d.count} students`).join('\n')}

**Recent Activity:**
- New users (7 days): ${stats.recentUsers}

Provide:
1. Engagement level assessment
2. Departments with low engagement
3. Strategies to improve engagement
4. Recommended interventions`;

    const analysis = await advancedAI.chat(query, req.userId, { role: 'admin' });

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to analyze engagement',
      error: error.message
    });
  }
});

// Helper function to get admin stats
async function getAdminStats() {
  const [
    totalUsers,
    totalStudents,
    totalCourses,
    totalMaterials,
    totalEvents,
    activeEvents,
    recentUsers,
    studentsByDepartment,
    courseStats
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    Course.countDocuments(),
    Material.countDocuments(),
    Event.countDocuments(),
    Event.countDocuments({ status: 'upcoming' }),
    User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),
    User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Course.aggregate([
      {
        $project: {
          name: 1,
          code: 1,
          enrolledCount: { $size: '$enrolledStudents' },
          maxStudents: 1
        }
      },
      { $sort: { enrolledCount: -1 } },
      { $limit: 10 }
    ])
  ]);

  return {
    totalUsers,
    totalStudents,
    totalCourses,
    totalMaterials,
    totalEvents,
    activeEvents,
    recentUsers,
    studentsByDepartment,
    topCourses: courseStats
  };
}

module.exports = router;