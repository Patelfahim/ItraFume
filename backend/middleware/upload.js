const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AppError = require('../utils/AppError');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const MAX_IMAGE_SIZE = (parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 8) * 1024 * 1024;
const MAX_VIDEO_SIZE = (parseInt(process.env.MAX_VIDEO_SIZE_MB, 10) || 50) * 1024 * 1024;

const makeStorage = (subfolder) => {
  const dest = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(
        file.originalname
      ).toLowerCase()}`;
      cb(null, uniqueName);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
  if (!isImage && !isVideo) {
    return cb(new AppError('Unsupported file type. Only JPEG/PNG/WebP images and MP4/WebM videos are allowed.', 400), false);
  }
  // Attach a computed max size per-file; enforced again after upload in controller as a safety net
  file.__mediaType = isImage ? 'image' : 'video';
  cb(null, true);
};

const buildUploader = (subfolder) =>
  multer({
    storage: makeStorage(subfolder),
    fileFilter,
    limits: { fileSize: Math.max(MAX_IMAGE_SIZE, MAX_VIDEO_SIZE), files: 10 },
  });

exports.uploadProductMedia = buildUploader('products').array('media', 10);
exports.uploadReviewMedia = buildUploader('reviews').array('media', 5);
exports.uploadAvatar = buildUploader('avatars').single('avatar');

// Post-upload validation: enforce per-type size limits since multer's `limits.fileSize`
// applies uniformly; we check actual size against the correct cap per file type.
exports.enforceSizeLimits = (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  for (const file of req.files) {
    const cap = file.__mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > cap) {
      // Clean up all uploaded files in this request on failure
      req.files.forEach((f) => {
        fs.unlink(f.path, () => {});
      });
      return next(
        new AppError(
          `${file.originalname} exceeds the maximum allowed size for ${file.__mediaType}s (${Math.round(
            cap / (1024 * 1024)
          )}MB).`,
          400
        )
      );
    }
  }
  next();
};
