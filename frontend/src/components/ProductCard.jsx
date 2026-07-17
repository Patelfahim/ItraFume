import { Link } from "react-router-dom";
import StarRating from "./StarRating";

const ProductCard = ({ product }) => {
  const apiBaseUrl = import.meta.env.VITE_API_URL;

  const normalizeMediaUrl = (url) => {
    if (!url) return url;
    if (typeof url === "string" && url.startsWith("/uploads/")) {
      return `${apiBaseUrl}${url}`;
    }
    return url;
  };

  const media = (product.media || []).map((m) => ({
    ...m,
    url: normalizeMediaUrl(m.url),
    thumbnail: normalizeMediaUrl(m.thumbnail),
  }));

  const image = media.find((m) => m.type === "image");
  const lowestVariant = product.variants?.reduce(
    (min, v) => (v.price < min.price ? v : min),
    product.variants?.[0] || { price: 0 },
  );
  const hasDiscount = lowestVariant?.compareAtPrice > lowestVariant?.price;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="card group block overflow-hidden"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container">
        {image ? (
          <img
            src={image?.url}
            alt={image?.alt || product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary-container/20" />
        )}
        {product.isBestseller && (
          <span className="absolute top-3 left-3 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
            Bestseller
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
            Sale
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-1">
          {product.category}
        </p>
        <h3 className="font-display text-lg text-on-surface mb-1 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={product.ratingsAverage || 0} size={12} />
          <span className="text-xs text-on-surface-variant">
            ({product.ratingsCount || 0})
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-on-surface">
            ₹{lowestVariant?.price?.toFixed(0)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-on-surface-variant line-through">
              ₹{lowestVariant.compareAtPrice.toFixed(0)}
            </span>
          )}
          <span className="text-xs text-on-surface-variant">onwards</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
