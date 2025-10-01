import { useState } from "react";

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
const currencySymbols = {
  USD: "$", INR: "₹", GBP: "£", EUR: "€", JPY: "¥",
  CAD: "C$", AUD: "A$", CNY: "¥", BRL: "R$", MXN: "MX$",
  KRW: "₩", SGD: "S$", AED: "د.إ", SAR: "﷼", HKD: "HK$",
  CHF: "CHF", SEK: "kr", NOK: "kr", DKK: "kr", PLN: "zł",
  NZD: "NZ$", THB: "฿", MYR: "RM", IDR: "Rp", PHP: "₱",
  ZAR: "R", TRY: "₺", ARS: "$", CLP: "$", CZK: "Kč",
};

export const Cart = ({ 
  cart,
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

  const convertPrice = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      console.warn(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
      return amount;
    }
    const amountInUSD = fromCurrency === "USD" ? amount : amount / exchangeRates[fromCurrency];
    return toCurrency === "USD" ? amountInUSD : amountInUSD * exchangeRates[toCurrency];
  };

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

  
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#3dff87] hover:bg-[#259951] text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-md shadow-[#3dff87]/20 hover:shadow-[#3dff87]/40 transition-all duration-300 z-50"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-4/5 lg:w-[400px] bg-[#1a2621] shadow-2xl border-l border-[#3dff87]/20 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#3dff87]/10">
            <h3 className="text-white font-bold text-lg sm:text-xl">Cart</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xl sm:text-2xl"
            >
              <img src="/icon/close.png" alt="Close" className="w-10 h-10 object-contain" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3dff87]/30 scrollbar-track-transparent p-4 sm:p-5">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm sm:text-base">Your cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
               <div 
                  key={item.id} 
                  className="flex items-center gap-3 py-2 sm:py-3 border-b border-[#3dff87]/10 last:border-b-0"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0a1612] bg-[url('/icon/cartbg.png')] bg-cover bg-center bg-no-repeat rounded-lg flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.title}
                      className="w-12 h-12 sm:w-10 sm:h-10 object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm sm:text-base font-semibold line-clamp-1">{item.title}</h4>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {currencySymbols[userCurrency as keyof typeof currencySymbols]}
                      {convertPrice(item.price, item.currency, userCurrency).toFixed(2)}
                    </p>
                  </div>
                <div className="flex items-center gap-1">
                  {/* Decrease / Delete */}
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 bg-[url('/icon/bg.png')] bg-cover bg-center bg-no-repeat rounded-lg flex items-center justify-center"
                  >
                    <img
                      src="/icon/delete.png"
                      alt="Decrease"
                      className="w-5 h-5 object-contain"
                    />
                  </button>

                  {/* Quantity */}
                  <span className="w-8 h-8 bg-[url('/icon/bg.png')] bg-cover bg-center bg-no-repeat rounded-lg flex items-center justify-center text-white text-sm font-medium">
                    {item.quantity}
                  </span>

                  {/* Increase */}
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 bg-[url('/icon/bg.png')] bg-cover bg-center bg-no-repeat rounded-lg flex items-center justify-center"
                  >
                    <img
                      src="/icon/plus.png"
                      alt="Increase"
                      className="w-5 h-5 object-contain"
                    />
                  </button>
                </div>

                </div>
              ))
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl border-t border-[#3dff87]/10">
              <div className="text-sm border border-[#999999]/10 sm:text-base mb-4 px-4 py-2 rounded-lg">
                <p className="text-white font-semibold">
                  {currencySymbols[userCurrency as keyof typeof currencySymbols]}
                  {getCartTotal().toFixed(2)} {userCurrency}
                </p>
                {getCartTotal() > 10 && (
                  <p className="text-[#21843B] text-xs sm:text-sm">
                    Discounts applied: {currencySymbols[userCurrency as keyof typeof currencySymbols]}
                    {((getCartTotal() - getDiscountedTotal())).toFixed(2)} at Checkout
                  </p>
                )}
              </div>
              <button
                className="w-full bg-[#00A241] text-white font-bold py-2 sm:py-3 rounded-[1em] hover:bg-[#259951] transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <img
                  className="w-6 h-6 object-contain"
                  alt="Cart icon"
                  src="/icon/shop.png"
                />
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};