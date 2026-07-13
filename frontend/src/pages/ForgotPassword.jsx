import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-max px-4 py-16 max-w-md mx-auto">
      <h1 className="font-display text-3xl mb-2 text-center">Reset Password</h1>
      <p className="text-on-surface-variant text-sm text-center mb-8">
        Enter your email and we'll send you a link to reset your password.
      </p>

      {sent ? (
        <div className="bg-surface-container-low rounded-md p-6 text-center text-sm">
          If an account with that email exists, a password reset link has been sent. Please check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-on-surface-variant mt-6">
        <Link to="/login" className="text-primary font-semibold hover:underline">Back to Sign In</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
