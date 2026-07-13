import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-container-low">
      <div className="container-max grid min-h-[calc(100vh-80px)] lg:grid-cols-[1fr_480px]">
        <section className="hidden lg:flex flex-col justify-between bg-secondary px-12 py-10 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-secondary-container">
              ItraFume
            </p>
            <h1 className="font-display mt-6 max-w-xl text-5xl leading-tight">
              Welcome back to your fragrance wardrobe.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
              Track orders, save your favourites, and return to checkout without
              losing your cart.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {["Secure checkout", "Order history", "Verified reviews"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-md border border-white/10 bg-white/5 p-4"
                >
                  <FiShield className="mb-3 text-secondary-container" />
                  <span className="text-white/80">{item}</span>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-secondary">
                Account Access
              </p>
              <h2 className="font-display mt-3 text-4xl">Sign in</h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Continue to your ItraFume account.
              </p>
            </div>

            <div className="admin-surface p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="input-field !pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className="input-field !pl-10 !pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <FiArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-surface-container-high" />
                <span className="text-xs text-on-surface-variant">
                  New to ItraFume?
                </span>
                <div className="h-px flex-1 bg-surface-container-high" />
              </div>

              <Link
                to="/register"
                className="block w-full rounded-sm border border-primary px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-on-primary"
              >
                Create Account
              </Link>
            </div>

            <p className="mt-6 px-4 text-center text-xs text-on-surface-variant">
              By signing in, you agree to our{" "}
              <Link to="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
