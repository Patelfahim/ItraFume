const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError");

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const MAX_IMAGE_SIZE =
  (parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 8) * 1024 * 1024;
const MAX_VIDEO_SIZE =
  (parseInt(process.env.MAX_VIDEO_SIZE_MB, 10) || 50) * 1024 * 1024;

const makeCloudinaryStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `itrafume/${folder}`,
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "avif",
        "mp4",
        "webm",
        "mov",
      ],
      resource_type: (req, file) => {
        return file.mimetype.startsWith("video") ? "video" : "image";
      },
      public_id: (req, file) => {
        const name = file.originalname
          .replace(/\.[^.]+$/, "")
          .replace(/[^a-z0-9]/gi, "-")
          .toLowerCase();
        return `${Date.now()}-${name}`;
      },
    },
  });

const fileFilter = (req, file, cb) => {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
  if (!isImage && !isVideo) {
    return cb(
      new AppError(
        "Unsupported file type. Only JPEG/PNG/WebP images and MP4/WebM videos are allowed.",
        400,
      ),
      false,
    );
  }
  file.__mediaType = isImage ? "image" : "video";
  cb(null, true);
};

const buildUploader = (folder) =>
  multer({
    storage: makeCloudinaryStorage(folder),
    fileFilter,
    limits: { fileSize: Math.max(MAX_IMAGE_SIZE, MAX_VIDEO_SIZE), files: 10 },
  });

exports.uploadProductMedia = buildUploader("products").array("media", 10);
exports.uploadReviewMedia = buildUploader("reviews").array("media", 5);
exports.uploadAvatar = buildUploader("avatars").single("avatar");

exports.enforceSizeLimits = (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (files.length === 0) return next();
  for (const file of files) {
    const cap = file.__mediaType === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > cap) {
      const cleanupPromises = files.map((f) => {
        if (f.filename) {
          return cloudinary.uploader
            .destroy(f.filename, {
              resource_type: f.__mediaType === "video" ? "video" : "image",
            })
            .catch(() => {});
        }
        return Promise.resolve();
      });
      Promise.all(cleanupPromises).catch(() => {});
      return next(
        new AppError(
          `${file.originalname} exceeds the maximum allowed size for ${file.__mediaType}s (${Math.round(
            cap / (1024 * 1024),
          )}MB).`,
          400,
        ),
      );
    }
  }
  next();
};
