import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlay } from 'react-icons/fi';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import Loader from '../../components/ProtectedRoute';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState({});

  const fetchReviews = () => {
    setLoading(true);
    api.get('/admin/reviews').then(({ data }) => setReviews(data.data.reviews)).finally(() => setLoading(false));
  };

  useEffect(fetchReviews, []);

  const moderate = async (id, status) => {
    try {
      await api.patch(`/reviews/${id}/moderate`, { status });
      toast.success(`Review ${status}.`);
      fetchReviews();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const sendReply = async (id) => {
    if (!replyDrafts[id]?.trim()) return;
    try {
      await api.patch(`/reviews/${id}/reply`, { message: replyDrafts[id] });
      toast.success('Reply posted.');
      fetchReviews();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Reviews Moderation</h1>
      <div className="space-y-4 ">
        {reviews.map((r) => (
          <div key={r._id} className="bg-surface-container-lowest rounded-md p-5">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-semibold">{r.product?.name}</p>
                <p className="text-xs text-on-surface-variant">{r.user?.name} &middot; {r.user?.email}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {r.status}
              </span>
            </div>
            <StarRating rating={r.rating} size={13} />
            {r.title && <p className="font-semibold mt-2">{r.title}</p>}
            <p className="text-sm text-on-surface-variant mt-1">{r.comment}</p>

            {r.media?.length > 0 && (
              <div className="flex gap-2 mt-3">
                {r.media.map((m, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-sm overflow-hidden bg-surface-container-high">
                    {m.type === 'video' ? (
                      <>
                        <video src={m.url} className="w-full h-full object-cover" muted />
                        <FiPlay className="absolute inset-0 m-auto text-white" />
                      </>
                    ) : (
                      <img src={m.url} alt="review" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {r.status !== 'approved' && (
                <button onClick={() => moderate(r._id, 'approved')} className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-sm font-semibold">
                  Approve
                </button>
              )}
              {r.status !== 'rejected' && (
                <button onClick={() => moderate(r._id, 'rejected')} className="text-xs bg-red-100 text-red-800 px-3 py-1.5 rounded-sm font-semibold">
                  Reject
                </button>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                placeholder="Reply as ItraFume Team..."
                defaultValue={r.adminReply?.message}
                onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [r._id]: e.target.value }))}
                className="input-field text-sm flex-1"
              />
              <button onClick={() => sendReply(r._id)} className="btn-outline text-xs px-4">Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReviews;
