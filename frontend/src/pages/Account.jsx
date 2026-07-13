import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/ProtectedRoute';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const Account = () => {
  const { user, updateUserState } = useAuth();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    api
      .get('/orders/mine')
      .then(({ data }) => setOrders(data.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.patch('/auth/update-me', profileForm);
      updateUserState(data.data.user);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await api.patch('/auth/update-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Cancel this order?')) return;
    try {
      const { data } = await api.post(`/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.data.order : o)));
      toast.success('Order cancelled.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container-max px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl mb-8">My Account</h1>

      <div className="flex gap-2 border-b border-surface-container-high mb-8">
        {[
          ['orders', 'Order History'],
          ['profile', 'Profile'],
          ['security', 'Security'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        loading ? <Loader /> : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-on-surface-variant mb-6">You haven't placed any orders yet.</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-surface-container-low rounded-md p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold">#{order.orderNumber}</p>
                    <p className="text-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.orderStatus]}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-on-surface-variant">
                      {item.name} ({item.size}) &times; {item.quantity}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-surface-container-high pt-3">
                  <span className="font-semibold">Total: ₹{order.totalPrice.toFixed(0)}</span>
                  {['pending', 'processing'].includes(order.orderStatus) && (
                    <button onClick={() => cancelOrder(order._id)} className="text-xs text-error underline">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Full Name</label>
            <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Phone</label>
            <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input value={user?.email} disabled className="input-field bg-surface-container opacity-70" />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={handlePasswordSave} className="max-w-md space-y-4">
          <input
            type="password"
            required
            placeholder="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="input-field"
          />
          <input
            type="password"
            required
            placeholder="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="input-field"
          />
          <input
            type="password"
            required
            placeholder="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className="input-field"
          />
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Account;
