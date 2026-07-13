import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../api/axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="container-max px-4 py-24 max-w-md mx-auto text-center">
      {status === 'loading' && <p className="text-on-surface-variant">Verifying your email...</p>}
      {status === 'success' && (
        <>
          <FiCheckCircle className="text-5xl text-green-600 mx-auto mb-4" />
          <h1 className="font-display text-2xl mb-2">Email Verified!</h1>
          <p className="text-on-surface-variant mb-6">Your email has been successfully verified.</p>
          <Link to="/" className="btn-primary">Continue Shopping</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <FiXCircle className="text-5xl text-error mx-auto mb-4" />
          <h1 className="font-display text-2xl mb-2">Verification Failed</h1>
          <p className="text-on-surface-variant mb-6">This link is invalid or has expired.</p>
          <Link to="/" className="btn-outline">Back to Home</Link>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
