import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiStar,
  FiUsers,
  FiArrowLeft,
  FiMenu,
  FiX,
} from "react-icons/fi";

const links = [
  { to: "/admin", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/admin/products", label: "Products", icon: FiBox },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { to: "/admin/reviews", label: "Reviews", icon: FiStar },
  { to: "/admin/bespoke-requests", label: "Bespoke Requests", icon: FiUsers },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavLinkItem = ({ to, label, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
          isActive
            ? "bg-secondary-container text-primary shadow-sm"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <Icon className="w-5 h-5" /> <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-40 p-2 rounded-md bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Toggle admin menu"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky md:top-0 w-72 h-screen bg-primary text-white shadow-xl transform transition-transform duration-300 ease-in-out z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 h-full flex flex-col">
          <div className="mb-6 border-b border-white/10 pb-5">
            <p className="text-xs uppercase tracking-[0.3em] text-secondary-container">
              ItraFume
            </p>
            <h1 className="font-display text-2xl text-white">Admin Studio</h1>
            <p className="text-xs text-white/55 mt-1">
              Orders, catalog, and customers
            </p>
          </div>

          {/* Header */}
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white mb-5 transition-colors hover:bg-white/10 p-3 rounded-md"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {links.map(({ to, label, icon, end }) => (
              <NavLinkItem
                key={to}
                to={to}
                label={label}
                icon={icon}
                end={end}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-white/60">Full-height control room</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="min-h-screen p-4 pt-16 sm:p-6 md:p-8 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
