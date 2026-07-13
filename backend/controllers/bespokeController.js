const BespokeRequest = require("../models/BespokeRequest");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendEmail } = require("../utils/sendEmail");

exports.createBespokeRequest = catchAsync(async (req, res, next) => {
  const {
    customerName,
    email,
    phone,
    preferredTopNotes,
    preferredMiddleNotes,
    preferredBaseNotes,
    concentration,
    intensity,
    occasion,
    gender,
    budgetRange,
    quantity,
    allergies,
    additionalRequirements,
  } = req.body;

  if (!customerName || !email || !phone || !occasion || !budgetRange) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const bespokeRequest = await BespokeRequest.create({
    user: req.user._id,
    customerName,
    email,
    phone,
    preferredTopNotes: preferredTopNotes || [],
    preferredMiddleNotes: preferredMiddleNotes || [],
    preferredBaseNotes: preferredBaseNotes || [],
    concentration,
    intensity,
    occasion,
    gender,
    budgetRange,
    quantity,
    allergies,
    additionalRequirements,
    status: "pending",
  });

  try {
    await sendEmail({
      to: email,
      subject: "Bespoke Fragrance Request Received - ItraFume",
      html: `
        <h2>Hello ${customerName},</h2>
        <p>Thank you for your bespoke fragrance request!</p>
        <p>Your request has been received and our fragrance experts will review it shortly.</p>
        <p><strong>Request Details:</strong></p>
        <ul>
          <li>Occasion: ${occasion}</li>
          <li>Budget Range: ${budgetRange}</li>
          <li>Gender: ${gender}</li>
        </ul>
        <p>We'll contact you within 2-3 business days with our recommendations.</p>
        <p>Best regards,<br>ItraFume Team</p>
      `,
    });
  } catch (err) {
    console.error("Bespoke request confirmation email failed:", err.message);
  }

  res.status(201).json({
    success: true,
    message:
      "Bespoke request created successfully. We will review and contact you soon.",
    data: { bespokeRequest },
  });
});

exports.getUserBespokeRequests = catchAsync(async (req, res, next) => {
  const requests = await BespokeRequest.find({ user: req.user._id }).sort({
    requestedAt: -1,
  });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: { requests },
  });
});

exports.getBespokeRequestDetail = catchAsync(async (req, res, next) => {
  const request = await BespokeRequest.findById(req.params.requestId).populate(
    "linkedOrder linkedProduct",
  );

  if (!request) {
    return next(new AppError("Bespoke request not found", 404));
  }

  if (String(request.user) !== String(req.user._id)) {
    return next(new AppError("Not authorized to view this request", 403));
  }

  res.status(200).json({ success: true, data: { request } });
});


exports.getAllBespokeRequests = catchAsync(async (req, res, next) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const requests = await BespokeRequest.find(filter)
    .populate("user", "name email")
    .sort({ requestedAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: { requests },
  });
});

exports.updateBespokeRequestStatus = catchAsync(async (req, res, next) => {
  const { status, adminNotes, estimatedDelivery, linkedProduct, linkedOrder } =
    req.body;

  const request = await BespokeRequest.findById(req.params.requestId);

  if (!request) {
    return next(new AppError("Bespoke request not found", 404));
  }

  if (status) request.status = status;
  if (adminNotes) request.adminNotes = adminNotes;
  if (estimatedDelivery) request.estimatedDelivery = estimatedDelivery;
  if (linkedProduct) request.linkedProduct = linkedProduct;
  if (linkedOrder) request.linkedOrder = linkedOrder;

  if (status === "completed") {
    request.completedAt = new Date();
  }

  await request.save();

  try {
    const userEmail = request.email;
    const statusMessage = {
      "in-review":
        "Your bespoke fragrance request is being reviewed by our experts.",
      approved:
        "Great news! Your custom fragrance has been approved. We'll start production soon.",
      "in-production": "Your custom fragrance is now in production.",
      completed: `Your custom fragrance is ready! ${adminNotes || ""}`,
      rejected: `Unfortunately, we couldn't fulfill your request. ${adminNotes || "Please contact us for more details."}`,
    };

    await sendEmail({
      to: userEmail,
      subject: `Bespoke Fragrance Update - ${status.toUpperCase()} - ItraFume`,
      html: `
        <h2>Hello ${request.customerName},</h2>
        <p>${statusMessage[status] || "Your bespoke request has been updated."}</p>
        ${estimatedDelivery ? `<p>Estimated Delivery: ${new Date(estimatedDelivery).toLocaleDateString()}</p>` : ""}
        <p>Best regards,<br>ItraFume Team</p>
      `,
    });
  } catch (err) {
    console.error("Status update email failed:", err.message);
  }

  res.status(200).json({ success: true, data: { request } });
});

exports.deleteBespokeRequest = catchAsync(async (req, res, next) => {
  const request = await BespokeRequest.findByIdAndDelete(req.params.requestId);

  if (!request) {
    return next(new AppError("Bespoke request not found", 404));
  }

  res.status(200).json({ success: true, message: "Bespoke request deleted" });
});
