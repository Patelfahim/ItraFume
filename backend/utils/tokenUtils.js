const jwt = require("jsonwebtoken");

exports.signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

exports.sendTokenResponse = (user, statusCode, res) => {
  const token = exports.signToken(user._id);

  const cookieExpiresDays =
    parseInt(process.env.JWT_COOKIE_EXPIRES_DAYS, 10) || 7;

  const cookieOptions = {
    path: "/",
    expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // Mobile browsers frequently require Secure + SameSite=None when frontend/backend are on different origins.
    secure:
      process.env.NODE_ENV === "production" ||
      process.env.COOKIE_SECURE === "true",
    sameSite:
      process.env.NODE_ENV === "production" ||
      process.env.COOKIE_SAMESITE_NONE === "true"
        ? "None"
        : "Lax",
  };

  // Return cookie options so controllers can clear the cookie consistently
  // (res.clearCookie requires the same attributes that were used when setting it).
  exports.jwtCookieOptions = cookieOptions;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  user.emailVerifyToken = undefined;
  user.passwordResetToken = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user },
  });
};
