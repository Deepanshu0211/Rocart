import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  // add more as needed
};

const Checkout = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userCurrency, setUserCurrency] = useState("USD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = localStorage.getItem("checkout_cart");
    const storedCurrency = localStorage.getItem("checkout_currency");

    if (!storedCart) {
      navigate("/");
      return;
    }

    try {
      setCart(JSON.parse(storedCart));
    } catch {
      navigate("/");
    }

    if (storedCurrency) setUserCurrency(storedCurrency);
  }, [navigate]);

  const getCartTotal = (): number =>
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const getDiscountAmount = (): number => {
    const total = getCartTotal();
    return total > 10 ? total * 0.1 : 0;
  };

  const getDiscountedTotal = (): number => getCartTotal() - getDiscountAmount();

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const lineItems = cart.map((item) => ({
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

      const cancelUrl = document.referrer || window.location.origin;

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems,
          successUrl: `${window.location.origin}/checkout-success`,
          cancelUrl,
        }),
      });

      if (!response.ok) {
        const resp = await response.json();
        throw new Error(resp.error || "Failed to create checkout session");
      }

      const data = await response.json();

      if (!data.url) throw new Error("No checkout URL received");

      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return <p>No items in cart.</p>;
  }

  return (
    <div className="checkout">
      <h2>Order Summary</h2>
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.title} x{item.quantity} -{" "}
            {currencySymbols[userCurrency] || "$"}
            {(item.price * item.quantity).toFixed(2)}
          </li>
        ))}
      </ul>
      <p>
        Discount: -{currencySymbols[userCurrency] || "$"}
        {getDiscountAmount().toFixed(2)}
      </p>
      <p>
        Total: {currencySymbols[userCurrency] || "$"}
        {getDiscountedTotal().toFixed(2)}
      </p>

      {error && <p className="error">{error}</p>}

      <button onClick={handleCheckout} disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Proceed to Payment"}
      </button>
    </div>
  );
};

export default Checkout;
