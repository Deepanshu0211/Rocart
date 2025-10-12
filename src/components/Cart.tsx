import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export const Cart = ({
  cart: initialCart,
  userCurrency,
  exchangeRates,
  onUpdateQuantity,
  onRemoveItem,
}: {
  cart: CartItem[];
  userCurrency: string;
  exchangeRates: Record<string, number>;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Load cart from Supabase on mount
  useEffect(() => {
    const loadCart = async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading cart:", error.message);
        return;
      }

      if (data) {
        setCart(data as CartItem[]);
      }
    };

    loadCart();
  }, []);

  // Sync initial cart with Supabase when new items are added
  useEffect(() => {
    const syncNewItems = async () => {
      const validInitialCart = initialCart.filter(
        (item) => item.id && item.title && item.price > 0
      );

      const prevCartIds = new Set(cart.map((item) => item.id));
      const newItems = validInitialCart.filter((item) => !prevCartIds.has(item.id));

      if (newItems.length > 0) {
        // Update local state immediately (optimistic update)
        setCart((prevCart) => {
          const updatedCart = [...prevCart];
          newItems.forEach((newItem) => {
            const existingIndex = updatedCart.findIndex((item) => item.id === newItem.id);
            if (existingIndex === -1) {
              updatedCart.push(newItem);
              setNotificationMessage(`${newItem.title} Added To Cart!`);
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 3000);
            }
          });
          return updatedCart;
        });

        // Sync to database in background
        newItems.forEach(async (item) => {
          const { error } = await supabase
            .from("cart_items")
            .upsert({
              id: item.id,
              title: item.title,
              price: item.price,
              currency: item.currency,
              image: item.image,
              quantity: item.quantity,
            });
          if (error) console.error("Error upserting item:", error.message);
        });
      }
    };

    syncNewItems();
  }, [initialCart]);

  // Update quantity with instant local update
  const updateLocalQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove from local state immediately
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
      onRemoveItem(itemId);
      
      // Delete from database in background
      supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId)
        .then(({ error }) => {
          if (error) console.error("Error removing item:", error.message);
        });
    } else {
      // Update local state immediately
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      onUpdateQuantity(itemId, newQuantity);

      // Update database in background
      supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId)
        .then(({ error }) => {
          if (error) console.error("Error updating quantity:", error.message);
        });
    }
  };

  // Currency conversion
  const convertPrice = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      console.warn(`Missing exchange rate for ${fromCurrency} to ${toCurrency}`);
      return amount;
    }
    const amountInUSD = fromCurrency === "USD" ? amount : amount / exchangeRates[fromCurrency];
    return toCurrency === "USD" ? amountInUSD : amountInUSD * exchangeRates[toCurrency];
  };

  // Calculate cart totals
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const convertedPrice = convertPrice(item.price, item.currency, userCurrency);
      return total + convertedPrice * item.quantity;
    }, 0);
  };

  const getDiscountedTotal = () => {
    const total = getCartTotal();
    return total > 10 ? total * 0.9 : total;
  };

  const getDiscountAmount = () => {
    const total = getCartTotal();
    return total > 10 ? total * 0.1 : 0;
  };

  // Handle checkout (keep items in cart)
  const handleCheckout = () => {
    if (cart.length === 0) {
      setCheckoutError("Your cart is empty.");
      setIsCheckoutOpen(true);
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);
    setCheckoutSuccess("Checkout successful! (Simulated for demo)");

    setTimeout(() => {
      setIsProcessing(false);
      setIsCheckoutOpen(true);
    }, 2000);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutError(null);
    setCheckoutSuccess(null);
  };

  const handleOpenCart = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Notification Toast */}
      <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] transition-all duration-500 ease-out ${
        showNotification ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-gradient-to-r from-[#06100A] to-[#0a1a0f] backdrop-blur-xl border border-[#3dff87]/30 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-[#3dff87]/20 flex items-center gap-4 min-w-[300px]">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-[#3dff87] rounded-full blur-md opacity-40 animate-pulse"></div>
            <div className="relative bg-[#3dff87] rounded-full p-1.5">
              <svg className="w-5 h-5 text-[#030904]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-white">{notificationMessage}</p>
            <p className="text-xs text-gray-400 mt-0.5">Item successfully added.</p>
          </div>
          <button 
            onClick={() => setShowNotification(false)}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cart Buttons */}
      <>
      {cart.length > 0 && (
        <motion.button
          onClick={handleOpenCart}
          className="fixed bottom-9 left-[43vw] bg-[#2e9c58] text-white px-6 py-3 rounded-full flex items-center justify-center gap-3 shadow-lg z-50"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 10px 25px rgba(62,255,135,0.8)"
          }}
        >
          <img src="/icon/car1.png" alt="Cart Icon" className="w-6 h-6 inline-block" />
          <span className="font-semibold">View Cart</span>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            {cart.length}
          </span>
        </motion.button>
      )}

        <motion.button
          onClick={handleOpenCart}
          className="group fixed top-[40vh] right-0 w-12 h-16 bg-[#3dff87]/20 rounded-l-lg flex items-center justify-center shadow-lg z-50 overflow-hidden"
          whileHover={{
            width: "4.5rem",
            backgroundColor: "#2e9c58",
            boxShadow: "0 0 15px 4px #2e9c58",
            transition: { duration: 0.3, ease: "easeOut" },
          }}
        >
          <motion.div
            className="absolute left-0 top-0 w-[2px] h-full bg-[#3dff87] rounded-full"
            initial={{ x: -10, opacity: 0 }}
            whileHover={{
              x: 0,
              opacity: 1,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
          />
          <motion.svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            whileHover={{
              scale: 1.2,
              transition: { duration: 0.3 },
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </motion.svg>
        </motion.button>
      </>

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 md:w-[400px] bg-[#030904] shadow-2xl border-l border-[#3dff87]/20 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 bg-[#06100A] border-b border-[#3dff87]/10">
            <h3 className="text-white font-bold text-lg">Cart</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <img src="/icon/close.png" alt="Close" className="w-10 h-10 object-contain" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-8 space-y-4">
            {cart.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <img
                  src="/bg/noitem.png"
                  alt="Empty cart"
                  className="w-3/4 max-w-xs object-contain"
                />
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#06100A] p-4 rounded-lg w-full max-w-full"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[url('/icon/cartbg.png')] bg-cover bg-center rounded-lg flex items-center justify-center">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.title}
                        className="w-14 h-14 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm line-clamp-2">{item.title}</h4>
                      <p className="text-[#3DFF88] text-sm">
                        {currencySymbols[userCurrency] || "$"}
                        {(convertPrice(item.price, item.currency, userCurrency) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newQuantity = item.quantity - 1;
                          updateLocalQuantity(item.id, newQuantity);
                        }}
                        className="w-8 h-8 bg-[url('/icon/bg.png')] bg-cover bg-center rounded flex items-center justify-center"
                        disabled={item.quantity <= 0}
                      >
                        <img
                          src="/icon/delete.png"
                          alt="Decrease"
                          className="w-4 h-4 object-contain"
                        />
                      </button>
                      <span className="w-8 h-8 bg-[url('/icon/bg.png')] bg-cover bg-center rounded flex items-center justify-center text-white text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateLocalQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-[url('/icon/bg.png')] bg-cover bg-center rounded flex items-center justify-center"
                      >
                        <img
                          src="/icon/plus.png"
                          alt="Increase"
                          className="w-5 h-5 object-contain"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4">
              <div className="bg-[#06100A] p-4 rounded-[2vw] border border-[#999999] mb-4">
                <div className="flex justify-between font-bold text-sm">
                  <span>
                    <span className="text-[#3dff87]">{currencySymbols[userCurrency] || "$"}</span>
                    <span className="text-white"> {getCartTotal().toFixed(2)}</span>
                  </span>
                </div>
                <div className="flex justify-between text-[#21843B] text-sm border-[#3dff87]/10">
                  <span>Discount Applied at Checkout</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full h-[8vh] bg-[#00A241] hover:bg-[#259951] text-white font-bold py-3 rounded-[1vw] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img
                  className="w-5 h-5 object-contain"
                  alt="Checkout icon"
                  src="/icon/shop.png"
                />
                {isProcessing ? "Processing..." : "Proceed to Checkout"}
              </button>
            </div>
          )}
        </div>
      </div>

      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2621] rounded-lg w-full max-w-md p-6 border border-[#3dff87]/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Checkout</h3>
              <button
                onClick={handleCloseCheckout}
                className="text-gray-400 hover:text-white"
              >
                <img src="/icon/close.png" alt="Close" className="w-6 h-6 object-contain" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">Order Summary</h4>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-300 text-sm">
                    <span className="line-clamp-2">{item.title} (x{item.quantity})</span>
                    <span>
                      {currencySymbols[userCurrency] || "$"}
                      {(convertPrice(item.price, item.currency, userCurrency) * item.quantity).toFixed(2)}
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
            </div>

            {checkoutError && (
              <div className="bg-red-500/10 p-3 rounded-lg text-red-300 text-sm mb-4">
                {checkoutError}
              </div>
            )}
            {checkoutSuccess && (
              <div className="bg-green-500/10 p-3 rounded-lg text-green-300 text-sm mb-4">
                {checkoutSuccess}
              </div>
            )}

            {!checkoutSuccess && (
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-[#3dff87] hover:bg-[#259951] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Try Checkout Again
              </button>
            )}

            <div className="text-center mt-4 text-xs text-gray-400">
              <p>🔒 Secure checkout • SSL encrypted • 256-bit encryption</p>
            </div>
          </div>
        </div>
      )}

      {(isOpen || isCheckoutOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={isCheckoutOpen ? handleCloseCheckout : () => setIsOpen(false)}
        />
      )}
    </>
  );
};