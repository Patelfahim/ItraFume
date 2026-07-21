import { useState } from "react";
import toast from "react-hot-toast";
import { FiThumbsUp, FiCheckCircle, FiPlay, FiImage } from "react-icons/fi";
import StarRating from "./StarRating";
import MediaUploader from "./MediaUploader";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ReviewSection = ({
  productId,
  reviews,
  onReviewAdded,
  onHelpfulToggled,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL;

  const normalizeMediaUrl = (url) => {
    if (!url) return url;
    if (typeof url === "string" && url.startsWith("/uploads/")) {
      return `${apiBaseUrl}${url}`;
    }
    if (typeof url === "string" && url.startsWith("/media/")) {
      return `${apiBaseUrl}${url}`;
    }
    return url;
  };

  const alreadyReviewed =
    user && reviews?.some((r) => r.user?._id === user._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 3) {
      toast.error("Please write a slightly longer review comment.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("title", title);
      formData.append("comment", comment);
      files.forEach((f) => formData.append("media", f));

      const { data } = await api.post(
        `/products/${productId}/reviews`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Thank you for your review!");
      onReviewAdded?.(data.data.review);
      setComment("");
      setTitle("");
      setFiles([]);
      setShowForm(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleHelpful = async (reviewId) => {
    if (!user) return toast.error("Please log in to vote.");
    try {
      const { data } = await api.patch(`/reviews/${reviewId}/helpful`);
      onHelpfulToggled?.(reviewId, data.data.helpfulVotes);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">
          Customer Reviews ({reviews?.length || 0})
        </h2>
        {user && !alreadyReviewed && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-outline"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        )}
      </div>

      {!user && (
        <p className="text-sm text-on-surface-variant mb-6">
          Please{" "}
          <a href="/login" className="text-primary underline">
            sign in
          </a>{" "}
          to write a review.
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-low rounded-md p-5 mb-8 space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold mb-1">
              Your Rating
            </label>
            <StarRating
              rating={rating}
              interactive
              size={24}
              onChange={setRating}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Title (optional)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="input-field"
              placeholder="Sum up your experience"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
              className="input-field"
              placeholder="Tell others what you think about this fragrance..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Add Photos or Videos (optional)
            </label>
            <MediaUploader
              files={files}
              onChange={setFiles}
              maxFiles={5}
              label="Share photos or videos of the product —"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {lightbox.type === "video" ? (
            <video
              src={normalizeMediaUrl(lightbox.url)}
              controls
              autoPlay
              className="max-h-[85vh] max-w-full rounded"
            />
          ) : (
            <img
              src={normalizeMediaUrl(lightbox.url)}
              alt="Review media"
              className="max-h-[85vh] max-w-full rounded"
            />
          )}
        </div>
      )}

      <div className="space-y-6">
        {reviews?.length === 0 && (
          <p className="text-on-surface-variant text-sm">
            No reviews yet. Be the first to share your experience!
          </p>
        )}
        {reviews?.map((review) => (
          <div
            key={review._id}
            className="border-b border-surface-container-high pb-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">
                    {review.user?.name || "Anonymous"}
                  </span>
                  {review.isVerifiedPurchase && (
                    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <FiCheckCircle size={11} /> Verified Purchase
                    </span>
                  )}
                </div>
                <StarRating rating={review.rating} size={13} />
              </div>
              <span className="text-xs text-on-surface-variant">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            {review.title && (
              <h4 className="font-semibold mt-2">{review.title}</h4>
            )}
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              {review.comment}
            </p>

            {review.media?.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {review.media.map((m, idx) => {
                  const src = normalizeMediaUrl(m.url);
                  return (
                    <button
                      key={idx}
                      onClick={() => setLightbox(m)}
                      className="relative w-20 h-20 rounded-sm overflow-hidden bg-surface-container-high"
                    >
                      {m.type === "video" ? (
                        <>
                          <video
                            src={src}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <FiPlay className="text-white" />
                          </span>
                        </>
                      ) : (
                        <img
                          src={src}
                          alt="Review upload"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {review.adminReply?.message && (
              <div className="mt-3 bg-surface-container-low rounded-sm p-3 text-sm">
                <span className="font-semibold text-primary">
                  ItraFume Team:{" "}
                </span>
                {review.adminReply.message}
              </div>
            )}

            <button
              onClick={() => toggleHelpful(review._id)}
              className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-3 hover:text-primary"
            >
              <FiThumbsUp size={12} /> Helpful ({review.helpfulVotes || 0})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
