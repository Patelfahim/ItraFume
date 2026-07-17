const crypto = require("crypto");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendTokenResponse } = require("../utils/tokenUtils");
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../utils/sendEmail");

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return next(
      new AppError("An account with this email already exists.", 400),
    );
  }

  const user = await User.create({ name, email, password, phone });

  const verifyToken = user.createEmailVerifyToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  // Do not block registration on email delivery.
  try {
    void sendWelcomeEmail(user, verifyUrl).catch((err) => {
      console.error("Failed to send welcome email:", err.message);
    });
  } catch (err) {
    console.error("Welcome email init failed:", err.message);
  }

  sendTokenResponse(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password.", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password +failedLoginAttempts +lockUntil",
  );

  if (!user) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  if (user.isLocked) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return next(
      new AppError(
        `Account temporarily locked due to multiple failed attempts. Try again in ${minutesLeft} minute(s).`,
        423,
      ),
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.registerFailedLogin();
    return next(new AppError("Incorrect email or password.", 401));
  }

  if (!user.isActive) {
    return next(
      new AppError("This account has been deactivated. Contact support.", 403),
    );
  }

  await user.resetFailedLogins();
  sendTokenResponse(user, 200, res);
});

const { jwtCookieOptions } = require("../utils/tokenUtils");

exports.logout = (req, res) => {
  // Properly clear cookie.
  // NOTE: clearCookie needs matching cookie attributes.
  res.clearCookie("jwt", jwtCookieOptions);
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true },
  );
  res.status(200).json({ success: true, data: { user } });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError("Your current password is incorrect.", 401));
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });
  // Always respond success-like message to avoid leaking which emails are registered
  const genericMessage =
    "If an account with that email exists, a password reset link has been sent.";

  if (!user) {
    return res.status(200).json({ success: true, message: genericMessage });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Do not block password reset request on email delivery.
  try {
    void sendPasswordResetEmail(user, resetUrl).catch(async (err) => {
      console.error("Password reset email failed:", err.message);
      // In case email sending fails, invalidate tokens to be safe.
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    });
  } catch (err) {
    console.error("Password reset email init failed:", err.message);
  }

  return res.status(200).json({ success: true, message: genericMessage });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired.", 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Verification link is invalid or has expired.", 400),
    );
  }

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json({ success: true, message: "Email verified successfully." });
});
