import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Types
type CartItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  quantity: number;
};

// Currency symbols
const currencySymbols: Record<string, string> = {
  USD: "$", INR: "₹", GBP: "£", EUR: "€", JPY: "¥",
  CAD: "C$", AUD: "A$", CNY: "¥", BRL: "R$", MXN: "MX$",
  KRW: "₩", SGD: "S$", AED: "د.إ", SAR: "ر.س", HKD: "HK$",
  CHF: "CHF", SEK: "kr", NOK: "kr", DKK: "kr", PLN: "zł",
  NZD: "NZ$", THB: "฿", MYR: "RM", IDR: "Rp", PHP: "₱",
  ZAR: "R", TRY: "₺", ARS: "$", CLP: "$", CZK: "Kč",
};

const CheckoutForm = ({ cart, total, userCurrency }: { cart: CartItem[]; total: number; userCurrency: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [referralCode, setReferralCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Payment details incomplete.");
        setIsProcessing(false);
        return;
      }

      // Create payment intent on the server
      const response = await fetch("http://localhost:5173/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to cents
          currency: "usd",
          referralCode,
        }),
      });

      const { clientSecret } = await response.json();

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: "customer@example.com", // Replace with user email if available
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed.");
        setIsProcessing(false);
      } else if (paymentIntent.status === "succeeded") {
        setSuccess("Payment successful! Thank you for your purchase.");
        setTimeout(() => navigate("/checkout/success"), 2000);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Network error. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm text-white mb-2">Card Details</label>
        <div className="bg-[#030804] border border-[#000000] rounded-lg p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#ffffff",
                  "::placeholder": { color: "#6b7280" },
                },
                invalid: { color: "#ef4444" },
              },
            }}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-white mb-2">Referral Code (Optional)</label>
        <input
          type="text"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full bg-[#030804] border border-[#000000] rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-[#3DFF88] focus:outline-none"
          placeholder="Enter referral code"
        />
      </div>
      {error && (
        <div className="bg-red-500/10 p-3 rounded-lg text-red-300 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-500/10 p-3 rounded-lg text-green-300 text-sm">{success}</div>
      )}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-[#3dff87] hover:bg-[#259951] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Processing..." : `Pay ${currencySymbols[userCurrency] || "$"}${total.toFixed(2)}`}
      </button>
    </form>
  );
};

export const Checkout = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userCurrency, setUserCurrency] = useState("USD");
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = localStorage.getItem("checkout_cart");
    const storedCurrency = localStorage.getItem("checkout_currency");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    if (storedCurrency) {
      setUserCurrency(storedCurrency);
    }
  }, []);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getDiscountedTotal = () => {
    const total = getCartTotal();
    return total > 10 ? total * 0.9 : total;
  };

  const getDiscountAmount = () => {
    const total = getCartTotal();
    return total > 10 ? total * 0.1 : 0;
  };

  return (
    <div className="min-h-screen bg-[#030904] flex items-center justify-center p-4">
      <div className="bg-[#1a2621] rounded-lg w-full max-w-4xl p-6 border border-[#3dff87]/20 flex flex-col md:flex-row gap-6">
        {/* Left Side: Stripe Payment */}
        <div className="md:w-1/2">
          <h2 className="text-white font-bold text-lg mb-4">Payment Details</h2>
          <Elements stripe={stripePromise}>
            <CheckoutForm cart={cart} total={getDiscountedTotal()} userCurrency={userCurrency} />
          </Elements>
          <div className="text-center mt-4 text-xs text-gray-400">
            <p>🔒 Secure checkout • SSL encrypted • 256-bit encryption</p>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="md:w-1/2">
          <h2 className="text-white font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-gray-300 text-sm">
                <span className="line-clamp-2">{item.title} (x{item.quantity})</span>
                <span>
                  {currencySymbols[userCurrency] || "$"}
                  {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            {getDiscountAmount() > 0 && (
              <div className="flex justify-between text-[#3dff87] text-sm pt-2 border-t border-gray-600">
                <span>Discount</span>
                <span>
                  -{currencySymbols[userCurrency] || "$"}
                  {getDiscountAmount().toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-gray-600">
              <span>Total</span>
              <span>
                {currencySymbols[userCurrency] || "$"}
                {getDiscountedTotal().toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)} // Navigate back to previous page
            className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;