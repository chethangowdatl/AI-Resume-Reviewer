const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getUserReviews, getReviewById, deleteReview } = require('../config/db');

// All history routes require authentication
router.use(verifyToken);

/**
 * @route GET /api/history
 * @desc Get user's review history list
 */
router.get('/', async (req, res) => {
  try {
    const reviews = await getUserReviews(req.user.userId);
    return res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error('Fetch history error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch history.' });
  }
});

/**
 * @route GET /api/history/:id
 * @desc Get single detailed review by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const review = await getReviewById(req.params.id, req.user.userId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found in your history.' });
    }
    return res.json({
      success: true,
      data: review
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/history/:id
 * @desc Delete review from history
 */
router.delete('/:id', async (req, res) => {
  try {
    await deleteReview(req.params.id, req.user.userId);
    return res.json({
      success: true,
      message: 'Review removed from history.'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
