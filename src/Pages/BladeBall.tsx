import { useEffect, useState, useRef } from "react";
import Header from "../screens/Frame/sections/HeaderSection/HeaderSection";
import MainContentSection from "../screens/Frame/sections/MainContentSection/MainContentSection";
import { Cart } from "../components/Cart";
import { motion } from "framer-motion";

// Fix import.meta.env typing for Vite
const domain: string = (import.meta as any).env.VITE_SHOPIFY_DOMAIN;
const token: string = (import.meta as any).env.VITE_SHOPIFY_STOREFRONT_TOKEN;

const games = [
  { name: "BladeBall", icon: "/logo/blade.png" },
];

const currencySymbols = {
  USD: "$", INR: "₹", GBP: "£", EUR: "€", JPY: "¥",
  CAD: "C$", AUD: "A$", CNY: "¥", BRL: "R$", MXN: "MX$",
  KRW: "₩", SGD: "S$", AED: "د.إ", SAR: "﷼", HKD: "HK$",
  CHF: "CHF", SEK: "kr", NOK: "kr", DKK: "kr", PLN: "zł",
  NZD: "NZ$", THB: "฿", MYR: "RM", IDR: "Rp", PHP: "₱",
  ZAR: "R", TRY: "₺", ARS: "$", CLP: "$", CZK: "Kč",
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

async function fetchProductById(productId: string) {
  const query = `
    {
      product(id: "${productId}") {
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
        tags
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

  const productEdge = {
    node: data.data.product
  };

  return [productEdge];
}

type CartItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  quantity: number;
};

type ProductNode = {
  id: string;
  title: string;
  description?: string;
  images: { edges: { node: { url: string } }[] };
  variants: { edges: { node: { id: string; price: { amount: string; currencyCode: string } } }[] };
  tags: string[];
};
type Product = { node: ProductNode };

export const BladeBall = () => {
  const [userCurrency, setUserCurrency] = useState<string>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [detectedCountry, setDetectedCountry] = useState<string>("");
  const [selectedGame] = useState<{ name: string; icon: string }>(games[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(2000); // New state for quantity
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
        { url: "https://ipapi.co/json/", parser: (data: any) => data.country_code },
        { url: "https://ipwhois.app/json/", parser: (data: any) => data.country_code },
        { url: "https://api.country.is/", parser: (data: any) => data.country },
        { url: "https://freeipapi.com/api/json", parser: (data: any) => data.countryCode },
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

        setLoading(true);
        setError(null);
        const productId = "gid://shopify/Product/9980610281757";
        const productsData = await fetchProductById(productId);
        if (productsData.length > 0) {
          setProduct(productsData[0]);
        }
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
  }, []);

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchActive && searchInputRef.current && !searchInputRef.current.parentElement?.contains(event.target as Node)) {
        if (!searchQuery) {
          setIsSearchActive(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchActive, searchQuery]);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  function convertPrice(
    amount: number,
    originalCurrency: string,
    targetCurrency: string,
    rates: Record<string, number>
  ): number {
    if (originalCurrency === targetCurrency) return amount;
    if (!rates[originalCurrency] || !rates[targetCurrency]) {
      console.warn(`Exchange rate not found for ${originalCurrency} to ${targetCurrency}`);
      return amount;
    }
    const amountInUSD = originalCurrency === "USD" ? amount : amount / rates[originalCurrency];
    return amountInUSD * rates[targetCurrency];
  }

  const formatPrice = (amount: number, currency: string) => {
    const symbol = currencySymbols[currency as keyof typeof currencySymbols] || currency + " ";
    const noDecimalCurrencies = ["JPY", "KRW", "VND", "IDR", "CLP"];
    if (noDecimalCurrencies.includes(currency)) {
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    } else {
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
      return `${symbol}${formatted}`;
    }
  };

  const calculateTotalPrice = () => {
    if (!product?.node.variants.edges[0]) return "$0.00";
    const variant = product.node.variants.edges[0].node;
    const originalAmount = parseFloat(variant.price.amount);
    const originalCurrency = variant.price.currencyCode;
    const convertedAmount = convertPrice(
      originalAmount,
      originalCurrency,
      userCurrency,
      exchangeRates
    );
    const total = convertedAmount * (quantity / 1000); // Assuming price is per 1000 units
    return formatPrice(total, userCurrency);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const variant = product.node.variants.edges[0].node;
    
    const existingItem = cart.find((item) => item.id === variant.id);

    if (existingItem) {
      setCart(cart.map((item) =>
        item.id === variant.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: variant.id,
        title: product.node.title,
        price: parseFloat(variant.price.amount),
        currency: variant.price.currencyCode,
        image: product.node.images.edges[0]?.node.url,
        quantity: quantity,
      };
      setCart([...cart, newItem]);
    }
    console.log(`✓ Added to cart: ${product.node.title} (Quantity: ${quantity})`);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== itemId));
    } else {
      setCart(cart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 2000;
    const clampedValue = Math.max(2000, Math.min(300000, value));
    setQuantity(clampedValue);
  };

  const renderTokenSection = () => {
    return (
      <div className="min-h-screen bg-[#06100A] bg-[url('/bg/mesh.png')] bg-repeat bg-[length:100vw_100vh] relative">
        <Header />
          <div className="sticky top-0 z-10 bg-[#06100A]/50 backdrop-blur-md ">
           <div className="max-w-[95vw] mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-4">
           <div className="flex ml-1 items-center py-1 gap-2 flex-shrink-0">
              <div className="w-9 h-9 flex items-center justify-center">
                <div
                  className="relative w-24 h-24 flex items-center justify-center"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={selectedGame.icon}
                    alt={selectedGame.name}
                    className="w-8 h-8 rounded-md object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                  />
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={isDropdownOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`absolute left-[3vw] top-[6vh] rounded-2xl py-2 min-w-[20vw] backdrop-blur-2xl backdrop-saturate-200 bg-[#0C1610] z-[1000] shadow-lg shadow-[#3dff87]/10 ${
                      isDropdownOpen ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {[
                      { id: 1, name: "Murder Mystery 2", icon: "/kenjo/mur.png", route: "/murderMystery" },
                      { id: 2, name: "Grow A Garden", icon: "/game/garden.png", route: "/GrowAGarden" },
                      { id: 3, name: "Steal A Brainrot", icon: "/logo/steal.png", route: "/StealABrainrot" },
                      { id: 4, name: "Adopt Me!", icon: "/logo/adopt.png", route: "/AdoptMe" },
                      { id: 5, name: "Blade Ball", icon: "/logo/blade.png", route: "/BladeBall" },
                      { id: 6, name: "Blox Fruits", icon: "/logo/blox.png", route: "/BloxFruits" },
                      { id: 7, name: "99 Nights In The Forest", icon: "/logo/99.png", route: "/NinetyNineNights" },
                      { id: 8, name: "Anime Vanguards", icon: "/logo/anime.png", route: "/AnimeVanguards" },
                      { id: 9, name: "Dress To Impress", icon: "/logo/impress.png", route: "/DressToImpress" },
                    ].map(game => (
                      <div key={game.id} className="w-full">
                        <button
                          className="flex items-center gap-3 px-3 py-2 hover:bg-[#3dff87]/10 transition-colors text-white text-base font-semibold w-full text-left rounded-xl"
                          onClick={() => window.location.href = game.route}
                        >
                          <img src={game.icon} alt={game.name} className="w-8 h-8 object-contain rounded-lg" />
                          {game.name}
                        </button>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
              <h1
                className="
                  text-white text-2xl font-bold sm:text-lg whitespace-nowrap ml-3
                  transition-transform duration-300 ease-in-out
                  hover:scale-105 
                  hover:drop-shadow-lg cursor-pointer
                "
              >
                {selectedGame.name}
              </h1>
            </div>

          <button className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 flex-shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord
            </button>
          </div>
          </div>


        <div className="max-w-[95vw] mx-auto px-4 sm:px-6 py-12 ">
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3dff87]/20 border-t-[#3dff87]"></div>
              <p className="text-gray-400 mt-4">Loading product...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="text-red-500 text-xl mb-4">⚠️ Error loading product</div>
              <p className="text-gray-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e]"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && product && (
            <div className="flex justify-center items-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-[10vw] text-center mx-auto">
                {/* Image Card */}
                <div className="w-[30vw] h-[50vh] shadow-2xl rounded-2xl bg-[#030904] overflow-hidden  flex items-center justify-center">
                  {product.node.images.edges[0]?.node.url ? (
                    <img
                      src={product.node.images.edges[0].node.url}
                      alt={product.node.title}
                      className="w-[95%] h-[95%] object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1a2621] flex items-center justify-center">
                      <span className="text-[#3dff87]/30 text-5xl">🎮</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 text-white space-y-4 sm:text-left text-center">
                  <h2 className="text-3xl font-bold text-left">{product.node.title}</h2>

                  {product.node.description && (
                    <p className="text-md text-gray-400 text-left">{product.node.description}</p>
                  )}

                  <p className="font-semibold text-left bg-gradient-to-r from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent">
                    5$ per 1000
                  </p>

                  <p className="text-xl sm:text-3xl font-semibold">
                    <span className="text-[#3dff87]/70">
                      {currencySymbols[userCurrency as keyof typeof currencySymbols] || userCurrency + " "}
                    </span>
                    <span className="text-white ml-1">
                      {formatPrice(parseFloat(product.node.variants.edges[0].node.price.amount), userCurrency)
                        .replace(
                          currencySymbols[userCurrency as keyof typeof currencySymbols] || userCurrency,
                          ""
                        )
                        .trim()}
                    </span>
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-6">
                    <p className="font-semibold bg-gradient-to-r from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent whitespace-nowrap">
                      Quantity
                    </p>
                    <input
                      type="number"
                      value={quantity}
                      min="2000"
                      max="300000"
                      className="w-36 py-2 px-4 bg-[#1a2621] text-white border border-[#276838] rounded-2xl focus:outline-none focus:border-[#3dff87] no-spin"
                      onChange={handleQuantityChange}
                    />

                    <span className="font-semibold bg-gradient-to-r from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent">
                      (min 2000 - max 300000)
                    </span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex items-center justify-center gap-2 w-4/5 px-6 py-3 bg-[#00a241] text-white rounded-2xl font-semibold hover:bg-[#2dd66e] transition-colors"
                    >
                      <img src="/icon/car2.png" alt="cart" className="w-6 h-6" />
                      <span>Add to Cart</span>
                    </button>


                    <p className="text-md font-medium text-white flex items-center gap-1">
                      Total: <span className="text-[#b9b9b9]">{calculateTotalPrice()}</span>
                    </p>

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <MainContentSection />
        <Cart
          cart={cart}
          userCurrency={userCurrency}
          exchangeRates={exchangeRates}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
        />
      </div>
    );
  };

  return renderTokenSection();
};

export default BladeBall;