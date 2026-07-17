import { useEffect, useState } from "react";
import {
  FiClock,
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import api from "../../api/axios";
import Loader from "../../components/ProtectedRoute";

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get("/admin/dashboard-stats")
      .then(({ data }) => setStats(data.data || data));
  }, []);

  if (!stats) return <Loader />;

  const cards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: FiShoppingBag,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toFixed(0)}`,
      icon: FiDollarSign,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: FiClock,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "Customers",
      value: stats.totalUsers,
      icon: FiUsers,
      color: "from-primary to-primary-container",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-secondary">
          Store Overview
        </p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-on-surface-variant">
          Live operating snapshot for orders, revenue, and customers.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="admin-surface p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div className={`rounded-md bg-gradient-to-br ${color} p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <FiTrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-on-surface sm:text-3xl">
              {value}
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">{label}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Recent Orders</h2>
            <p className="text-sm text-on-surface-variant">
              Latest transactions from your store
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            {stats.recentOrders.length} recent
          </span>
        </div>

        <div className="admin-surface overflow-hidden">
          <div className="hidden overflow-x-auto sm:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="font-semibold text-primary">
                      #{order.orderNumber}
                    </td>
                    <td>{order.user?.name || "Unknown customer"}</td>
                    <td className="font-semibold text-green-700">
                      Rs. {order.totalPrice.toFixed(0)}
                    </td>
                    <td className="text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-surface-container-high sm:hidden">
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="font-semibold text-primary">
                    #{order.orderNumber}
                  </span>
                  <span className="font-semibold text-green-700">
                    Rs. {order.totalPrice.toFixed(0)}
                  </span>
                </div>
                <div className="text-sm text-on-surface">
                  {order.user?.name || "Unknown customer"}
                </div>
                <div className="mt-1 text-xs text-on-surface-variant">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {stats.recentOrders.length === 0 && (
            <div className="p-8 text-center text-sm text-on-surface-variant">
              No orders yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
