const express = require('express');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { uploadAvatar, enforceSizeLimits } = require('../middleware/upload');

const router = express.Router();

router.patch(
  '/avatar',
  protect,
  uploadAvatar,
  enforceSizeLimits,
  catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const url = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: url }, { new: true });
    res.status(200).json({ success: true, data: { user } });
  })
);

module.exports = router;
