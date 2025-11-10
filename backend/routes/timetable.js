const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { auth } = require('../middleware/auth');

// Get user's timetable
router.get('/', auth, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ user: req.userId })
      .populate('entries.course', 'code name');

    if (!timetable) {
      return res.json({
        success: true,
        timetable: null,
        message: 'No timetable found'
      });
    }

    res.json({
      success: true,
      timetable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable',
      error: error.message
    });
  }
});

// Create or update timetable
router.post('/', auth, async (req, res) => {
  try {
    const { semester, year, entries } = req.body;

    let timetable = await Timetable.findOne({ user: req.userId });

    if (timetable) {
      timetable.semester = semester;
      timetable.year = year;
      timetable.entries = entries;
    } else {
      timetable = new Timetable({
        user: req.userId,
        semester,
        year,
        entries
      });
    }

    // Detect clashes
    const clashes = timetable.detectClashes();

    await timetable.save();

    await timetable.populate('entries.course', 'code name');

    res.json({
      success: true,
      message: 'Timetable saved successfully',
      timetable,
      clashes: clashes.length > 0 ? clashes : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save timetable',
      error: error.message
    });
  }
});

// Add entry to timetable
router.post('/entry', auth, async (req, res) => {
  try {
    const { day, startTime, endTime, course, room, type } = req.body;

    let timetable = await Timetable.findOne({ user: req.userId });

    // Auto-create timetable if it doesn't exist
    if (!timetable) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const semester = currentMonth >= 6 ? 1 : 2; // July-Dec = Semester 1, Jan-June = Semester 2
      
      timetable = new Timetable({
        user: req.userId,
        semester: semester,
        year: currentYear,
        entries: []
      });
    }

    timetable.entries.push({
      day,
      startTime,
      endTime,
      course,
      room,
      type
    });

    const clashes = timetable.detectClashes();
    await timetable.save();

    await timetable.populate('entries.course', 'code name');

    res.json({
      success: true,
      message: 'Entry added successfully',
      timetable,
      clashes: clashes.length > 0 ? clashes : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add entry',
      error: error.message
    });
  }
});

// Delete entry from timetable
router.delete('/entry/:entryId', auth, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ user: req.userId });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    timetable.entries = timetable.entries.filter(
      entry => entry._id.toString() !== req.params.entryId
    );

    timetable.detectClashes();
    await timetable.save();

    res.json({
      success: true,
      message: 'Entry deleted successfully',
      timetable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete entry',
      error: error.message
    });
  }
});

// Check for clashes
router.get('/clashes', auth, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ user: req.userId })
      .populate('entries.course', 'code name');

    if (!timetable) {
      return res.json({
        success: true,
        clashes: []
      });
    }

    const clashes = timetable.detectClashes();

    res.json({
      success: true,
      clashes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check clashes',
      error: error.message
    });
  }
});

module.exports = router;
