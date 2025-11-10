const express = require('express');
const router = express.Router();
const Helpdesk = require('../models/Helpdesk');
const { auth } = require('../middleware/auth');

// Get all questions
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const questions = await Helpdesk.find(query)
      .populate('askedBy', 'name')
      .populate('answers.user', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions',
      error: error.message
    });
  }
});

// Get single question
router.get('/:id', auth, async (req, res) => {
  try {
    const question = await Helpdesk.findById(req.params.id)
      .populate('askedBy', 'name email')
      .populate('answers.user', 'name email')
      .populate('relatedCourse', 'code name');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Increment views
    question.views += 1;
    await question.save();

    res.json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question',
      error: error.message
    });
  }
});

// Ask a question
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags, relatedCourse } = req.body;

    const question = new Helpdesk({
      title,
      content,
      category,
      tags,
      relatedCourse,
      askedBy: req.userId
    });

    await question.save();
    await question.populate('askedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Question posted successfully',
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to post question',
      error: error.message
    });
  }
});

// Answer a question
router.post('/:id/answer', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Helpdesk.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    question.answers.push({
      user: req.userId,
      content
    });

    if (question.status === 'open') {
      question.status = 'answered';
    }

    await question.save();
    await question.populate('answers.user', 'name');

    res.json({
      success: true,
      message: 'Answer posted successfully',
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to post answer',
      error: error.message
    });
  }
});

// Upvote question
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const question = await Helpdesk.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const upvoteIndex = question.upvotes.indexOf(req.userId);

    if (upvoteIndex > -1) {
      question.upvotes.splice(upvoteIndex, 1);
    } else {
      question.upvotes.push(req.userId);
    }

    await question.save();

    res.json({
      success: true,
      message: upvoteIndex > -1 ? 'Upvote removed' : 'Question upvoted',
      upvotes: question.upvotes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upvote',
      error: error.message
    });
  }
});

// Upvote answer
router.post('/:questionId/answer/:answerId/upvote', auth, async (req, res) => {
  try {
    const question = await Helpdesk.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const answer = question.answers.id(req.params.answerId);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    const upvoteIndex = answer.upvotes.indexOf(req.userId);

    if (upvoteIndex > -1) {
      answer.upvotes.splice(upvoteIndex, 1);
    } else {
      answer.upvotes.push(req.userId);
    }

    await question.save();

    res.json({
      success: true,
      message: upvoteIndex > -1 ? 'Upvote removed' : 'Answer upvoted',
      upvotes: answer.upvotes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upvote answer',
      error: error.message
    });
  }
});

// Accept answer
router.post('/:questionId/answer/:answerId/accept', auth, async (req, res) => {
  try {
    const question = await Helpdesk.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (question.askedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the question author can accept answers'
      });
    }

    // Remove previous accepted answer
    question.answers.forEach(ans => {
      ans.isAccepted = false;
    });

    const answer = question.answers.id(req.params.answerId);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    answer.isAccepted = true;
    question.status = 'closed';

    await question.save();

    res.json({
      success: true,
      message: 'Answer accepted',
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to accept answer',
      error: error.message
    });
  }
});

module.exports = router;
