import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating = 0, size = 14, showValue = false, interactive = false, onChange }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(star)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${star} star`}
        >
          <FiStar
            size={size}
            style={{
              fill: star <= Math.round(rating) ? '#775a19' : 'transparent',
              color: star <= Math.round(rating) ? '#775a19' : '#c5c6ce',
            }}
          />
        </button>
      ))}
      {showValue && <span className="text-xs text-on-surface-variant ml-1">({rating.toFixed(1)})</span>}
    </div>
  );
};

export default StarRating;
