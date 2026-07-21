/**
 * Media Migration Script
 *
 * This script finds all products with local /uploads/ URLs and uploads
 * the local files to Cloudinary, then updates the DB with the new Cloudinary URLs.
 *
 * Usage: node scripts/migrateMediaToCloudinary.js
 *
 * Prerequisites:
 * - Cloudinary credentials must be set in .env
 * - Run this from the backend directory on Render (or wherever the uploads exist locally)
 */

require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");
const connectDB = require("../config/db");
const Product = require("../models/Product");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

async function uploadToCloudinary(filePath, folder) {
  const ext = path.extname(filePath).toLowerCase();
  const isVideo = [".mp4", ".webm", ".mov"].includes(ext);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: `itrafume/${folder}`,
        resource_type: isVideo ? "video" : "image",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      },
    );
  });
}

async function migrate() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    const products = await Product.find({
      "media.url": { $regex: "^/uploads/" },
    });
    console.log(
      `📦 Found ${products.length} products with local /uploads/ URLs`,
    );

    let totalUpdated = 0;

    for (const product of products) {
      let changed = false;

      const updatedMedia = await Promise.all(
        product.media.map(async (m) => {
          if (!m.url || !m.url.startsWith("/uploads/")) return m;

          // Determine the folder: products, reviews, etc.
          const urlParts = m.url.replace(/^\/uploads\//, "").split("/");
          const folder = urlParts[0]; // e.g. "products"
          const relativePath = urlParts.slice(1).join("/");
          const fullPath = path.join(UPLOADS_DIR, folder, relativePath);

          if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️  File not found locally: ${fullPath} — skipping`);
            return m;
          }

          try {
            console.log(`  ⬆️  Uploading ${fullPath} to Cloudinary...`);
            const cloudinaryUrl = await uploadToCloudinary(fullPath, folder);
            console.log(`  ✅ Uploaded: ${cloudinaryUrl}`);
            changed = true;
            return { ...m.toObject(), url: cloudinaryUrl };
          } catch (err) {
            console.error(`  ❌ Failed to upload ${fullPath}: ${err.message}`);
            return m;
          }
        }),
      );

      if (changed) {
        product.media = updatedMedia;
        await product.save();
        totalUpdated++;
        console.log(`  ✅ Updated product: ${product.name} (${product._id})`);
      }
    }

    console.log(`\n🎉 Migration complete! Updated ${totalUpdated} products.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
