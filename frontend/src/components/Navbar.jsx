import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiSearch,
  FiLogOut,
  FiPackage,
  FiGrid,
  FiStar,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const NAV_LINKS = [
  { label: "Shop All", to: "/shop" },
  { label: "Attar", to: "/shop?category=Attar" },
  { label: "Oud", to: "/shop?category=Oud" },
  { label: "Bespoke", to: "/bespoke" },
  { label: "Our Story", to: "/about" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm("");
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-surface-container-high shadow-sm">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden text-2xl text-on-surface hover:text-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>

          <Link
            to="/"
            className="font-display text-2xl md:text-3xl tracking-wide text-primary select-none hover:opacity-80 transition-opacity"
          >
            ITRAFUME
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-semibold tracking-wide uppercase text-on-surface-variant hover:text-primary transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                setMobileOpen(false);
              }}
              className="text-xl text-on-surface hover:text-primary transition-colors"
              aria-label="Search"
            >
              <FiSearch />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-xl text-on-surface hover:text-primary transition-colors"
                aria-label="Account menu"
              >
                <FiUser />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-surface-container-lowest rounded-lg shadow-xl border border-surface-container-high py-2 text-sm z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-surface-container-high bg-gradient-to-r from-primary/5 to-transparent">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-container transition-colors"
                      >
                        <FiPackage className="w-4 h-4" /> My Orders
                      </Link>
                      <Link
                        to="/bespoke"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-container transition-colors"
                      >
                        <FiStar className="w-4 h-4" /> Bespoke Requests
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-container transition-colors border-t border-surface-container-high"
                        >
                          <FiGrid className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          await logout();
                          setMenuOpen(false);
                          navigate("/");
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 hover:bg-surface-container text-error transition-colors border-t border-surface-container-high"
                      >
                        <FiLogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 hover:bg-surface-container transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 hover:bg-surface-container transition-colors border-t border-surface-container-high"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/cart"
              className="relative text-xl text-on-surface hover:text-primary transition-colors"
              aria-label="Cart"
            >
              <FiShoppingBag />
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <form
            onSubmit={handleSearch}
            className="pb-4 animate-in fade-in duration-200"
          >
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search perfumes, oud, attar..."
                className="input-field"
              />
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            </div>
          </form>
        )}

        {mobileOpen && (
          <nav className="lg:hidden pb-4 flex flex-col gap-1 animate-in fade-in duration-200">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="py-3 px-2 text-sm font-semibold tracking-wide uppercase text-on-surface-variant hover:text-primary hover:bg-surface-container/50 transition-colors rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
