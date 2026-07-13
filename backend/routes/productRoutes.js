const express = require('express');
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadProductMedia, uploadReviewMedia, enforceSizeLimits } = require('../middleware/upload');
const { reviewRules, productRules, handleValidation } = require('../middleware/validate');

const router = express.Router();

// Public
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/featured', productController.getFeatured);
router.get('/:slug', productController.getProductBySlug);

// Reviews nested under a product (by productId, not slug, to keep IDs stable)
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post(
  '/:productId/reviews',
  protect,
  uploadReviewMedia,
  enforceSizeLimits,
  reviewRules,
  handleValidation,
  reviewController.createReview
);

// Admin product management
router.post(
  '/',
  protect,
  restrictTo('admin'),
  uploadProductMedia,
  enforceSizeLimits,
  productRules,
  handleValidation,
  productController.createProduct
);
router.patch('/:id', protect, restrictTo('admin'), uploadProductMedia, enforceSizeLimits, productController.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), productController.deleteProduct);

module.exports = router;
