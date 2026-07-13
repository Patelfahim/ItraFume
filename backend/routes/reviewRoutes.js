const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadReviewMedia, enforceSizeLimits } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.patch('/:id', uploadReviewMedia, enforceSizeLimits, reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.patch('/:id/helpful', reviewController.toggleHelpful);

router.patch('/:id/reply', restrictTo('admin'), reviewController.adminReplyToReview);
router.patch('/:id/moderate', restrictTo('admin'), reviewController.moderateReview);

module.exports = router;
