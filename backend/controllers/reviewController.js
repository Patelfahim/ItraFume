const fs = require('fs');
const path = require('path');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getProductReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, results: reviews.length, data: { reviews } });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found.', 404));

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) {
    return next(new AppError('You have already reviewed this product. You can edit your existing review.', 400));
  }

  const purchaseOrder = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    isPaid: true,
  }).sort({ createdAt: -1 });

  const media = (req.files || []).map((file) => ({
    type: file.__mediaType,
    url: `/uploads/reviews/${file.filename}`,
  }));

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: purchaseOrder ? purchaseOrder._id : undefined,
    rating,
    title,
    comment,
    media,
    isVerifiedPurchase: !!purchaseOrder,
  });

  const populated = await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, data: { review: populated } });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found.', 404));

  if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You can only edit your own review.', 403));
  }

  const { rating, title, comment, removeMedia } = req.body;
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment) review.comment = comment;

  if (req.files && req.files.length > 0) {
    const newMedia = req.files.map((file) => ({
      type: file.__mediaType,
      url: `/uploads/reviews/${file.filename}`,
    }));
    review.media.push(...newMedia);
  }

  if (removeMedia) {
    const toRemove = typeof removeMedia === 'string' ? JSON.parse(removeMedia) : removeMedia;
    review.media = review.media.filter((m) => !toRemove.includes(m.url));
    toRemove.forEach((url) => {
      const filePath = path.join(__dirname, '..', url.replace(/^\/uploads/, 'uploads'));
      fs.unlink(filePath, () => {});
    });
  }

  await review.save();
  res.status(200).json({ success: true, data: { review } });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found.', 404));

  if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own review.', 403));
  }

  review.media.forEach((m) => {
    const filePath = path.join(__dirname, '..', m.url.replace(/^\/uploads/, 'uploads'));
    fs.unlink(filePath, () => {});
  });

  await Review.findOneAndDelete({ _id: review._id });
  res.status(200).json({ success: true, message: 'Review deleted.' });
});

exports.toggleHelpful = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found.', 404));

  const alreadyVoted = review.votedBy.some((id) => String(id) === String(req.user._id));
  if (alreadyVoted) {
    review.votedBy = review.votedBy.filter((id) => String(id) !== String(req.user._id));
    review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
  } else {
    review.votedBy.push(req.user._id);
    review.helpfulVotes += 1;
  }
  await review.save();
  res.status(200).json({ success: true, data: { helpfulVotes: review.helpfulVotes, voted: !alreadyVoted } });
});

// ---------- ADMIN MODERATION ----------

exports.adminReplyToReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found.', 404));

  review.adminReply = { message: req.body.message, repliedAt: new Date() };
  await review.save();
  res.status(200).json({ success: true, data: { review } });
});

exports.moderateReview = catchAsync(async (req, res, next) => {
  const { status } = req.body; // 'approved' | 'rejected' | 'pending'
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!review) return next(new AppError('Review not found.', 404));

  await Review.recalcRatings(review.product);
  res.status(200).json({ success: true, data: { review } });
});

exports.getAllReviewsAdmin = catchAsync(async (req, res) => {
  const reviews = await Review.find()
    .populate('user', 'name email')
    .populate('product', 'name slug')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, results: reviews.length, data: { reviews } });
});
