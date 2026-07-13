require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');

const img = (n) => `/media/images/IMG-20260706-WA00${String(n).padStart(2, '0')}.jpg`;
const vid = (n) => `/media/videos/VID-20260706-WA00${n}.mp4`;

const products = [
  {
    name: 'Royal Majmua Artisanal Roll-On Oil',
    category: 'Attar',
    gender: 'unisex',
    concentration: 'Pure Perfume Oil',
    shortDescription: 'A regal blend of oud, rose, and amber in a hand-finished roll-on vial.',
    description:
      'Royal Majmua is our signature bespoke blend — a harmonious marriage of aged oud, Taif rose, and warm amber, hand-poured into artisanal roll-on vials. Alcohol-free and long-lasting, it is crafted in small batches for a truly personal fragrance experience.',
    fragranceNotes: { top: ['Rose', 'Saffron'], middle: ['Oud', 'Amber'], base: ['Musk', 'Sandalwood'] },
    tags: ['oud', 'rose', 'bestseller', 'roll-on'],
    isFeatured: true,
    isBestseller: true,
    media: [
      { type: 'image', url: img(0), alt: 'Royal Majmua roll-on bottle' },
      { type: 'image', url: img(1), alt: 'Royal Majmua packaging' },
      { type: 'image', url: img(2), alt: 'Royal Majmua lifestyle shot' },
      { type: 'video', url: vid(34), alt: 'Royal Majmua unboxing' },
    ],
    variants: [
      { size: '6ml', price: 1499, compareAtPrice: 1799, stock: 40, sku: 'RM-6ML' },
      { size: '12ml', price: 2599, compareAtPrice: 2999, stock: 25, sku: 'RM-12ML' },
    ],
  },
  {
    name: 'Midnight Oud Intense',
    category: 'Oud',
    gender: 'men',
    concentration: 'Parfum Oil',
    shortDescription: 'Deep, smoky oud layered with leather and spice for an unforgettable trail.',
    description:
      'Midnight Oud Intense captures the mystique of the Arabian desert night — smoky Cambodian oud, black pepper, and a whisper of leather. Bold, long-lasting, ideal for evening wear.',
    fragranceNotes: { top: ['Black Pepper', 'Bergamot'], middle: ['Oud', 'Leather'], base: ['Vetiver', 'Musk'] },
    tags: ['oud', 'men', 'evening'],
    isFeatured: true,
    media: [
      { type: 'image', url: img(3), alt: 'Midnight Oud bottle' },
      { type: 'image', url: img(4), alt: 'Midnight Oud detail' },
      { type: 'image', url: img(5), alt: 'Midnight Oud box' },
      { type: 'video', url: vid(35), alt: 'Midnight Oud showcase' },
    ],
    variants: [
      { size: '10ml', price: 1899, compareAtPrice: 2199, stock: 30, sku: 'MOI-10ML' },
      { size: '30ml', price: 4299, stock: 15, sku: 'MOI-30ML' },
    ],
  },
  {
    name: 'Damascena Rose Attar',
    category: 'Floral',
    gender: 'women',
    concentration: 'Pure Attar',
    shortDescription: 'Triple-distilled Damascus rose oil, elegant and timeless.',
    description:
      'Distilled from thousands of hand-picked Damascus roses, this attar delivers a rich, velvety rose experience — romantic, feminine, and beautifully long-wearing on skin.',
    fragranceNotes: { top: ['Rose Petals'], middle: ['Rose Absolute', 'Lychee'], base: ['White Musk'] },
    tags: ['rose', 'floral', 'women'],
    isBestseller: true,
    media: [
      { type: 'image', url: img(6), alt: 'Damascena Rose Attar bottle' },
      { type: 'image', url: img(7), alt: 'Damascena Rose gift set' },
      { type: 'image', url: img(8), alt: 'Damascena Rose close-up' },
    ],
    variants: [
      { size: '6ml', price: 1299, stock: 50, sku: 'DRA-6ML' },
      { size: '12ml', price: 2199, stock: 30, sku: 'DRA-12ML' },
    ],
  },
  {
    name: 'Golden Amber Musk',
    category: 'Amber',
    gender: 'unisex',
    concentration: 'Perfume Oil',
    shortDescription: 'Warm amber and creamy musk, comforting and radiant.',
    description:
      'A cozy, radiant blend of Ambergris-style amber and soft white musk, rounded out with vanilla and a touch of tonka bean. Perfect for everyday wear across all seasons.',
    fragranceNotes: { top: ['Bergamot', 'Pink Pepper'], middle: ['Amber', 'Vanilla'], base: ['Musk', 'Tonka Bean'] },
    tags: ['amber', 'musk', 'unisex'],
    media: [
      { type: 'image', url: img(9), alt: 'Golden Amber Musk bottle' },
      { type: 'image', url: img(11), alt: 'Golden Amber Musk lifestyle' },
      { type: 'image', url: img(12), alt: 'Golden Amber Musk packaging' },
      { type: 'video', url: vid(37), alt: 'Golden Amber Musk showcase' },
    ],
    variants: [
      { size: '10ml', price: 1599, stock: 35, sku: 'GAM-10ML' },
      { size: '25ml', price: 3199, stock: 20, sku: 'GAM-25ML' },
    ],
  },
  {
    name: 'Saffron Kesar Attar',
    category: 'Attar',
    gender: 'unisex',
    concentration: 'Pure Attar',
    shortDescription: 'Precious saffron threads infused in sandalwood oil.',
    description:
      'A luxurious infusion of hand-harvested Kashmiri saffron in aged sandalwood oil. Rich, spiced, and slightly sweet — a scent of royalty worn for centuries across South Asia.',
    fragranceNotes: { top: ['Saffron'], middle: ['Sandalwood'], base: ['Musk', 'Oud'] },
    tags: ['saffron', 'attar', 'sandalwood'],
    media: [
      { type: 'image', url: img(13), alt: 'Saffron Kesar Attar bottle' },
      { type: 'image', url: img(14), alt: 'Saffron Kesar box set' },
      { type: 'image', url: img(15), alt: 'Saffron Kesar detail shot' },
    ],
    variants: [
      { size: '6ml', price: 1699, stock: 28, sku: 'SKA-6ML' },
      { size: '12ml', price: 2899, stock: 18, sku: 'SKA-12ML' },
    ],
  },
  {
    name: 'White Musk Serenity',
    category: 'Musk',
    gender: 'women',
    concentration: 'Perfume Oil',
    shortDescription: 'Clean, powdery white musk with soft floral undertones.',
    description:
      'An airy, clean musk fragrance layered with soft jasmine and a touch of iris. Serenity is designed for daily wear — subtle, elegant, and universally flattering.',
    fragranceNotes: { top: ['Iris', 'Bergamot'], middle: ['Jasmine'], base: ['White Musk', 'Cedar'] },
    tags: ['musk', 'floral', 'daily-wear'],
    media: [
      { type: 'image', url: img(17), alt: 'White Musk Serenity bottle' },
      { type: 'image', url: img(18), alt: 'White Musk Serenity flatlay' },
      { type: 'image', url: img(19), alt: 'White Musk Serenity detail' },
      { type: 'video', url: vid(38), alt: 'White Musk Serenity showcase' },
    ],
    variants: [
      { size: '10ml', price: 1399, stock: 45, sku: 'WMS-10ML' },
      { size: '25ml', price: 2799, stock: 22, sku: 'WMS-25ML' },
    ],
  },
  {
    name: 'Vintage Sandalwood Reserve',
    category: 'Sandalwood',
    gender: 'men',
    concentration: 'Pure Attar',
    shortDescription: 'Aged Mysore-style sandalwood, creamy and grounding.',
    description:
      'Sourced in the spirit of old Mysore sandalwood traditions, this reserve blend is creamy, woody, and deeply grounding — a modern classic for the discerning wearer.',
    fragranceNotes: { top: ['Cardamom'], middle: ['Sandalwood'], base: ['Cedarwood', 'Musk'] },
    tags: ['sandalwood', 'woody', 'men'],
    isBestseller: true,
    media: [
      { type: 'image', url: img(20), alt: 'Vintage Sandalwood Reserve bottle' },
      { type: 'image', url: img(21), alt: 'Vintage Sandalwood Reserve packaging' },
      { type: 'image', url: img(22), alt: 'Vintage Sandalwood Reserve lifestyle' },
    ],
    variants: [
      { size: '10ml', price: 1999, stock: 24, sku: 'VSR-10ML' },
      { size: '30ml', price: 4599, stock: 12, sku: 'VSR-30ML' },
    ],
  },
  {
    name: 'Jasmine Noor Attar',
    category: 'Floral',
    gender: 'women',
    concentration: 'Pure Attar',
    shortDescription: 'Intoxicating night-blooming jasmine, hand-extracted.',
    description:
      'Noor means "light" — and this jasmine attar radiates it. Hand-extracted from night-blooming jasmine flowers, it is heady, sensual, and deeply feminine.',
    fragranceNotes: { top: ['Jasmine Petals'], middle: ['Jasmine Absolute', 'Ylang Ylang'], base: ['Sandalwood'] },
    tags: ['jasmine', 'floral', 'women'],
    media: [
      { type: 'image', url: img(23), alt: 'Jasmine Noor Attar bottle' },
      { type: 'image', url: img(24), alt: 'Jasmine Noor Attar detail' },
      { type: 'image', url: img(25), alt: 'Jasmine Noor gift box' },
      { type: 'video', url: vid(39), alt: 'Jasmine Noor showcase' },
    ],
    variants: [
      { size: '6ml', price: 1349, stock: 38, sku: 'JNA-6ML' },
      { size: '12ml', price: 2399, stock: 20, sku: 'JNA-12ML' },
    ],
  },
  {
    name: 'Amberi Oud Gift Collection',
    category: 'Gift Set',
    gender: 'unisex',
    concentration: 'Assorted Perfume Oils',
    shortDescription: 'A curated trio of our most beloved oud and amber blends.',
    description:
      'The perfect introduction to ItraFume — three of our most iconic scents in miniature roll-ons, beautifully boxed for gifting or personal discovery.',
    fragranceNotes: { top: ['Assorted'], middle: ['Assorted'], base: ['Assorted'] },
    tags: ['gift-set', 'oud', 'amber', 'bestseller'],
    isFeatured: true,
    isBestseller: true,
    media: [
      { type: 'image', url: img(26), alt: 'Amberi Oud Gift Collection box' },
      { type: 'image', url: img(27), alt: 'Amberi Oud Gift Collection open box' },
      { type: 'image', url: img(28), alt: 'Amberi Oud Gift Collection vials' },
      { type: 'video', url: vid(40), alt: 'Amberi Oud Gift Collection unboxing' },
    ],
    variants: [{ size: '3x6ml Set', price: 3499, compareAtPrice: 4199, stock: 20, sku: 'AOGC-SET' }],
  },
  {
    name: 'Chocolate Oud Elixir',
    category: 'Oud',
    gender: 'unisex',
    concentration: 'Perfume Oil',
    shortDescription: 'Gourmand oud with rich cocoa and warm spice.',
    description:
      'An unexpected pairing of dark chocolate absolute with resinous oud and a hint of clove — indulgent, unusual, and utterly memorable.',
    fragranceNotes: { top: ['Clove', 'Orange Peel'], middle: ['Cocoa', 'Oud'], base: ['Benzoin', 'Musk'] },
    tags: ['oud', 'gourmand', 'unique'],
    media: [
      { type: 'image', url: img(29), alt: 'Chocolate Oud Elixir bottle' },
      { type: 'image', url: img(30), alt: 'Chocolate Oud Elixir detail' },
      { type: 'image', url: img(31), alt: 'Chocolate Oud Elixir lifestyle' },
    ],
    variants: [
      { size: '10ml', price: 2099, stock: 18, sku: 'COE-10ML' },
      { size: '25ml', price: 4099, stock: 10, sku: 'COE-25ML' },
    ],
  },
  {
    name: 'Desert Bloom Musk',
    category: 'Musk',
    gender: 'unisex',
    concentration: 'Perfume Oil',
    shortDescription: 'Wildflower musk inspired by blooming desert oases.',
    description:
      'A soft, sunlit blend of desert wildflowers and warm musk, evoking the rare beauty of an oasis in bloom. Fresh yet grounded.',
    fragranceNotes: { top: ['Neroli', 'Desert Flowers'], middle: ['Orange Blossom'], base: ['Musk', 'Amber'] },
    tags: ['musk', 'floral', 'fresh'],
    media: [
      { type: 'image', url: img(32), alt: 'Desert Bloom Musk bottle' },
      { type: 'image', url: img(33), alt: 'Desert Bloom Musk packaging' },
      { type: 'image', url: img(49), alt: 'Desert Bloom Musk lifestyle' },
    ],
    variants: [
      { size: '10ml', price: 1449, stock: 33, sku: 'DBM-10ML' },
      { size: '25ml', price: 2899, stock: 19, sku: 'DBM-25ML' },
    ],
  },
  {
    name: 'Imperial Oud Noir',
    category: 'Oud',
    gender: 'men',
    concentration: 'Concentrated Perfume Oil',
    shortDescription: 'Our darkest, boldest oud — for the true connoisseur.',
    description:
      'Imperial Oud Noir is not for the faint of heart. Rare aged Hindi oud, dark patchouli, and smoked incense combine for maximum projection and longevity.',
    fragranceNotes: { top: ['Incense'], middle: ['Aged Oud', 'Patchouli'], base: ['Labdanum', 'Musk'] },
    tags: ['oud', 'luxury', 'men', 'bestseller'],
    isFeatured: true,
    isBestseller: true,
    media: [
      { type: 'image', url: img(51), alt: 'Imperial Oud Noir bottle' },
      { type: 'image', url: img(52), alt: 'Imperial Oud Noir box' },
      { type: 'image', url: img(53), alt: 'Imperial Oud Noir detail' },
      { type: 'video', url: vid(41), alt: 'Imperial Oud Noir showcase' },
    ],
    variants: [
      { size: '10ml', price: 2499, compareAtPrice: 2899, stock: 22, sku: 'ION-10ML' },
      { size: '30ml', price: 5599, stock: 8, sku: 'ION-30ML' },
    ],
  },
  {
    name: 'Citrus Neroli Cologne Oil',
    category: 'Fresh',
    gender: 'unisex',
    concentration: 'Perfume Oil',
    shortDescription: 'Bright citrus and neroli, effortlessly fresh.',
    description:
      'A vibrant, uplifting blend of Sicilian citrus, neroli, and light musk — perfect for daytime wear and warm-weather freshness.',
    fragranceNotes: { top: ['Bergamot', 'Lemon'], middle: ['Neroli', 'Petitgrain'], base: ['White Musk'] },
    tags: ['fresh', 'citrus', 'daily-wear'],
    media: [
      { type: 'image', url: img(54), alt: 'Citrus Neroli Cologne Oil bottle' },
      { type: 'image', url: img(55), alt: 'Citrus Neroli Cologne Oil lifestyle' },
      { type: 'image', url: img(56), alt: 'Citrus Neroli Cologne Oil packaging' },
      { type: 'image', url: img(57), alt: 'Citrus Neroli Cologne Oil detail' },
    ],
    variants: [
      { size: '10ml', price: 1249, stock: 40, sku: 'CNC-10ML' },
      { size: '25ml', price: 2499, stock: 25, sku: 'CNC-25ML' },
    ],
  },
];

const slugify = (str) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const importData = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@itrafume.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe@12345';

  await Review.deleteMany();
  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany({ email: { $ne: 'keep-me@example.com' } });

  const admin = await User.create({
    name: 'ItraFume Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    isEmailVerified: true,
  });

  const demoCustomer = await User.create({
    name: 'Demo Customer',
    email: 'customer@itrafume.com',
    password: 'Customer@123',
    role: 'customer',
    isEmailVerified: true,
  });

  const createdProducts = [];
  for (const p of products) {
    const slug = slugify(p.name);
    const created = await Product.create({ ...p, slug, createdBy: admin._id });
    createdProducts.push(created);
  }

  // A couple of sample reviews (with no media, admin/demo can add multimedia ones via UI)
  await Review.create({
    product: createdProducts[0]._id,
    user: demoCustomer._id,
    rating: 5,
    title: 'Absolutely mesmerizing',
    comment: 'The Royal Majmua lasted all day and the compliments did not stop. Worth every rupee.',
    isVerifiedPurchase: true,
  });

  await Review.create({
    product: createdProducts[2]._id,
    user: demoCustomer._id,
    rating: 4,
    title: 'Lovely rose scent',
    comment: 'Very authentic rose fragrance, slightly strong at first but settles beautifully.',
    isVerifiedPurchase: false,
  });

  console.log('✅ Data imported successfully!');
  console.log(`   Admin login:    ${adminEmail} / ${adminPassword}`);
  console.log(`   Customer login: customer@itrafume.com / Customer@123`);
  process.exit(0);
};

const destroyData = async () => {
  await connectDB();
  await Review.deleteMany();
  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();
  console.log('🗑️  Data destroyed!');
  process.exit(0);
};

if (process.argv.includes('-d')) {
  destroyData();
} else {
  importData();
}
