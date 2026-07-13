import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Loader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const role = user?.role;
  // If backend token payload doesn't include role for some reason,
  // default to "not admin" to stay consistent with backend restrictTo('admin').
  if (role !== "admin") return <Navigate to="/" replace />;
  return children;
};

export default Loader;
