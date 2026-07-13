const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

const baseWrapper = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f0eded;font-family:'Manrope',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0eded;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#fcf9f8;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#00030a;padding:28px 32px;text-align:center;">
              <span style="font-family:Georgia,'Playfair Display',serif;color:#fed488;font-size:26px;letter-spacing:2px;">ITRAFUME</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#1b1b1c;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#eae7e7;text-align:center;color:#44474d;font-size:12px;">
              &copy; ${new Date().getFullYear()} ItraFume. All rights reserved.<br/>
              This is an automated message, please do not reply directly to this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * sendEmail({ to, subject, html, text })
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text: text || undefined,
  };
  return getTransporter().sendMail(mailOptions);
};

exports.sendEmail = sendEmail;

exports.sendWelcomeEmail = (user, verifyUrl) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to ItraFume — Verify your email',
    html: baseWrapper(
      'Welcome to ItraFume',
      `<h2 style="font-family:Georgia,serif;">Welcome, ${user.name}!</h2>
      <p style="line-height:1.6;">Thank you for joining ItraFume, home of bespoke artisanal perfume oils. Please verify your email to activate your account.</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${verifyUrl}" style="background:#00030a;color:#fed488;padding:14px 28px;text-decoration:none;border-radius:4px;font-weight:600;letter-spacing:1px;display:inline-block;">VERIFY EMAIL</a>
      </p>
      <p style="font-size:13px;color:#75777e;">If the button doesn't work, copy and paste this link into your browser:<br/>${verifyUrl}</p>`
    ),
  });

exports.sendPasswordResetEmail = (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: 'ItraFume — Password Reset Request',
    html: baseWrapper(
      'Password Reset',
      `<h2 style="font-family:Georgia,serif;">Reset your password</h2>
      <p style="line-height:1.6;">We received a request to reset the password for your ItraFume account. This link is valid for 30 minutes.</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${resetUrl}" style="background:#00030a;color:#fed488;padding:14px 28px;text-decoration:none;border-radius:4px;font-weight:600;letter-spacing:1px;display:inline-block;">RESET PASSWORD</a>
      </p>
      <p style="font-size:13px;color:#75777e;">If you didn't request this, you can safely ignore this email.</p>`
    ),
  });

exports.sendOrderConfirmationEmail = (user, order) => {
  const itemsHtml = order.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e5e2e1;">${it.name} (${it.size}) &times; ${it.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e2e1;text-align:right;">₹${(it.price * it.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return sendEmail({
    to: user.email,
    subject: `ItraFume Order Confirmed — #${order.orderNumber}`,
    html: baseWrapper(
      'Order Confirmation',
      `<h2 style="font-family:Georgia,serif;">Thank you for your order, ${user.name}!</h2>
      <p style="line-height:1.6;">Your order <strong>#${order.orderNumber}</strong> has been confirmed and is being prepared.</p>
      <table width="100%" style="margin:20px 0;border-collapse:collapse;">
        ${itemsHtml}
        <tr><td style="padding-top:12px;font-weight:700;">Total</td><td style="padding-top:12px;text-align:right;font-weight:700;">₹${order.totalPrice.toFixed(2)}</td></tr>
      </table>
      <p style="line-height:1.6;">Shipping to: ${order.shippingAddress.fullName}, ${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
      <p style="line-height:1.6;">We'll notify you again once your order ships.</p>`
    ),
  });
};

exports.sendOrderStatusUpdateEmail = (user, order) =>
  sendEmail({
    to: user.email,
    subject: `Your ItraFume order #${order.orderNumber} is now ${order.orderStatus}`,
    html: baseWrapper(
      'Order Update',
      `<h2 style="font-family:Georgia,serif;">Order Status Update</h2>
      <p style="line-height:1.6;">Hi ${user.name}, your order <strong>#${order.orderNumber}</strong> status has changed to: <strong>${order.orderStatus.toUpperCase()}</strong>.</p>
      ${order.trackingNumber ? `<p>Tracking number: <strong>${order.trackingNumber}</strong></p>` : ''}`
    ),
  });
