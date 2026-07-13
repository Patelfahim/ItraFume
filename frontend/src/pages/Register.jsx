import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = () => {
    const pwd = form.password;
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = passwordStrength();
  const strengthColor =
    strength <= 1
      ? "bg-red-500"
      : strength === 2
        ? "bg-yellow-500"
        : "bg-green-500";
  const strengthText =
    strength <= 1 ? "Weak" : strength === 2 ? "Fair" : "Strong";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success(
        "Account created! Please check your email to verify your account.",
      );
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-container-low">
      <div className="container-max grid min-h-[calc(100vh-80px)] lg:grid-cols-[480px_1fr]">
        <section className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-secondary">
                New Account
              </p>
              <h1 className="font-display mt-3 text-4xl">Create account</h1>
              <p className="mt-2 text-sm text-on-surface-variant">
                Save your details and unlock a smoother checkout.
              </p>
            </div>

            <div className="admin-surface p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field
                  icon={FiUser}
                  label="Full Name"
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(value) => setForm({ ...form, name: value })}
                />
                <Field
                  icon={FiMail}
                  label="Email Address"
                  required
                  type="email"
                  placeholder=" you@example.com"
                  value={form.email}
                  onChange={(value) => setForm({ ...form, email: value })}
                />
                <Field
                  icon={FiPhone}
                  label="Phone Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(value) => setForm({ ...form, phone: value })}
                />

                <PasswordField
                  label="Password"
                  value={form.password}
                  show={showPassword}
                  setShow={setShowPassword}
                  onChange={(value) => setForm({ ...form, password: value })}
                  placeholder="Minimum 8 characters"
                />
                {form.password && (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className={`h-full ${strengthColor} transition-all`}
                        style={{ width: `${(strength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-on-surface-variant">
                      {strengthText}
                    </span>
                  </div>
                )}

                <PasswordField
                  label="Confirm Password"
                  value={form.confirmPassword}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                  onChange={(value) =>
                    setForm({ ...form, confirmPassword: value })
                  }
                  placeholder="Confirm your password"
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-green-700">
                    <FiCheck className="h-4 w-4" />
                    Passwords match
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <FiArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-surface-container-high" />
                <span className="text-xs text-on-surface-variant">
                  Already a member?
                </span>
                <div className="h-px flex-1 bg-surface-container-high" />
              </div>

              <Link
                to="/login"
                className="block w-full rounded-sm border border-primary px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-on-primary"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="hidden lg:flex flex-col justify-between bg-secondary px-12 py-10 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-secondary-container">
              Private Client Benefits
            </p>
            <h2 className="font-display mt-6 max-w-xl text-5xl leading-tight">
              Your next scent should feel personal from the first click.
            </h2>
          </div>
          <div className="grid gap-3">
            {[
              "Faster checkout with saved contact details",
              "Order tracking and delivery updates",
              "Review purchases after delivery",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-4 text-white/80"
              >
                <FiCheck className="text-secondary-container" />
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const Field = ({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-on-surface">
      {label}
      {required ? " *" : ""}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
<input
  required={required}
  type={type}
  placeholder={placeholder}
  value={value}
  onChange={(e) => onChange(e.target.value)}
  className="input-field !pl-10"
/>    </div>
  </div>
);

const PasswordField = ({ label, value, onChange, show, setShow, placeholder }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-on-surface">{label} *</label>
    <div className="relative">
      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
<input
  required
  type={show ? "text" : "password"}
  placeholder={placeholder}
  value={value}
  onChange={(e) => onChange(e.target.value)}
  className="input-field !pl-10 !pr-10"
/>      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  </div>
);

export default Register;
