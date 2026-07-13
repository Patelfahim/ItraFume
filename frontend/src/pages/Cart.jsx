import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container-max px-4 py-24 text-center">
        <h2 className="font-display text-3xl mb-4">Your cart is empty</h2>
        <p className="text-on-surface-variant mb-8">Discover our bespoke fragrances and add something you love.</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="container-max px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 bg-surface-container-low rounded-md p-4">
              <Link to={`/product/${item.slug}`} className="w-24 h-24 flex-shrink-0 rounded-sm overflow-hidden bg-surface-container">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.slug}`} className="font-display text-lg hover:text-primary block truncate">
                  {item.name}
                </Link>
                <p className="text-sm text-on-surface-variant mb-2">Size: {item.size}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-outline-variant rounded-sm">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="p-2"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="p-2"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>
                  <span className="font-semibold">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.productId, item.variantId)}
                className="text-on-surface-variant hover:text-error self-start"
                aria-label="Remove item"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}

          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-primary mt-4">
            <FiArrowLeft /> Continue Shopping
          </Link>
        </div>

        {/* Order summary */}
        <div className="bg-surface-container-low rounded-md p-6 h-fit sticky top-24">
          <h3 className="font-display text-xl mb-4">Order Summary</h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-on-surface-variant">Subtotal</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-on-surface-variant">Shipping</span>
            <span>{subtotal >= 999 ? 'Free' : '₹99'}</span>
          </div>
          <div className="border-t border-surface-container-high pt-4 flex justify-between font-semibold text-lg mb-6">
            <span>Total</span>
            <span>₹{(subtotal + (subtotal >= 999 ? 0 : 99)).toFixed(0)}</span>
          </div>
          <button onClick={handleCheckout} className="btn-primary w-full">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
