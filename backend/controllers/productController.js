const slugify = (str) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const cloudinary = require("../config/cloudinary");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getProducts = catchAsync(async (req, res) => {
  const {
    search,
    category,
    gender,
    minPrice,
    maxPrice,
    sort,
    featured,
    bestseller,
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) filter.category = category;
  if (gender) filter.gender = gender;
  if (featured === "true") filter.isFeatured = true;
  if (bestseller === "true") filter.isBestseller = true;

  if (minPrice || maxPrice) {
    filter["variants.price"] = {};
    if (minPrice) filter["variants.price"].$gte = Number(minPrice);
    if (maxPrice) filter["variants.price"].$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { "variants.0.price": 1 };
  if (sort === "price_desc") sortOption = { "variants.0.price": -1 };
  if (sort === "rating") sortOption = { ratingsAverage: -1 };
  if (sort === "popular") sortOption = { totalSold: -1 };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: products.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data: { products },
  });
});

exports.getProductBySlug = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate({
    path: "reviews",
    match: { status: "approved" },
    populate: { path: "user", select: "name avatar" },
    options: { sort: { createdAt: -1 } },
  });

  if (!product) return next(new AppError("Product not found.", 404));
  res.status(200).json({ success: true, data: { product } });
});

exports.getCategories = catchAsync(async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  res.status(200).json({ success: true, data: { categories } });
});

exports.getFeatured = catchAsync(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    isFeatured: true,
  }).limit(8);
  res.status(200).json({ success: true, data: { products } });
});

// ---------- ADMIN ----------

exports.createProduct = catchAsync(async (req, res, next) => {
  const body = req.body;

  let variants = body.variants;
  if (typeof variants === "string") variants = JSON.parse(variants);

  let fragranceNotes = body.fragranceNotes;
  if (typeof fragranceNotes === "string")
    fragranceNotes = JSON.parse(fragranceNotes);

  let tags = body.tags;
  if (typeof tags === "string")
    tags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const media = (req.files || []).map((file) => ({
    type: file.__mediaType,
    url: file.path,
    alt: body.name,
  }));

  let slug = slugify(body.name);
  const slugExists = await Product.findOne({ slug });
  if (slugExists) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const product = await Product.create({
    name: body.name,
    slug,
    shortDescription: body.shortDescription,
    description: body.description,
    brand: body.brand || "ItraFume",
    category: body.category,
    fragranceNotes,
    concentration: body.concentration,
    gender: body.gender,
    media,
    variants,
    tags,
    isFeatured: body.isFeatured === "true" || body.isFeatured === true,
    isBestseller: body.isBestseller === "true" || body.isBestseller === true,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: { product } });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found.", 404));

  const body = req.body;
  const updatable = [
    "name",
    "shortDescription",
    "description",
    "brand",
    "category",
    "concentration",
    "gender",
    "isActive",
  ];
  updatable.forEach((field) => {
    if (body[field] !== undefined) product[field] = body[field];
  });

  if (body.isFeatured !== undefined)
    product.isFeatured = body.isFeatured === "true" || body.isFeatured === true;
  if (body.isBestseller !== undefined)
    product.isBestseller =
      body.isBestseller === "true" || body.isBestseller === true;

  if (body.variants) {
    product.variants =
      typeof body.variants === "string"
        ? JSON.parse(body.variants)
        : body.variants;
  }
  if (body.fragranceNotes) {
    product.fragranceNotes =
      typeof body.fragranceNotes === "string"
        ? JSON.parse(body.fragranceNotes)
        : body.fragranceNotes;
  }
  if (body.tags) {
    product.tags =
      typeof body.tags === "string"
        ? body.tags.split(",").map((t) => t.trim())
        : body.tags;
  }

  if (req.files && req.files.length > 0) {
    const newMedia = req.files.map((file) => ({
      type: file.__mediaType,
      url: file.path,
      alt: product.name,
    }));
    product.media.push(...newMedia);
  }

  if (body.removeMedia) {
    const toRemove =
      typeof body.removeMedia === "string"
        ? JSON.parse(body.removeMedia)
        : body.removeMedia;
    product.media = product.media.filter((m) => !toRemove.includes(m.url));
    toRemove.forEach((url) => {
      if (url.includes("cloudinary")) {
        const parts = url.split("/");
        const fullPath = parts.slice(7).join("/");
        const resourceType = parts[4];
        const publicId = fullPath.replace(/\.[^.]+$/, "");
        cloudinary.uploader
          .destroy(publicId, { resource_type: resourceType })
          .catch(() => {});
      }
    });
  }

  await product.save();
  res.status(200).json({ success: true, data: { product } });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found.", 404));

  product.isActive = false; // soft delete keeps order history intact
  await product.save();

  res.status(200).json({ success: true, message: "Product deactivated." });
});

exports.getAllProductsAdmin = catchAsync(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res
    .status(200)
    .json({ success: true, results: products.length, data: { products } });
});
