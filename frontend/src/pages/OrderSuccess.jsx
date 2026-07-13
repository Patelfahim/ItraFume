import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import Loader from '../components/ProtectedRoute';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearCart(); // safe to clear regardless of gateway used
    if (!orderId) {
      setLoading(false);
      return;
    }
    api
      .get(`/orders/${orderId}`)
      .then(({ data }) => setOrder(data.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) return <Loader />;

  return (
    <div className="container-max px-4 py-20 max-w-2xl mx-auto text-center">
      <FiCheckCircle className="text-6xl text-green-600 mx-auto mb-6" />
      <h1 className="font-display text-3xl mb-3">Thank you for your order!</h1>
      <p className="text-on-surface-variant mb-8">
        {order
          ? `Your order #${order.orderNumber} has been confirmed. A confirmation email is on its way.`
          : 'Your order is being processed. You will receive a confirmation email shortly.'}
      </p>

      {order && (
        <div className="bg-surface-container-low rounded-md p-6 text-left mb-8">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm py-1">
              <span>{item.name} ({item.size}) &times; {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div className="border-t border-surface-container-high mt-3 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{order.totalPrice.toFixed(0)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Link to="/shop" className="btn-outline">Continue Shopping</Link>
        <Link to="/account" className="btn-primary">View My Orders</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
