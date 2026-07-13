import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/ProtectedRoute";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusTone = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [trackingDrafts, setTrackingDrafts] = useState({});

  const fetchOrders = () => {
    setLoading(true);
    api
      .get("/admin/orders", { params: { status: filter || undefined } })
      .then(({ data }) => setOrders(data.data.orders))
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrders, [filter]);

  const updateStatus = async (orderId, status) => {
    try {
      const { data } = await api.patch(`/admin/orders/${orderId}/status`, {
        status,
        trackingNumber: trackingDrafts[orderId],
      });
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? data.data.order : order)),
      );
      toast.success("Order status updated. Customer notified via email.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-secondary">
            Fulfilment
          </p>
          <h1 className="font-display mt-2 text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Review payments, addresses, tracking, and delivery state.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-full sm:w-52"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </header>

      {loading ? (
        <Loader />
      ) : (
        <div className=" *:space-y-6 ">
          {orders.map((order) => (
            <article key={order._id} className="admin-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-semibold text-primary">
                      #{order.orderNumber}
                    </h2>
                    <span
                      className={`status-pill ${statusTone[order.orderStatus]}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {order.user?.name || "Unknown customer"} ·{" "}
                    {order.user?.email || "No email"}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-bold">
                    Rs. {order.totalPrice.toFixed(0)}
                  </p>
                  <p className="text-xs capitalize text-on-surface-variant">
                    {order.paymentGateway} · {order.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="rounded-md bg-surface-container-low p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Items
                  </p>
                  <div className="space-y-1 text-sm">
                    {order.items.map((item, idx) => (
                      <p key={idx}>
                        {item.name} ({item.size}) x {item.quantity}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="rounded-md bg-surface-container-low p-4 text-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Ship To
                  </p>
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-on-surface-variant">
                    {order.shippingAddress.line1}, {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  value={order.orderStatus}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="input-field w-full text-sm capitalize sm:w-44"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Tracking number"
                  defaultValue={order.trackingNumber}
                  onChange={(e) =>
                    setTrackingDrafts((prev) => ({
                      ...prev,
                      [order._id]: e.target.value,
                    }))
                  }
                  className="input-field w-full text-sm sm:w-56"
                />
              </div>
            </article>
          ))}

          {orders.length === 0 && (
            <div className="admin-surface p-10 text-center text-sm text-on-surface-variant">
              No orders match this filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
