import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-max px-4 py-16 max-w-md mx-auto">
      <h1 className="font-display text-3xl mb-2 text-center">Set New Password</h1>
      <p className="text-on-surface-variant text-sm text-center mb-8">Choose a strong, new password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          type="password"
          placeholder="New password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <input
          required
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        <Link to="/login" className="text-primary font-semibold hover:underline">Back to Sign In</Link>
      </p>
    </div>
  );
};

export default ResetPassword;
