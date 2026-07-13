const mongoose = require('mongoose');

const reviewMediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // used to verify purchase
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 120, trim: true },
    comment: { type: String, required: true, maxlength: 2000, trim: true },
    media: [reviewMediaSchema], // photos/videos uploaded with the review
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    adminReply: {
      message: { type: String },
      repliedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Recalculate product rating stats after save/remove
reviewSchema.statics.recalcRatings = async function (productId) {
  const Product = mongoose.model('Product');
  const stats = await this.aggregate([
    { $match: { product: productId, status: 'approved' } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating,
      ratingsCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { ratingsAverage: 0, ratingsCount: 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.recalcRatings(this.product);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) doc.constructor.recalcRatings(doc.product);
});

module.exports = mongoose.model('Review', reviewSchema);
