const jwt = require('jsonwebtoken');

exports.signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.sendTokenResponse = (user, statusCode, res) => {
  const token = exports.signToken(user._id);

  const cookieExpiresDays = parseInt(process.env.JWT_COOKIE_EXPIRES_DAYS, 10) || 7;
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true, // not accessible via client-side JS -> mitigates XSS token theft
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  user.emailVerifyToken = undefined;
  user.passwordResetToken = undefined;

  res.status(statusCode).json({
    success: true,
    token, // also returned in body for clients that prefer Authorization header (e.g. mobile apps)
    data: { user },
  });
};
