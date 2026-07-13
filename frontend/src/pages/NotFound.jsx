import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container-max px-4 py-32 text-center">
    <h1 className="font-display text-6xl mb-4">404</h1>
    <p className="text-on-surface-variant mb-8">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary">Back to Home</Link>
  </div>
);

export default NotFound;
