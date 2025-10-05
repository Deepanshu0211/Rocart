import { useEffect, useState, useRef } from "react";
import Header from "../screens/Frame/sections/HeaderSection/HeaderSection";
import MainContentSection from "../screens/Frame/sections/MainContentSection/MainContentSection";
import { Cart } from "../components/Cart";
import { motion } from "framer-motion"

// Fix import.meta.env typing for Vite
const domain: string = (import.meta as any).env.VITE_SHOPIFY_DOMAIN;
const token: string = (import.meta as any).env.VITE_SHOPIFY_STOREFRONT_TOKEN;

const games = [
  { name: "Grow A Garden", icon: "/kenjo/grow.png" },
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
  NO: "NOK", CH: "CHF", PL: "PLN", CZK: "CZK", HU: "HUF", RO: "RON",
  IN: "INR", JP: "JPY", CN: "CNY", KR: "KRW", SG: "SGD",
  HK: "HKD", TW: "TWD", TH: "THB", MY: "MYR", ID: "IDR",
  PH: "PHP", VN: "VND", PK: "PKR", BD: "BDT",
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", IL: "ILS",
  TR: "TRY", EG: "EGP",
  AU: "AUD", NZ: "NZD",
  BR: "BRL", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN",
  ZA: "ZAR", NG: "NGN", KE: "KES", GH: "GHS",
};

async function fetchProducts(category: string = "All") {
  const query = `
    {
      collection(id: "gid://shopify/Collection/647388135709") {
        id
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
              tags
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

  let filteredProducts = data.data.collection?.products.edges || [];

  if (category !== "All") {
    const categoryTag = category.toLowerCase().replace(/\s+/g, '-');
    filteredProducts = filteredProducts.filter((product: Product) =>
      product.node.tags.some((tag: string) =>
        tag.toLowerCase() === categoryTag ||
        tag.toLowerCase().includes(category.toLowerCase())
      )
    );
  }

  if (filteredProducts.length === 0) {
    console.warn(`No products found for category: ${category}`);
  }

  return filteredProducts;
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

// Types
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

export const GrowAGarden = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedGame, setSelectedGame] = useState<{ name: string; icon: string }>(games[0]);
  const [userCurrency, setUserCurrency] = useState<string>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [detectedCountry, setDetectedCountry] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [currentIndices, setCurrentIndices] = useState<{ [key: string]: number }>({
    bestSellers: 0,
    summerSpecials: 0,
    knives: 0,
    guns: 0,
    bundles: 0,
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [scrollRefs] = useState<{ [key: string]: React.RefObject<HTMLDivElement> }>({
    bestSellers: { current: null },
    summerSpecials: { current: null },
    knives: { current: null },
    guns: { current: null },
    bundles: { current: null },
  });

  // Cart state management with unified localStorage persistence
  const CART_VERSION = "1.0.0";
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const storedCartData = localStorage.getItem('cart');
      if (storedCartData) {
        const parsedData = JSON.parse(storedCartData);
        if (parsedData.version === CART_VERSION && Array.isArray(parsedData.items)) {
          const validItems = parsedData.items.filter((item: any) =>
            item.id &&
            item.title &&
            typeof item.price === 'number' &&
            item.currency &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
          );
          return validItems;
        } else {
          localStorage.removeItem('cart');
        }
      }
    } catch (e) {
      console.error('Error parsing stored cart:', e);
      localStorage.removeItem('cart');
    }
    return [];
  });

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
        const productsData = await fetchProducts(activeCategory);
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
  }, []);

  useEffect(() => {
    const handleCurrencyChange = async (event: Event) => {
      const { country, currency } = (event as CustomEvent).detail;
      setDetectedCountry(country);
      setUserCurrency(currency);
      console.log(`✓ Currency changed to: ${currency} (${country})`);
      try {
        const rates = await fetchExchangeRates(currency);
        setExchangeRates(rates);
      } catch (error) {
        console.error("Error fetching exchange rates after currency change:", error);
      }
    };
    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, [activeCategory]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const productsData = await fetchProducts(activeCategory);
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading products:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(String(error));
        }
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [activeCategory]);

  useEffect(() => {
    if (userCurrency && Object.keys(exchangeRates).length === 0) {
      fetchExchangeRates().then(rates => setExchangeRates(rates));
    }
  }, [userCurrency]);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify({ version: CART_VERSION, items: cart }));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

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
    const symbol = currencySymbols[userCurrency as keyof typeof currencySymbols] || userCurrency;
    const noDecimalCurrencies = ["JPY", "KRW", "VND", "IDR", "CLP"];
    const price = noDecimalCurrencies.includes(userCurrency)
      ? Math.round(convertedAmount).toLocaleString()
      : new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(convertedAmount);
    return { symbol, price };
  };

  const addToCart = (product: Product) => {
    const variant = product.node.variants.edges[0].node;
    const existingItem = cart.find((item) => item.id === variant.id);

    if (existingItem) {
      setCart(cart.map((item) =>
        item.id === variant.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: variant.id,
        title: product.node.title,
        price: parseFloat(variant.price.amount),
        currency: variant.price.currencyCode,
        image: product.node.images.edges[0]?.node.url,
        quantity: 1,
      };
      setCart([...cart, newItem]);
    }

    console.log(`✓ Added to cart: ${product.node.title}`);
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

  const handlePrev = (section: string) => {
    const scrollContainer = scrollRefs[section]?.current;
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const handleNext = (section: string) => {
    const scrollContainer = scrollRefs[section]?.current;
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? products.filter((product) =>
        product.node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.node.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  const renderSection = (sectionId: string, title: string, icon: string, productsToShow: Product[]) => {
    const isGridView = activeSection === sectionId;

    return (
      <section className="space-y-4 bg-[url('/bg/mesh.png')] bg-cover bg-center bg-no-repeat">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xl ${sectionId === 'bestSellers' ? 'text-yellow-500' : 'text-purple-500'}`}>
              <img src={icon} alt={title} className="w-6 h-6 inline-block" />
            </span>
            <h2 className="text-white text-xl font-bold">{title}</h2>
          </div>
          {!isGridView && (
            <div className="flex items-center gap-6">
              <button
                onClick={() => handlePrev(sectionId)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleNext(sectionId)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => setActiveSection(sectionId)}
                className="text-[#3dff87] text-sm hover:underline"
              >
                <img src="/icon/view.png" alt="View All" className="w-15 h-11 inline-block" />
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <div 
            ref={(el) => { if (el) scrollRefs[sectionId].current = el; }}
           className={`${
              isGridView
                ? 'grid grid-cols-5 grid-rows-2 gap-3'
                : 'flex gap-3 overflow-x-auto scrollbar-hide py-4 px-1 cursor-grab active:cursor-grabbing'
            }`}

            style={{ scrollBehavior: isGridView ? 'auto' : 'smooth' }}
            onMouseDown={(e) => {
              if (isGridView) return;
              const el = e.currentTarget;
              const startX = e.pageX - el.offsetLeft;
              const scrollLeft = el.scrollLeft;
              
              const handleMouseMove = (e: MouseEvent) => {
                const x = e.pageX - el.offsetLeft;
                const walk = (x - startX) * 2;
                el.scrollLeft = scrollLeft - walk;
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                el.style.cursor = 'grab';
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
              el.style.cursor = 'grabbing';
            }}
          >
            {productsToShow.length > 0 ? (
              productsToShow.map((product, idx) => (
                <div
                  key={`${sectionId}-${idx}`}
                  className="relative flex-shrink-0 w-[223px] h-[276px] bg-[url('/icon/itembg.png')] bg-cover bg-center bg-no-repeat rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group border border-transparent hover:border-[#3dff87]/50 hover:shadow-lg hover:scale-[1.02]"
                >
                  <div className="relative bg-black h-[210px] w-full rounded-t-2xl overflow-hidden">
                    <div className="absolute top-3 left-3 flex items-center gap-2 text-white text-[10px] font-bold px-2 py-1 rounded-lg bg-[url('/icon/savebg.png')] bg-cover bg-center bg-no-repeat z-20 min-w-[7vw]">
                      <img
                        src="/icon/save.png"
                        alt="save"
                        className="h-[3vh] w-[auto]"
                      />
                     <span className="text-[9px]" style={{ letterSpacing: "0.1em" }}>Save $24</span>
                    </div>




                    <motion.div
                      className="absolute inset-0 bg-[url('/icon/productbg.png')] bg-cover bg-center bg-no-repeat opacity-150"
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />

                    {product.node.images.edges[0] ? (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        whileHover={{
                          rotate: [0, -3, 3, -2, 2, 0],
                          transition: {
                            delay: 0.25,
                            duration: 0.6,
                            ease: "easeInOut",
                          },
                        }}
                      >
                        <motion.img
                          src={product.node.images.edges[0].node.url}
                          alt={product.node.title}
                          className="object-contain relative z-10"
                          style={{ maxWidth: "150px", maxHeight: "120px" }}
                        />
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-[#3dff87]/30 text-4xl">🎮</div>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 rounded-b-2xl bg-[#031C0D]">
                    <h3 className="text-white text-md font-semibold mb-1 line-clamp-2">
                      {product.node.title}
                    </h3>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm">
                        <span className="text-[#3dff87]">{formatPrice(product)?.symbol}</span>
                        <span className="text-white"> {formatPrice(product)?.price}</span>
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="hover:bg-[#031C0D] transition-all"
                      >
                        <img
                          src="/icon/cart.png"
                          alt="Add"
                          className="w-10 h-8 -mt-5 -ml-2 transition-transform duration-300 ease-in-out hover:scale-125"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-8 text-gray-400">
                No products found in this category.
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#06100A] relative">
      <Header />

      <div
        className="bg-[#0a1612]/95 sticky top-0 z-10 backdrop-blur-sm border-b border-[#3dff87]/10 bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: "url('/icon/navbg.png')" }}
      >
        <div className="max-w-[95vw] mx-auto px-4 py-1 flex items-center gap-4 flex-wrap sm:flex-nowrap">
          {/* <div className="border-l border-[#3dff87]/30 py-3" /> */}

          <div className="flex items-center border bg-[#06100A] border-[#9999] rounded-xl px-3 py-1 gap-1 flex-shrink-0">
            <div className="w-7 h-7 flex items-center justify-center">
              <img
                src={selectedGame.icon}
                alt={selectedGame.name}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-white text-base sm:text-sm whitespace-nowrap">{selectedGame.name}</h1>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#3dff87]/30 scrollbar-track-transparent flex-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`relative whitespace-nowrap px-3 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition-all ${
                  activeCategory === category
                    ? "text-white bg-gradient-to-b from-[#030904] to-[#256F31] shadow-md shadow-[#3dff87]/20"
                    : "text-gray-400 hover:text-white hover:bg-[#1a2621]"
                }`}
              >
                {category}
                {/* <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-[2px] bg-white rounded-xl"></span> */}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center flex-shrink-0">
            {!isSearchActive ? (
              <button
                onClick={() => setIsSearchActive(true)}
                className="flex items-center gap-2 bg-[#1a2621]/50 border border-[#3dff87]/20 px-3 py-2 rounded-lg hover:bg-[#1a2621] hover:border-[#3dff87]/40 transition-all"
                title="Search products"
              >
                <svg className="w-5 h-5 text-[#3dff87]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            ) : (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                className="flex items-center gap-2 bg-[#1a2621]/50 border border-[#3dff87]/40 px-3 py-2 rounded-lg"
              >
                <svg className="w-5 h-5 text-[#3dff87]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="bg-transparent text-white text-sm outline-none w-40 placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Clear search"
                  >
                    {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg> */}
                  </button>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchActive(false);
                  }}
                  className="text-gray-400 hover:text-white transition-colors ml-1"
                  title="Close search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
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

      <div className="max-w-[95vw] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {searchQuery && (
          <div className="bg-[#1a2621]/30 border border-[#3dff87]/20 rounded-lg p-4">
            <p className="text-gray-300 text-sm">
              Search results for: <span className="text-[#3dff87] font-semibold">"{searchQuery}"</span>
              {filteredProducts.length > 0 && (
                <span className="text-gray-400 ml-2">({filteredProducts.length} found)</span>
              )}
            </p>
          </div>
        )}

        {activeSection && (
          <button
            onClick={() => setActiveSection(null)}
            className="mb-6 text-sm text-gray-300 hover:underline flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

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
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e]"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <>
            {(!activeSection || activeSection === "bestSellers") && (
              renderSection("bestSellers", "Best Sellers", "/icon/crown.png", filteredProducts)
            )}
            {(!activeSection || activeSection === "summerSpecials") && (
              renderSection("summerSpecials", "Summer Specials", "/icon/summer.png", filteredProducts)
            )}
            {(!activeSection || activeSection === "knives") && (
              renderSection("knives", "Knives", "/icon/knive.png", filteredProducts)
            )}
            {(!activeSection || activeSection === "guns") && (
              renderSection("guns", "Guns", "/icon/gun.png", filteredProducts)
            )}
            {(!activeSection || activeSection === "bundles") && (
              renderSection("bundles", "Bundles", "/icon/bundle.png", filteredProducts)
            )}
          </>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-[#3dff87]/30 text-6xl sm:text-8xl mb-4">🔍</div>
            <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">No products found</h3>
            <p className="text-gray-400 text-sm sm:text-base mb-4">
              {searchQuery 
                ? `No results found for "${searchQuery}"`
                : activeCategory !== "All" 
                  ? `No products found in "${activeCategory}".` 
                  : "Check back later for new items!"}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchActive(false);
                }}
                className="px-4 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e] transition-colors"
              >
                Clear Search
              </button>
            )}
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

export default GrowAGarden;