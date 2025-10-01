import { useEffect, useState } from "react";
import Header from "../screens/Frame/sections/HeaderSection/HeaderSection";
import MainContentSection from "../screens/Frame/sections/MainContentSection/MainContentSection";

// Fix import.meta.env typing for Vite
const domain: string = (import.meta as any).env.VITE_SHOPIFY_DOMAIN;
const token: string = (import.meta as any).env.VITE_SHOPIFY_STOREFRONT_TOKEN;

const games = [
  { name: "Blox Fruits", icon: "/logo/blox.png" },
  { name: "Murder Mystery 2", icon: "/logo/murder.png" },
  { name: "Adopt Me", icon: "/logo/adopt.png" },
  { name: "Blade Ball", icon: "/logo/blade.png" },
  { name: "Steal a Brainrot", icon: "/logo/steal.png" },
  { name: "Grow a Garden", icon: "/logo/grow.png" },
  { name: "Anime Vanguards", icon: "/logo/anime.png" },
  { name: "Dress To Impress", icon: "/logo/impress.png" },
  { name: "99 nights in the forest", icon: "/logo/99.png" },
];

const categories = [
  "All",
  "Best Sellers",
  "Summer Specials",
  "Knives",
  "Guns",
  "Bundles",
];

const currencySymbols = {
  USD: "$",
  INR: "₹",
  GBP: "£",
  EUR: "€",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  CNY: "¥",
  BRL: "R$",
  MXN: "MX$",
  KRW: "₩",
  SGD: "S$",
  AED: "د.إ",
  SAR: "﷼",
  HKD: "HK$",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  NZD: "NZ$",
  THB: "฿",
  MYR: "RM",
  IDR: "Rp",
  PHP: "₱",
  ZAR: "R",
  TRY: "₺",
  ARS: "$",
  CLP: "$",
  CZK: "Kč",
};

const currencyMap = {
  US: "USD", CA: "CAD", MX: "MXN",
  GB: "GBP", DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR",
  NL: "EUR", BE: "EUR", AT: "EUR", PT: "EUR", IE: "EUR",
  GR: "EUR", FI: "EUR", EU: "EUR", SE: "SEK", DK: "DKK",
  NO: "NOK", CH: "CHF", PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON",
  IN: "INR", JP: "JPY", CN: "CNY", KR: "KRW", SG: "SGD",
  HK: "HKD", TW: "TWD", TH: "THB", MY: "MYR", ID: "IDR",
  PH: "PHP", VN: "VND", PK: "PKR", BD: "BDT",
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", IL: "ILS",
  TR: "TRY", EG: "EGP",
  AU: "AUD", NZ: "NZD",
  BR: "BRL", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN",
  ZA: "ZAR", NG: "NGN", KE: "KES", GH: "GHS",
};

async function fetchProducts() {
  const query = `
    {
      products(first: 10) {
        edges {
          node {
            id
            title
            description
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  
  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }
  
  return data.data.products.edges;
}

async function fetchExchangeRates(baseCurrency = "USD") {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    if (response.ok) {
      const data = await response.json();
      console.log("✓ Exchange rates fetched from primary API");
      return data.rates;
    }
  } catch (error) {
    console.warn("Primary exchange rate API failed:", error);
  }

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    if (response.ok) {
      const data = await response.json();
      console.log("✓ Exchange rates fetched from backup API");
      return data.rates;
    }
  } catch (error) {
    console.warn("Backup exchange rate API failed:", error);
  }

  console.warn("Using fallback exchange rates");
  return {
    USD: 1, INR: 83.50, GBP: 0.78, EUR: 0.91, JPY: 148.20,
    CAD: 1.35, AUD: 1.51, CNY: 7.20, BRL: 5.10, MXN: 17.50,
    KRW: 1330.00, SGD: 1.33, AED: 3.67, SAR: 3.75, HKD: 7.82,
    CHF: 0.86, SEK: 10.45, NOK: 10.55, DKK: 6.82, PLN: 3.95,
    NZD: 1.64, THB: 34.80, MYR: 4.65, IDR: 15450.00, PHP: 55.80,
    ZAR: 18.20, TRY: 34.25, ARS: 950.00, CLP: 940.00, CZK: 22.80,
    VND: 24500.00, PKR: 278.00, BDT: 110.00, QAR: 3.64, KWD: 0.31,
    ILS: 3.72, EGP: 48.50, HUF: 355.00, RON: 4.55, COP: 4100.00,
    PEN: 3.75, NGN: 1580.00, KES: 129.00, GHS: 15.20,
  };
}

function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    console.warn(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
    return amount;
  }
  const amountInUSD = fromCurrency === "USD" ? amount : amount / rates[fromCurrency];
  const convertedAmount = toCurrency === "USD" ? amountInUSD : amountInUSD * rates[toCurrency];
  return convertedAmount;
}

// Types
type ProductNode = {
  id: string;
  title: string;
  description?: string;
  images: { edges: { node: { url: string } }[] };
  variants: { edges: { node: { id: string; price: { amount: string; currencyCode: string } } }[] };
};
type Product = { node: ProductNode };
type CartItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  quantity: number;
};

export const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedGame, setSelectedGame] = useState<{ name: string; icon: string }>(games[1]);
  const [userCurrency, setUserCurrency] = useState<string>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [detectedCountry, setDetectedCountry] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Cart schema version for future-proofing
  const CART_VERSION = "1.0.0";

  useEffect(() => {
    // Load cart from localStorage on mount
    const loadCart = () => {
      try {
        const storedCartData = localStorage.getItem('cart');
        if (storedCartData) {
          const parsedData = JSON.parse(storedCartData);
          // Check version and structure
          if (parsedData.version === CART_VERSION && Array.isArray(parsedData.items)) {
            // Validate each item in the cart
            const validItems = parsedData.items.filter((item: any) => 
              item.id && 
              item.title && 
              typeof item.price === 'number' && 
              item.currency && 
              typeof item.quantity === 'number' && 
              item.quantity > 0
            );
            setCart(validItems);
            console.log("✓ Loaded cart from localStorage");
          } else {
            console.warn("Invalid or outdated cart data, clearing localStorage");
            localStorage.removeItem('cart');
          }
        }
      } catch (e) {
        console.error('Error parsing stored cart:', e);
        localStorage.removeItem('cart');
      }
    };

    loadCart();

    const storedGame = sessionStorage.getItem('selectedGame');
    if (storedGame) {
      try {
        setSelectedGame(JSON.parse(storedGame));
      } catch (e) {
        console.error('Error parsing stored game:', e);
      }
    }

    const checkStoredCurrency = () => {
      const storedCountry = sessionStorage.getItem('userCountry');
      const storedCurrency = sessionStorage.getItem('userCurrency');
      
      if (storedCountry && storedCurrency) {
        setDetectedCountry(storedCountry);
        setUserCurrency(storedCurrency);
        console.log(`✓ Using stored currency: ${storedCurrency} (${storedCountry})`);
        return true;
      }
      return false;
    };

    const detectCountryAndCurrency = async () => {
      if (checkStoredCurrency()) {
        return;
      }

      const apis = [
        {
          url: "https://ipapi.co/json/",
          parser: (data: any) => data.country_code
        },
        {
          url: "https://ipwhois.app/json/",
          parser: (data: any) => data.country_code
        },
        {
          url: "https://api.country.is/",
          parser: (data: any) => data.country
        },
        {
          url: "https://freeipapi.com/api/json",
          parser: (data: any) => data.countryCode
        }
      ];

      for (const api of apis) {
        try {
          const response = await fetch(api.url);
          if (response.ok) {
            const data = await response.json();
            const countryCode = (api.parser(data) || "").toUpperCase();
            
            if (countryCode && (currencyMap as Record<string, string>)[countryCode]) {
              setDetectedCountry(countryCode);
              const detectedCurrency = (currencyMap as Record<string, string>)[countryCode];
              setUserCurrency(detectedCurrency);
              
              sessionStorage.setItem('userCountry', countryCode);
              sessionStorage.setItem('userCurrency', detectedCurrency);
              
              console.log(`✓ Detected country: ${countryCode}, Currency: ${detectedCurrency}`);
              return;
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${api.url}:`, error);
          continue;
        }
      }
      
      console.warn("All geolocation APIs failed, defaulting to USD");
      setUserCurrency("USD");
      setDetectedCountry("US");
      sessionStorage.setItem('userCountry', "US");
      sessionStorage.setItem('userCurrency', "USD");
    };

    const initializeData = async () => {
      try {
        await detectCountryAndCurrency();
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
        
        const productsData = await fetchProducts();
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing data:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(String(error));
        }
        setLoading(false);
      }
    };

    initializeData();

    const handleCurrencyChange = (event: any) => {
      const { country, currency } = event.detail;
      console.log(`✓ Currency changed from Header: ${currency} (${country})`);
      setDetectedCountry(country);
      setUserCurrency(currency);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, []);

  useEffect(() => {
    if (userCurrency && Object.keys(exchangeRates).length === 0) {
      fetchExchangeRates().then(rates => setExchangeRates(rates));
    }
  }, [userCurrency]);

  useEffect(() => {
    // Save cart to localStorage with version
    try {
      localStorage.setItem('cart', JSON.stringify({ version: CART_VERSION, items: cart }));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

  const formatPrice = (product: Product) => {
    if (!product.node.variants.edges[0]) return null;
    const variant = product.node.variants.edges[0].node;
    const originalAmount = parseFloat(variant.price.amount);
    const originalCurrency = variant.price.currencyCode;
    const convertedAmount = convertPrice(
      originalAmount,
      originalCurrency,
      userCurrency,
      exchangeRates
    );
    const symbol = currencySymbols[userCurrency as keyof typeof currencySymbols] || userCurrency + " ";
    const noDecimalCurrencies = ["JPY", "KRW", "VND", "IDR", "CLP"];
    if (noDecimalCurrencies.includes(userCurrency)) {
      return `${symbol}${Math.round(convertedAmount).toLocaleString()}`;
    } else {
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(convertedAmount);
      return `${symbol}${formatted}`;
    }
  };

  const addToCart = (product: Product) => {
    const variant = product.node.variants.edges[0].node;
    const existingItem = cart.find((item) => item.id === variant.id);
    let updatedCart: CartItem[];
    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.id === variant.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          id: variant.id,
          title: product.node.title,
          price: parseFloat(variant.price.amount),
          currency: variant.price.currencyCode,
          image: product.node.images.edges[0]?.node.url,
          quantity: 1,
        },
      ];
    }
    setCart(updatedCart);
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    setCart(updatedCart);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.id === itemId
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(updatedCart);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const convertedPrice = convertPrice(
        item.price,
        item.currency,
        userCurrency,
        exchangeRates
      );
      return total + convertedPrice * item.quantity;
    }, 0);
  };

  const getDiscountedTotal = () => {
    const total = getCartTotal();
    return total > 10 ? total * 0.9 : total;
  };

  return (
    <div className="min-h-screen bg-[#06100A] relative">
      <Header />

      <div className="bg-[#0a1612]/95 border-b border-[#3dff87]/10 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-[95vw] mx-auto px-4 py-3 flex items-center gap-4 flex-wrap sm:flex-nowrap">
          <div className="border-l border-[#3dff87]/30 py-3" />
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3dff87]/20 to-[#259951]/20 p-1.5 flex items-center justify-center border border-[#3dff87]/30">
              <img
                src={selectedGame.icon}
                alt={selectedGame.name}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-white text-base sm:text-lg font-bold tracking-tight whitespace-nowrap">{selectedGame.name}</h1>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#3dff87]/30 scrollbar-track-transparent flex-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeCategory === category
                    ? "text-black bg-gradient-to-r from-[#a9d692] via-[#3DFF88] to-[#259951] shadow-md shadow-[#3dff87]/20"
                    : "text-gray-400 hover:text-white hover:bg-[#1a2621] border border-[#3dff87]/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[#1a2621]/50 border border-[#3dff87]/20 px-3 py-2 rounded-lg flex-shrink-0">
              <span className="text-[#3dff87] text-xs font-bold">{userCurrency}</span>
              {detectedCountry && (
                <span className="text-gray-400 text-xs">({detectedCountry})</span>
              )}
          </div>

          <button className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 flex-shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join Discord
          </button>
        </div>
      </div>

      <div className="max-w-[95vw] mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3dff87]/20 border-t-[#3dff87]"></div>
            <p className="text-gray-400 mt-4">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <div className="text-red-500 text-xl mb-4">⚠️ Error loading products</div>
            <p className="text-gray-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.node.id}
              className="bg-gradient-to-br from-[#1a2621]/80 to-[#0d1814]/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-[#3dff87]/20 hover:border-[#3dff87]/60 transition-all duration-300 hover:scale-[1.02] cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-[#3dff87]/10"
            >
              <div className="relative aspect-square bg-gradient-to-br from-[#1a2621] to-[#0d1814] overflow-hidden">
                {product.node.images.edges[0] ? (
                  <img
                    src={product.node.images.edges[0].node.url}
                    alt={product.node.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-[#3dff87]/30 text-6xl">🎮</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06100A] via-transparent to-transparent opacity-60"></div>
              </div>
              
              <div className="p-4 sm:p-5">
                <h3 className="text-white font-bold text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-[#3dff87] transition-colors">
                  {product.node.title}
                </h3>
                
                {product.node.description && (
                  <p className="text-gray-400 text-xs sm:text-sm mb-4 line-clamp-2">
                    {product.node.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between gap-3">
                  {product.node.variants.edges[0] && (
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium">Price</span>
                      <span className="text-[#3dff87] font-bold text-lg sm:text-xl">
                        {formatPrice(product)}
                      </span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-gradient-to-r from-[#a9d692] via-[#3DFF88] to-[#259951] hover:from-[#3DFF88] hover:to-[#1f7d40] text-black font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-[#3dff87]/20 hover:shadow-[#3dff87]/40 hover:scale-105 whitespace-nowrap text-xs sm:text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && !error && (
          <div className="text-center py-20">
            <div className="text-[#3dff87]/30 text-6xl sm:text-8xl mb-4">🎮</div>
            <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">No products found</h3>
            <p className="text-gray-400 text-sm sm:text-base">Check back later for new items!</p>
          </div>
        )}
      </div>

      <div
        className="w-full h-[0.2vh] mt-auto"
        style={{
          background: "linear-gradient(to right, #3DFF87, #000000)",
        }}
      />

      <MainContentSection />

      <button
        onClick={() => setIsCartOpen(true)}
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
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#3dff87]/10">
            <h3 className="text-white font-bold text-lg sm:text-xl">Cart</h3>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-400 hover:text-white text-xl sm:text-2xl"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3dff87]/30 scrollbar-track-transparent p-4 sm:p-5">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm sm:text-base">Your cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center  gap-3 py-2 sm:py-3 border-b border-[#3dff87]/10 last:border-b-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-[url('/icon/cartbg.png')] bg-cover bg-center bg-no-repeat p-2 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm sm:text-base font-semibold line-clamp-1">{item.title}</h4>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {currencySymbols[userCurrency as keyof typeof currencySymbols]}{convertPrice(item.price, item.currency, userCurrency, exchangeRates).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 bg-[#0a1612] rounded-full p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-[#3dff87] hover:text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-white w-6 sm:w-8 text-center text-xs sm:text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-[#3dff87] hover:text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#3dff87]/10">
              <div className="text-sm border border-[#999999]/10 sm:text-base mb-4 px-4 py-2 rounded-[1vw]">
                <p className="text-white font-semibold">
                   {currencySymbols[userCurrency as keyof typeof currencySymbols]}{getCartTotal().toFixed(2)} {userCurrency}
                </p>
                {getCartTotal() > 10 && (
                  <p className="text-[#21843B] text-xs sm:text-sm">
                    Discounts applied: {currencySymbols[userCurrency as keyof typeof currencySymbols]}{((getCartTotal() - getDiscountedTotal())).toFixed(2)} at Checkout
                  </p>
                )}
              </div>
            <button
              className="w-full bg-[#00A241] text-white font-bold py-2 sm:py-3 rounded-[1vw] hover:bg-[#259951] transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
              onClick={() => setIsCartOpen(false)}
            >
              <img
                className="w-[4vw] sm:w-[3vw] lg:w-[2vw] h-[4vw] sm:h-[3vw] lg:h-[2.5vw] object-contain"
                alt="Cart icon"
                src="/icon/shop.png"
              />
              Checkout
            </button>

          </div>
          )}
        </div>
      </div>
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}
    </div>
  );
};