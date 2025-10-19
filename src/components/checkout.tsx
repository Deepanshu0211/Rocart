import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Initialize Stripe with your publishable key from .env
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Validate the key format
if (stripePublishableKey) {
  if (stripePublishableKey.startsWith('sk_')) {
    console.error("❌ ERROR: You're using a SECRET key (sk_). You need a PUBLISHABLE key (pk_live_)");
  } else if (!stripePublishableKey.startsWith('pk_')) {
    console.error("❌ ERROR: Invalid Stripe key format. Should start with 'pk_live_'");
  } else {
    console.log("✅ Stripe publishable key format is correct:", stripePublishableKey.substring(0, 15) + "...");
  }
} else {
  console.error("❌ VITE_STRIPE_PUBLISHABLE_KEY is not defined in environment variables");
}

const stripePromise = stripePublishableKey && stripePublishableKey.startsWith('pk_') 
  ? loadStripe(stripePublishableKey)
  : null;

type CartItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  quantity: number;
};

const currencySymbols: Record<string, string> = {
  USD: "$",
  INR: "₹",
  GBP: "£",
  EUR: "€",
  JPY: "¥",
};

const CheckoutForm = ({ 
  cart, 
  userCurrency, 
  clientSecret,
  user 
}: { 
  cart: CartItem[]; 
  userCurrency: string; 
  clientSecret: string;
  user: any;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  const getCartTotal = (): number =>
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const getDiscountAmount = (): number => {
    const total = getCartTotal();
    return total > 10 ? total * 0.1 : 0;
  };

  const getDiscountedTotal = (): number => getCartTotal() - getDiscountAmount();

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError("Stripe is not loaded yet. Please wait a moment.");
      return;
    }

    if (!isReady) {
      setError("Payment form is still loading. Please wait a moment.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // First, submit the elements to ensure all fields are filled
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Please complete all payment details");
        setIsProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `https://rocart.vercel.app/checkout-success`, // Update for production
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Clear cart after successful payment
        if (user) {
          await supabase.from("cart_items").delete().eq("user_id", user.id);
        } else {
          localStorage.removeItem("guest_cart");
        }
        localStorage.removeItem("checkout_cart");
        localStorage.removeItem("checkout_currency");
        navigate("/checkout-success");
      } else {
        setError("Payment status is unknown. Please check your email for confirmation.");
        setIsProcessing(false);
      }
    } catch (e: any) {
      console.error("Payment error:", e);
      setError(e.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-4">
      <PaymentElement 
        onReady={() => {
          console.log("PaymentElement is ready");
          setIsReady(true);
        }}
        onLoadError={(error) => {
          console.error("PaymentElement load error:", error);
          setError("Failed to load payment form. Please contact support or try again.");
        }}
      />
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements || !isReady}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
      >
        {!isReady ? "Loading..." : isProcessing ? "Processing..." : `Pay ${currencySymbols[userCurrency]}${getDiscountedTotal().toFixed(2)}`}
      </button>
    </form>
  );
};

const Checkout = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userCurrency, setUserCurrency] = useState("USD");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const hasCreatedPaymentIntent = useRef(false); // Prevent duplicate API calls

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Detailed logging for debugging
    console.log("=== STRIPE KEY DEBUG ===");
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    console.log("Key exists:", !!key);
    console.log("Key type:", key?.startsWith('pk_live_') ? '🔴 LIVE MODE' : '❓ UNKNOWN');
    console.log("Key starts with:", key?.substring(0, 15) || "N/A");
    console.log("========================");
  }, []);

  useEffect(() => {
    const storedCart = localStorage.getItem("checkout_cart");
    const storedCurrency = localStorage.getItem("checkout_currency");

    if (!storedCart) {
      navigate("/");
      return;
    }

    try {
      const parsedCart = JSON.parse(storedCart);
      if (!Array.isArray(parsedCart) || parsedCart.length === 0) {
        navigate("/");
        return;
      }
      setCart(parsedCart);
    } catch {
      navigate("/");
    }

    if (storedCurrency) setUserCurrency(storedCurrency);
  }, [navigate]);

  useEffect(() => {
    if (cart.length === 0 || hasCreatedPaymentIntent.current) return;

    const fetchClientSecret = async () => {
      setIsLoading(true);
      setError(null);
      hasCreatedPaymentIntent.current = true; // Mark as started

      try {
        const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const discount = total > 10 ? total * 0.1 : 0;
        const discountedTotal = total - discount;

        const lineItems = cart.map(item => ({
          price_data: {
            currency: userCurrency.toLowerCase(),
            product_data: { 
              name: item.title,
              images: item.image ? [item.image] : undefined,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        const requestBody = {
          amount: Math.round(discountedTotal * 100),
          currency: userCurrency.toLowerCase(),
          lineItems,
          customerEmail: user?.email || "guest@example.com",
          userId: user?.id || "guest",
        };

        console.log("Creating payment intent (once):", { amount: discountedTotal, currency: userCurrency });

        const response = await fetch("http://localhost:3000/api/create-payment-intent", { // Update to production server URL
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const responseText = await response.text();
        console.log("Response status:", response.status);
        console.log("Response text:", responseText);

        if (!response.ok) {
          let errorMessage = "Failed to create payment intent";
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = responseText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = JSON.parse(responseText);
        
        if (!data.client_secret) {
          throw new Error("No client secret received from server");
        }

        console.log("✅ Payment intent created successfully");
        setClientSecret(data.client_secret);
      } catch (error: any) {
        console.error("Error fetching client secret:", error);
        setError(error.message || "Failed to initialize payment. Please try again.");
        hasCreatedPaymentIntent.current = false; // Allow retry
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientSecret();
  }, [cart, userCurrency, user]); // Only run when these dependencies change

  const getCartTotal = (): number =>
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const getDiscountAmount = (): number => {
    const total = getCartTotal();
    return total > 10 ? total * 0.1 : 0;
  };

  const getDiscountedTotal = (): number => getCartTotal() - getDiscountAmount();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-500">No items in cart.</p>
      </div>
    );
  }

  // Check if Stripe key is configured
  if (!stripePublishableKey || !stripePublishableKey.startsWith('pk_')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-300 mb-4">Configuration Error</h2>
          <div className="text-red-200 mb-4 space-y-2">
            <p className="font-semibold">Stripe key issue detected:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {!stripePublishableKey && <li>VITE_STRIPE_PUBLISHABLE_KEY is not set</li>}
              {stripePublishableKey && stripePublishableKey.startsWith('sk_') && (
                <li>You're using a SECRET key (sk_). You need a PUBLISHABLE key (pk_live_)</li>
              )}
              {stripePublishableKey && !stripePublishableKey.startsWith('pk_') && !stripePublishableKey.startsWith('sk_') && (
                <li>Invalid key format. Should start with 'pk_live_'</li>
              )}
            </ul>
            <p className="text-xs mt-4 bg-black/30 p-3 rounded">
              Current key: {stripePublishableKey ? `${stripePublishableKey.substring(0, 10)}...` : "Not set"}
            </p>
            <p className="text-xs mt-2">
              Get your publishable key from:<br/>
              <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                Stripe Dashboard → API Keys
              </a>
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout min-h-screen bg-[#06100A] py-12 px-4">
      <div className="max-w-6xl mx-auto">
     <img
        src="/checkout/top.png"
        alt=""
        className="absolute top-0 left-0 w-full object-cover z-10"
      />

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Payment Details</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                <p className="text-gray-400">Setting up payment...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 w-full">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => {
                    hasCreatedPaymentIntent.current = false;
                    setError(null);
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                >
                  Retry
                </button>
              </div>
            ) : clientSecret ? (
              <Elements
                key={clientSecret} // Force remount when clientSecret changes
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: { 
                    theme: "night",
                    variables: {
                      colorPrimary: "#10b981",
                      colorBackground: "#1f2937",
                      colorText: "#ffffff",
                      colorDanger: "#ef4444",
                      borderRadius: "8px",
                    },
                  },
                  loader: "auto",
                }}
              >
                <CheckoutForm 
                  cart={cart} 
                  userCurrency={userCurrency} 
                  clientSecret={clientSecret}
                  user={user}
                />
              </Elements>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <p className="text-red-400">Failed to load payment form</p>
                <button
                  onClick={() => {
                    hasCreatedPaymentIntent.current = false;
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            {/* <h2 className="text-2xl font-bold mb-6 text-white">Order Summary</h2> */}
            
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-white/5 p-4 rounded-lg"
                >
                  <div className="relative w-16 h-15 bg-[url('/checkout/cartbg.png')] bg-contain bg-[position:0%_center]">
                    <img
                      src={item.image || '/placeholder.png'}
                      alt={item.title}
                      className="absolute inset-0 w-10 h-10 m-auto object-cover z-10"
                    />

                    {/* Quantity Badge */}
                    <span className="absolute -top-1 -right-1 bg-[url('/checkout/qnty.png')] bg-contain text-white text-[10px] font-semibold px-2 py-[2px] ">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-white font-bold text-xl">{item.title}</h4>
                    {/* <p className="text-gray-400 text-sm">Qty: {item.quantity}</p> */}
                  </div>

                  <p className="text-green-400 font-semibold">
                    {currencySymbols[userCurrency] || "$"}
                    {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/20 pt-4 space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>
                  {currencySymbols[userCurrency] || "$"}
                  {getCartTotal().toFixed(2)}
                </span>
              </div>
              
              {getDiscountAmount() > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount (10%):</span>
                  <span>
                    -{currencySymbols[userCurrency] || "$"}
                    {getDiscountAmount().toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-white text-lg pt-2 border-t border-white/20">
                <span>Total:</span>
                <span>
                  {currencySymbols[userCurrency] || "$"}
                  {getDiscountedTotal().toFixed(2)}
                </span>
              </div>

              {/* Referral Code Input */}
              <div className="mt-4">
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-300 mb-2">
                  Referral Code (Optional)
                </label>
                <input
                  id="referralCode"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter referral code"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;