import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiPlay,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTruck,
  FiShield,
} from "react-icons/fi";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import StarRating from "../components/StarRating";
import ReviewSection from "../components/ReviewSection";
import Loader from "../components/ProtectedRoute";

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeMedia, setActiveMedia] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api
      .get(`/products/${slug}`)
      .then(({ data }) => {
        const p = data.data.product;
        setProduct(p);
        setSelectedVariant(p.variants?.[0] || null);
        setReviews(p.reviews || []);
        setActiveMedia(0);
        setQuantity(1);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <Loader />;
  if (error || !product) {
    return (
      <div className="container-max px-4 py-24 text-center">
        <h2 className="font-display text-2xl mb-4">Product not found</h2>
        <Link to="/shop" className="btn-outline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL;

  const normalizeMediaUrl = (url) => {
    if (!url) return url;
    // Backend returns relative URLs like: /uploads/products/<file>
    // Frontend must request them from the API host.
    if (typeof url === "string" && url.startsWith("/uploads/")) {
      return `${apiBaseUrl}${url}`;
    }
    return url; // already absolute (or something else)
  };

  const media = (product.media || []).map((m) => ({
    ...m,
    url: normalizeMediaUrl(m.url),
    thumbnail: normalizeMediaUrl(m.thumbnail),
  }));

  const currentMedia = media[activeMedia];
  const hasDiscount = selectedVariant?.compareAtPrice > selectedVariant?.price;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
  };

  return (
    <div className="container-max px-4 sm:px-6 lg:px-8 py-10">
      <Helmet>
        <title>{product.name} — ItraFume</title>
        <meta name="description" content={product.shortDescription} />
      </Helmet>

      <div className="text-xs text-on-surface-variant mb-6 flex gap-2">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /{" "}
        <span className="text-on-surface">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Media gallery */}
        <div>
          <div className="aspect-square bg-surface-container rounded-md overflow-hidden mb-4">
            {currentMedia?.type === "video" ? (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                muted
                loop
                poster={currentMedia?.thumbnail}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentMedia?.url}
                alt={currentMedia?.alt || product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="grid grid-cols-5 gap-3">
            {media.map((m, idx) => (
              <button
                key={idx}
                onClick={() => setActiveMedia(idx)}
                className={`relative aspect-square rounded-sm overflow-hidden border-2 ${
                  idx === activeMedia ? "border-primary" : "border-transparent"
                }`}
              >
                {m.type === "video" ? (
                  <>
                    <video
                      src={m.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <FiPlay className="text-white" size={14} />
                    </span>
                  </>
                ) : (
                  <img
                    src={m.url}
                    alt={m.alt}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div>
          <p className="text-xs uppercase tracking-wider text-secondary mb-2">
            {product.category} &middot; {product.concentration}
          </p>
          <h1 className="font-display text-3xl lg:text-4xl mb-3">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.ratingsAverage || 0} size={16} />
            <span className="text-sm text-on-surface-variant">
              {product.ratingsAverage?.toFixed(1) || "0.0"} (
              {product.ratingsCount || 0} reviews)
            </span>
          </div>

          <p className="text-on-surface-variant leading-relaxed mb-6">
            {product.shortDescription}
          </p>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-3xl text-on-surface">
              ₹{selectedVariant?.price?.toFixed(0)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-on-surface-variant line-through">
                ₹{selectedVariant.compareAtPrice.toFixed(0)}
              </span>
            )}
            {hasDiscount && (
              <span className="text-sm text-green-700 font-semibold">
                {Math.round(
                  (1 - selectedVariant.price / selectedVariant.compareAtPrice) *
                    100,
                )}
                % off
              </span>
            )}
          </div>

          {/* Variant selector */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-2">Size</h4>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v._id}
                  onClick={() => {
                    setSelectedVariant(v);
                    setQuantity(1);
                  }}
                  disabled={v.stock === 0}
                  className={`px-4 py-2 rounded-sm border text-sm font-semibold transition-all ${
                    selectedVariant?._id === v._id
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant text-on-surface hover:border-primary"
                  } ${v.stock === 0 ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                >
                  {v.size}
                </button>
              ))}
            </div>
            {selectedVariant?.stock > 0 && selectedVariant.stock <= 5 && (
              <p className="text-xs text-error mt-2">
                Only {selectedVariant.stock} left in stock!
              </p>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-outline-variant rounded-sm">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3"
                aria-label="Decrease quantity"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(selectedVariant?.stock || 1, q + 1),
                  )
                }
                className="p-3"
                aria-label="Increase quantity"
              >
                <FiPlus size={14} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <FiShoppingBag />{" "}
              {selectedVariant?.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <FiTruck /> Free shipping over ₹999
            </div>
            <div className="flex items-center gap-2">
              <FiShield /> 100% authentic, secure checkout
            </div>
          </div>

          {/* Fragrance notes */}
          {(product.fragranceNotes?.top?.length > 0 ||
            product.fragranceNotes?.middle?.length > 0) && (
            <div className="border-t border-surface-container-high pt-6 mb-6">
              <h4 className="font-display text-lg mb-3">Fragrance Notes</h4>
              <div className="space-y-2 text-sm">
                {product.fragranceNotes.top?.length > 0 && (
                  <p>
                    <span className="font-semibold">Top:</span>{" "}
                    {product.fragranceNotes.top.join(", ")}
                  </p>
                )}
                {product.fragranceNotes.middle?.length > 0 && (
                  <p>
                    <span className="font-semibold">Middle:</span>{" "}
                    {product.fragranceNotes.middle.join(", ")}
                  </p>
                )}
                {product.fragranceNotes.base?.length > 0 && (
                  <p>
                    <span className="font-semibold">Base:</span>{" "}
                    {product.fragranceNotes.base.join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-surface-container-high pt-6">
            <h4 className="font-display text-lg mb-3">Description</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 pt-10 border-t border-surface-container-high">
        <ReviewSection
          productId={product._id}
          reviews={reviews}
          onReviewAdded={(newReview) => {
            if (newReview) setReviews((prev) => [newReview, ...prev]);
          }}
          onHelpfulToggled={(reviewId, helpfulVotes) => {
            setReviews((prev) =>
              prev.map((r) =>
                r._id === reviewId ? { ...r, helpfulVotes } : r,
              ),
            );
          }}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
