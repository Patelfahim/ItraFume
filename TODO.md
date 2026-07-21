# Product Media Fixes - TODO

## The Problem

- Media URLs stored as `/uploads/products/xxx.jpg` (local paths) instead of Cloudinary URLs
- Backend had NO `express.static` middleware for `/uploads` directory
- Render has ephemeral storage — files disappear on restart/redeploy
- Seed data uses `/media/` paths that weren't being served from backend
- No error handling for broken/missing images on frontend

## ✅ Completed

### Backend Changes

- [x] **Step 1: `backend/server.js`** — Added `express.static` serving for both `/uploads` and `/media/` paths so backend serves local media files
- [x] **Step 2: `backend/controllers/productController.js`** — Added debug logging for `createProduct` and `updateProduct` to log what `file.path` returns from Cloudinary uploads
- [x] **Step 3: `backend/scripts/migrateMediaToCloudinary.js`** — Created migration script to upload local files to Cloudinary and update DB records

### Frontend Changes

- [x] **Step 4a: `ProductDetail.jsx`** — Added:
  - `normalizeMediaUrl` now handles `/media/` paths too
  - `brokenMedia` state to track which media items failed to load
  - `onError` handlers on all `img`/`video` elements
  - Graceful fallback UI showing "Image unavailable" for broken media
  - Added `FiImage` icon import

- [x] **Step 4b: `ProductCard.jsx`** — Added:
  - `normalizeMediaUrl` now handles `/media/` paths too
  - `imgError` state with fallback placeholder
  - `onError` handler for product card images

- [x] **Step 4c: `AdminProducts.jsx`** — Added:
  - `/media/` path handling in media URL construction
  - `onError` handler on admin table images

- [x] **Step 4d: `ReviewSection.jsx`** — Added:
  - `normalizeMediaUrl` function for review media
  - Normalized URLs in review media thumbnails and lightbox
  - Added `FiImage` icon import

### Key Root Cause Fix

The **root cause** of "media disappears after some time" is that **Render uses ephemeral storage** — any files uploaded to `backend/uploads/` get wiped on every deploy/restart. The `multer-storage-cloudinary` middleware should be uploading to Cloudinary and returning a Cloudinary URL in `file.path`. If Cloudinary credentials are not configured correctly, it falls back to local storage.

**Next step for you:** Run the migration script on your Render backend to push existing local files to Cloudinary:

```
node scripts/migrateMediaToCloudinary.js
```
