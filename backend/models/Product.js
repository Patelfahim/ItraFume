const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    thumbnail: { type: String }, // for videos, optional poster frame
    alt: { type: String, default: "" },
  },
  { _id: false },
);

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true }, // e.g. "10ml", "50ml"
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, trim: true },
  },
  { _id: true },
);

const bespokeCustomizationSchema = new mongoose.Schema(
  {
    topNotes: [{ type: String }],
    middleNotes: [{ type: String }],
    baseNotes: [{ type: String }],
    concentration: { type: String },
    intensity: { type: String, enum: ["light", "moderate", "intense"] },
    occasion: { type: String },
    budgetRange: { type: String },
    additionalInfo: { type: String },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    shortDescription: { type: String, maxlength: 300 },
    description: { type: String, required: true },
    brand: { type: String, default: "ItraFume" },
    category: { type: String, required: true, index: true }, // e.g. Attar, Oud, Roll-On, Floral, Bespoke
    fragranceNotes: {
      top: [{ type: String }],
      middle: [{ type: String }],
      base: [{ type: String }],
    },
    concentration: { type: String }, // e.g. "Parfum Oil", "EDP"
    gender: {
      type: String,
      enum: ["unisex", "men", "women"],
      default: "unisex",
    },

    media: [mediaSchema], // images + videos, multimedia gallery
    variants: [variantSchema],

    tags: [{ type: String, index: true }],
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isBespoke: { type: Boolean, default: false }, // Mark as customizable bespoke product
    bespokeCustomization: { type: bespokeCustomizationSchema },
    isActive: { type: Boolean, default: true },

    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (v) => Math.round(v * 10) / 10,
    },
    ratingsCount: { type: Number, default: 0 },

    totalSold: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
  category: "text",
});

// Virtual: lowest price across variants (for card display)
productSchema.virtual("startingPrice").get(function () {
  if (!this.variants || this.variants.length === 0) return 0;
  return Math.min(...this.variants.map((v) => v.price));
});

productSchema.virtual("inStock").get(function () {
  return this.variants.some((v) => v.stock > 0);
});

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

module.exports = mongoose.model("Product", productSchema);
