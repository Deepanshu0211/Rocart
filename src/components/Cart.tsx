import { useState, useEffect } from "react";

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

interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    priceV2: { amount: string; currencyCode: string };
    image?: { url: string };
    product: { title: string };
  };
}

export const Cart = ({
  cart: initialCart,
  userCurrency,
  exchangeRates,
  onUpdateQuantity,
  onRemoveItem,
  onRequireAuth,
  checkoutId,
  useShopifyCheckout = true,
  onResetCheckoutId,
}: {
  cart: CartItem[];
  userCurrency: string;
  exchangeRates: Record<string, number>;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onRequireAuth?: () => void;
  checkoutId?: string;
  useShopifyCheckout?: boolean;
  onResetCheckoutId?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const SHOPIFY_DOMAIN: string = (import.meta as any).env.VITE_SHOPIFY_DOMAIN;
  const STOREFRONT_TOKEN: string = (import.meta as any).env.VITE_SHOPIFY_STOREFRONT_TOKEN;

  // Validate environment variables
  useEffect(() => {
    if (useShopifyCheckout && (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN)) {
      setFetchError("Store configuration error. Please check Shopify settings.");
    }
  }, [useShopifyCheckout, SHOPIFY_DOMAIN, STOREFRONT_TOKEN]);

  // Update local cart quantity
  const updateLocalQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prevCart) => {
        const updatedCart = prevCart.filter((item) => item.id !== itemId);
        onRemoveItem(itemId);
        return updatedCart;
      });
    } else {
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        onUpdateQuantity(itemId, newQuantity);
        return updatedCart;
      });
    }
  };

  // Fetch cart details from Shopify
  const fetchCartDetails = async (cartId: string): Promise<CartItem[]> => {
    const cartQuery = `
      query getCart($id: ID!) {
        cart(id: $id) {
          id
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                    image {
                      url
                    }
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: cartQuery,
          variables: { id: `gid://shopify/Cart/${cartId}` },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      if (!data.data?.cart) {
        throw new Error("Cart not found or invalid.");
      }

      const lines = data.data.cart.lines?.edges || [];
      if (lines.length === 0) {
        setFetchError("No items found in Shopify cart. It may be empty or expired.");
        return [];
      }

      return lines
        .map(({ node }: { node: ShopifyCartLine }) => {
          if (!node.merchandise?.id) {
            console.warn("Invalid variant ID for line item:", node);
            return null;
          }
          return {
            id: node.merchandise.id,
            title: node.merchandise.product?.title || node.merchandise.title || "Unknown Product",
            price: parseFloat(node.merchandise.priceV2?.amount || "0"),
            currency: node.merchandise.priceV2?.currencyCode || userCurrency,
            image: node.merchandise.image?.url || "/placeholder.png",
            quantity: node.quantity || 1,
          };
        })
        .filter((item): item is CartItem => item !== null);
    } catch (error: any) {
      console.error("Error fetching cart details:", error.message);
      setFetchError(`Failed to fetch cart: ${error.message}`);
      if (error.message.includes("Cart not found") || error.message.includes("No items found")) {
        onResetCheckoutId?.();
      }
      return [];
    }
  };

  // Load and merge cart data
  useEffect(() => {
    const validInitialCart = initialCart.filter(
      (item) => item.id && item.id.match(/\/\d+$/) && item.title && item.price > 0
    );
    setCart((prevCart) => {
      const mergedCart = [...prevCart];
      validInitialCart.forEach((initialItem) => {
        const existingIndex = mergedCart.findIndex((item) => item.id === initialItem.id);
        if (existingIndex !== -1) {
          mergedCart[existingIndex] = { ...mergedCart[existingIndex], ...initialItem };
        } else {
          mergedCart.push(initialItem);
        }
      });
      return mergedCart;
    });

    const loadCart = async () => {
      if (!checkoutId || !useShopifyCheckout || !SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
        setFetchError(null);
        return;
      }

      const fetchedCart = await fetchCartDetails(checkoutId);
      if (fetchedCart.length > 0) {
        setCart((prevCart) => {
          const mergedCart = [...prevCart];
          fetchedCart.forEach((fetchedItem) => {
            const existingIndex = mergedCart.findIndex((item) => item.id === fetchedItem.id);
            if (existingIndex !== -1) {
              mergedCart[existingIndex] = { ...mergedCart[existingIndex], ...fetchedItem };
            } else {
              mergedCart.push(fetchedItem);
            }
          });
          return mergedCart;
        });
        setFetchError(null);
      } else {
        setCart([]);
        onResetCheckoutId?.();
      }
    };

    loadCart();
  }, [initialCart, checkoutId, useShopifyCheckout, SHOPIFY_DOMAIN, STOREFRONT_TOKEN, onResetCheckoutId]);

  // Clear cart and reset states after successful checkout
  const resetCartState = () => {
    setCart([]);
    setCheckoutSuccess(null);
    setCheckoutError(null);
    setIsCheckoutOpen(false);
    setIsOpen(false);
    setHasProcessed(false);
    setFetchError(null);
    onResetCheckoutId?.();
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

  // Validate Shopify customer token
  const validateToken = async (token: string): Promise<boolean> => {
    const customerQuery = `
      query getCustomer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          email
        }
      }
    `;
    try {
      const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: customerQuery,
          variables: { customerAccessToken: token },
        }),
      });
      const data = await response.json();
      return !!data.data?.customer?.id;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutError("Your cart is empty.");
      setIsCheckoutOpen(true);
      return;
    }

    const invalidItems = cart.filter((item) => !item.id);
    if (invalidItems.length > 0) {
      setCheckoutError(
        `Invalid product variants in cart: ${invalidItems.map((item) => item.title).join(", ")}. Please remove them.`
      );
      setIsCheckoutOpen(true);
      return;
    }

    const token = sessionStorage.getItem("shopifyCustomerToken");
    if (!token) {
      setCheckoutError("Please log in to proceed with checkout.");
      onRequireAuth?.();
      setIsCheckoutOpen(true);
      return;
    }

    const isTokenValid = await validateToken(token);
    if (!isTokenValid) {
      sessionStorage.removeItem("shopifyCustomerToken");
      sessionStorage.removeItem("shopifyTokenExpiry");
      setCheckoutError("Session expired. Please log in again.");
      onRequireAuth?.();
      setIsCheckoutOpen(true);
      return;
    }

    const expiry = sessionStorage.getItem("shopifyTokenExpiry");
    if (expiry && new Date(expiry) < new Date()) {
      sessionStorage.removeItem("shopifyCustomerToken");
      sessionStorage.removeItem("shopifyTokenExpiry");
      setCheckoutError("Session expired. Please log in again.");
      onRequireAuth?.();
      setIsCheckoutOpen(true);
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);
    setCheckoutSuccess(null);
    setHasProcessed(true);

    try {
      const cartCreateMutation = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
              totalQuantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
            }
            userErrors {
              code
              field
              message
            }
          }
        }
      `;

      const lineItems = cart.map((item) => ({
        merchandiseId: item.id,
        quantity: item.quantity,
      }));

      const countryCodeMap: Record<string, string> = {
        USD: "US",
        INR: "IN",
        GBP: "GB",
        EUR: "DE",
        CAD: "CA",
        AUD: "AU",
      };
      const countryCode = countryCodeMap[userCurrency] || "US";

      const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: cartCreateMutation,
          variables: {
            input: {
              lines: lineItems,
              buyerIdentity: {
                customerAccessToken: token,
                countryCode,
              },
            },
          },
        }),
      });

      const data = await response.json();
      if (data.data?.cartCreate?.cart) {
        const cartData = data.data.cartCreate.cart;
        setCheckoutSuccess("Order created! Redirecting to payment...");
        window.location.href = cartData.checkoutUrl;
        setTimeout(() => {
          resetCartState();
        }, 1000);
      } else {
        const errors = data.data?.cartCreate?.userErrors || data.errors || [];
        const errorMessage = errors[0]?.message || "Failed to create checkout. Please try again.";
        setCheckoutError(errorMessage);
        setIsCheckoutOpen(true);
        if (errorMessage.includes("Storefront is disabled") || errorMessage.includes("access denied")) {
          setFetchError("Store is not accessible. It may be in pre-launch mode.");
        }
      }
    } catch (error: any) {
      console.error("Checkout error:", error.message);
      setCheckoutError(`Network error during checkout: ${error.message}`);
      setIsCheckoutOpen(true);
      if (error.message.includes("Storefront is disabled") || error.message.includes("access denied")) {
        setFetchError("Store is not accessible. It may be in pre-launch mode.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutError(null);
    setCheckoutSuccess(null);
    setHasProcessed(false);
  };

  const handleOpenCart = () => {
    setIsOpen(true);
    setFetchError(null);
  };

  return (
    <>
      <button
        onClick={handleOpenCart}
        className="fixed bottom-4 right-4 bg-[#3dff87] hover:bg-[#259951] text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-md shadow-[#3dff87]/20 hover:shadow-[#3dff87]/40 transition-all duration-300 z-50"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            {fetchError && (
              <div className="bg-red-500/10 p-4 rounded-lg text-red-300 text-sm text-center">
                {fetchError}
                <button
                  onClick={() => {
                    setFetchError(null);
                    resetCartState();
                  }}
                  className="ml-2 text-[#3dff87] hover:underline"
                >
                  Start a new cart
                </button>
              </div>
            )}
            {cart.length === 0 && !fetchError ? (
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
                  className="bg-[#06100A] p-4  rounded-lg w-full max-w-full"

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
                        onClick={() => updateLocalQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-[url('/icon/bg.png')] bg-cover bg-center rounded flex items-center justify-center"
                      >
                        <img
                          src="/icon/delete.png"
                          alt="Decrease"
                          className="w-5 h-5 object-contain"
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
            <div className="p-4 ">
              <div className="bg-[#06100A] p-4 rounded-[2vw] border  border-[#999999] mb-4">
                <div className="flex justify-between font-bold text-white text-sm">
                 
                  <span>
                    {currencySymbols[userCurrency] || "$"}
                    {getCartTotal().toFixed(2)}
                  </span>
                  
                </div>
                {/* {getDiscountAmount() > 0 && (
                  <div className="flex justify-between text-[#3dff87] text-sm mt-2">
                  
                    <span>
                      -{currencySymbols[userCurrency] || "$"}
                      {getDiscountAmount().toFixed(2)}
                    </span>
                  </div>
                )} */}
                <div className="flex justify-between text-[#21843B]  text-sm border-[#3dff87]/10">
                  <span>Discount Applied at Checkout</span>
                  {/* <span>
                    {currencySymbols[userCurrency] || "$"}
                    {getDiscountedTotal().toFixed(2)}
                  </span> */}
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