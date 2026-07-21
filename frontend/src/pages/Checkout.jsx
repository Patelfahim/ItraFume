import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiShoppingBag, FiCreditCard, FiTruck } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    const timer = setTimeout(() => resolve(false), 10000); // 10s timeout
    script.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    script.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    document.body.appendChild(script);
  });

const emptyAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(emptyAddress);
  const [gateway, setGateway] = useState("razorpay");
  const [processing, setProcessing] = useState(false);
  const navigatedRef = useRef(false); // tracks if we navigated away

  const shippingPrice = subtotal >= 999 ? 0 : 99;
  const totalPrice = subtotal + shippingPrice;

  useEffect(() => {
    if (items.length === 0) navigate("/cart");
  }, [items, navigate]);

  const handleChange = (e) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  const validateAddress = () => {
    const required = [
      "fullName",
      "phone",
      "line1",
      "city",
      "state",
      "postalCode",
      "country",
    ];
    for (const field of required) {
      if (!address[field]?.trim()) {
        toast.error("Please fill in all required address fields.");
        return false;
      }
    }
    if (!/^\d{7,15}$/.test(address.phone.replace(/\D/g, ""))) {
      toast.error("Please enter a valid phone number.");
      return false;
    }
    return true;
  };

  const cartPayload = () => ({
    cartItems: items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    })),
    shippingAddress: address,
    shippingPrice,
    taxPrice: 0,
  });

  const handleRazorpayPayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Unable to load Razorpay. Check your internet connection.");
      setProcessing(false);
      return;
    }

    const { data } = await api.post(
      "/payments/razorpay/create-order",
      cartPayload(),
    );
    const { orderId, razorpayOrderId, amount, currency, keyId } = data.data;

    const options = {
      key: keyId,
      amount,
      currency,
      name: "ItraFume",
      description: "Bespoke Perfume Order",
      order_id: razorpayOrderId,
      prefill: {
        name: address.fullName,
        email: user.email,
        contact: address.phone,
      },
      theme: { color: "#00030a" },
      handler: async (response) => {
        try {
          await api.post("/payments/razorpay/verify", { orderId, ...response });
          clearCart();
          navigatedRef.current = true;
          toast.success("Payment successful!");
          navigate(`/order-success?orderId=${orderId}`);
        } catch (err) {
          toast.error(err.message || "Payment verification failed.");
          setProcessing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      toast.error("Payment failed. Please try again.");
      setProcessing(false);
    });
    rzp.open();
  };

  const handleStripePayment = async () => {
    const { data } = await api.post(
      "/payments/stripe/create-checkout-session",
      cartPayload(),
    );
    navigatedRef.current = true;
    // Navigate away — page will unload
    window.location.href = data.data.url;
  };

  const handleCODPayment = async () => {
    const { data } = await api.post(
      "/payments/cod/create-order",
      cartPayload(),
    );
    clearCart();
    navigatedRef.current = true;
    toast.success("Order placed! Payment due on delivery.");
    navigate(`/order-success?orderId=${data.data.orderId}`);
  };

  const handlePay = async () => {
    if (!validateAddress()) return;
    setProcessing(true);
    navigatedRef.current = false;
    try {
      if (gateway === "razorpay") {
        await handleRazorpayPayment();
      } else if (gateway === "stripe") {
        await handleStripePayment();
      } else if (gateway === "cod") {
        await handleCODPayment();
      }
    } catch (err) {
      toast.error(
        err.message || "Something went wrong while starting payment.",
      );
    }
    // Safety net: only re-enable button if we haven't navigated away.
    // For Razorpay, the modal callbacks (ondismiss, payment.failed, handler catch)
    // call setProcessing(false) themselves. This handles API errors before modal opens.
    if (!navigatedRef.current) {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low py-8 sm:py-12 md:py-16">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl mb-2">Checkout</h1>
          <p className="text-on-surface-variant">
            Complete your order securely
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-high p-6 sm:p-8">
              <h3 className="font-display text-xl mb-6 flex items-center gap-2">
                <FiTruck className="text-primary" />
                Shipping Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={handleChange}
                  placeholder="Full Name *"
                  className="input-field col-span-1 sm:col-span-2"
                />
                <input
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  placeholder="Phone Number *"
                  className="input-field"
                />
                <input
                  name="email"
                  value={user?.email}
                  disabled
                  placeholder="Email"
                  className="input-field opacity-60"
                />
                <input
                  name="line1"
                  value={address.line1}
                  onChange={handleChange}
                  placeholder="Address Line 1 *"
                  className="input-field col-span-1 sm:col-span-2"
                />
                <input
                  name="line2"
                  value={address.line2}
                  onChange={handleChange}
                  placeholder="Address Line 2 (optional)"
                  className="input-field col-span-1 sm:col-span-2"
                />
                <input
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  placeholder="City *"
                  className="input-field"
                />
                <input
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  placeholder="State/Province *"
                  className="input-field"
                />
                <input
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleChange}
                  placeholder="Postal Code *"
                  className="input-field"
                />
                <input
                  name="country"
                  value={address.country}
                  onChange={handleChange}
                  placeholder="Country *"
                  className="input-field"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-high p-6 sm:p-8">
              <h3 className="font-display text-xl mb-6 flex items-center gap-2">
                <FiCreditCard className="text-primary" />
                Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Razorpay */}
                <button
                  onClick={() => setGateway("razorpay")}
                  className={`border-2 rounded-lg p-4 text-center transition-all hover:shadow-md ${
                    gateway === "razorpay"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-surface-container-high hover:border-primary"
                  }`}
                >
                  <div className="font-semibold mb-2">Razorpay</div>
                  <p className="text-xs text-on-surface-variant">UPI, Cards</p>
                  <p className="text-xs text-on-surface-variant">
                    Netbanking, Wallets
                  </p>
                </button>

                {/* Stripe */}
                <button
                  onClick={() => setGateway("stripe")}
                  className={`border-2 rounded-lg p-4 text-center transition-all hover:shadow-md ${
                    gateway === "stripe"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-surface-container-high hover:border-primary"
                  }`}
                >
                  <div className="font-semibold mb-2">Stripe</div>
                  <p className="text-xs text-on-surface-variant">
                    International
                  </p>
                  <p className="text-xs text-on-surface-variant">Cards (USD)</p>
                </button>

                {/* Cash on Delivery */}
                <button
                  onClick={() => setGateway("cod")}
                  className={`border-2 rounded-lg p-4 text-center transition-all hover:shadow-md ${
                    gateway === "cod"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-surface-container-high hover:border-primary"
                  }`}
                >
                  <div className="font-semibold mb-2">Cash on Delivery</div>
                  <p className="text-xs text-on-surface-variant">
                    Pay when you receive
                  </p>
                  <p className="text-xs text-on-surface-variant">your order</p>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-high p-6 sm:p-8">
              <h3 className="font-display text-xl mb-6 flex items-center gap-2">
                <FiShoppingBag className="text-primary" />
                Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex justify-between items-start pb-3 border-b border-surface-container-high last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {item.size} × {item.quantity}
                      </p>
                      {item.productMedia?.length > 0 && (
                        <div className="mt-2">
                          <img
                            src={
                              item.productMedia[0]?.url?.startsWith("/uploads/")
                                ? `${import.meta.env.VITE_API_URL}${item.productMedia[0].url}`
                                : item.productMedia[0]?.url
                            }
                            alt={item.name}
                            className="w-14 h-10 object-cover rounded-sm bg-surface-container-lowest"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold ml-2 flex-shrink-0">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-surface-container-high pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Shipping</span>
                  <span className="font-medium">
                    {shippingPrice === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shippingPrice}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-surface-container-high">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice.toFixed(0)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePay}
                disabled={processing}
                className="btn-primary w-full mt-8 py-4 text-base font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-70"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <FiShoppingBag className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Security Note */}
              <p className="text-[11px] text-on-surface-variant text-center mt-4">
                {gateway === "cod"
                  ? "Pay securely when you receive your order."
                  : "Payments are securely processed. We never store your card details."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
