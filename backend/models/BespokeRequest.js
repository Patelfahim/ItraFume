const mongoose = require("mongoose");

const bespokeRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    // Fragrance Preferences
    preferredTopNotes: [{ type: String }],
    preferredMiddleNotes: [{ type: String }],
    preferredBaseNotes: [{ type: String }],
    concentration: { type: String }, // e.g., "Eau de Parfum", "Parfum Oil"
    intensity: {
      type: String,
      enum: ["light", "moderate", "intense"],
      default: "moderate",
    },

    // Occasion & Use
    occasion: { type: String }, // e.g., "Daily Wear", "Evening", "Office", "Special Event"
    gender: {
      type: String,
      enum: ["men", "women", "unisex"],
      default: "unisex",
    },

    // Budget
    budgetRange: { type: String }, // e.g., "500-1000", "1000-2000", "2000+"
    quantity: { type: String, default: "10ml" },

    // Additional Info
    allergies: { type: String },
    additionalRequirements: { type: String },

    // Status & Tracking
    status: {
      type: String,
      enum: [
        "pending",
        "in-review",
        "approved",
        "in-production",
        "completed",
        "rejected",
      ],
      default: "pending",
    },
    adminNotes: { type: String },

    // Timeline
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    estimatedDelivery: { type: Date },

    // Linking to Order (optional)
    linkedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    linkedProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("BespokeRequest", bespokeRequestSchema);
