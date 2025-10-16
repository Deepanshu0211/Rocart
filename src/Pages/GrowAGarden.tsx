import { useEffect, useState, useRef } from "react";
import Header from "../screens/Frame/sections/HeaderSection/HeaderSection";
import MainContentSection from "../screens/Frame/sections/MainContentSection/MainContentSection";
import { Cart } from "../components/Cart";
import { motion } from "framer-motion";
import React from "react";
import { TrustedBySection } from "../screens/Frame/sections/TrustedBySection/TrustedBySection";
import { FAQSection } from "../screens/Frame/sections/FAQSection/FAQSection";
import WeAre from "./WeAre";
import { createClient } from "@supabase/supabase-js";
import { AuthenticationManager } from "../components/auth";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// FIXED: Module-level caching without hooks
let exchangeRatesCache: Record<string, number> = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const categoryIcons: { [key: string]: string } = {
  "Best Sellers": "/icon/crown.png",
  "Summer Specials": "/icon/summer.png",
  Knives: "/icon/knive.png",
  Guns: "/icon/gun.png",
  Bundles: "/icon/bundle.png",
};

const games = [
  { name: "Grow A Garden", icon: "/kenjo/grow.png" },
];

const categories = [
  "All",
  "Best Sellers",
  "Bundles",
  "Summer Specials",
  "Knives",
  "Guns",
];

const currencySymbols = {
  USD: "$", INR: "₹", GBP: "£", EUR: "€", JPY: "¥",
  CAD: "C$", AUD: "A$", CNY: "¥", BRL: "R$", MXN: "MX$",
  KRW: "₩", SGD: "S$", AED: "د.إ", SAR: "ر.س", HKD: "HK$",
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

// FIXED: Always fetch USD base rates with caching
async function fetchExchangeRates(forceRefresh = false): Promise<Record<string, number>> {
  const now = Date.now();
  
  // Check cache first
  if (!forceRefresh && cacheTimestamp > 0 && (now - cacheTimestamp) < CACHE_DURATION && 
      Object.keys(exchangeRatesCache).length > 0) {
    console.log("✓ Using cached USD exchange rates");
    return exchangeRatesCache;
  }

  try {
    console.log("Fetching fresh USD exchange rates...");
    // ALWAYS fetch USD base rates for consistency
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    if (response.ok) {
      const data = await response.json();
      exchangeRatesCache = data.rates;
      cacheTimestamp = now;
      console.log("✓ USD exchange rates fetched from primary API");
      return data.rates;
    }
  } catch (error) {
    console.warn("Primary exchange rate API failed:", error);
  }

  try {
    // Backup API - always USD base
    const response = await fetch(`https://open.er-api.com/v6/latest/USD`);
    if (response.ok) {
      const data = await response.json();
      exchangeRatesCache = data.rates;
      cacheTimestamp = now;
      console.log("✓ USD exchange rates fetched from backup API");
      return data.rates;
    }
  } catch (error) {
    console.warn("Backup exchange rate API failed:", error);
  }

  console.warn("Using fallback USD exchange rates");
  const fallbackRates = {
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
  
  exchangeRatesCache = fallbackRates;
  cacheTimestamp = now;
  return fallbackRates;
}

// FIXED: Proper price conversion through USD intermediate
function convertPrice(
  amount: number,
  originalCurrency: string,
  targetCurrency: string,
  rates: Record<string, number>
): number {
  console.log(`🔄 Converting: ${amount} ${originalCurrency} → ${targetCurrency}`);
  
  if (originalCurrency === targetCurrency) {
    console.log(`✓ Same currency, no conversion needed`);
    return amount;
  }
  
  // Validate rates exist
  if (!rates[originalCurrency] || !rates[targetCurrency] || !rates.USD) {
    console.warn(`⚠️ Missing exchange rates for ${originalCurrency} → ${targetCurrency}`);
    console.warn("Available rates:", Object.keys(rates));
    return amount; // Fallback to original amount
  }
  
  try {
    // Convert original → USD → target (proper cross-rate calculation)
    const usdAmount = originalCurrency === "USD" ? amount : amount / rates[originalCurrency];
    const targetAmount = usdAmount * rates[targetCurrency];
    
    const result = parseFloat(targetAmount.toFixed(2));
    console.log(`✓ ${amount} ${originalCurrency} = ${result} ${targetCurrency} (via USD: ${usdAmount.toFixed(2)})`);
    return result;
  } catch (error) {
    console.error("❌ Price conversion error:", error);
    return amount;
  }
}

// Types
type CartItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  quantity: number;
  user_id?: string;
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedGame] = useState<{ name: string; icon: string }>(games[0]);
  const [userCurrency, setUserCurrency] = useState<string>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [detectedCountry, setDetectedCountry] = useState<string>("US");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<number | null>(null);

  const auth = AuthenticationManager();

  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({
    bestSellers: null,
    summerSpecials: null,
    knives: null,
    guns: null,
    bundles: null,
  });

  const mainRef = useRef<HTMLDivElement | null>(null);
  const [hideLogo, setHideLogo] = useState<boolean>(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const GUEST_CART_KEY = "guest_cart";

  // FIXED: Load exchange rates on mount
  useEffect(() => {
    fetchExchangeRates(true).then(rates => {
      setExchangeRates(rates);
      console.log("✓ Initial USD exchange rates loaded");
    });
  }, []);

  // FIXED: Currency change handler - always use USD rates
  useEffect(() => {
    const handleCurrencyChange = async (event: Event) => {
      const { country, currency } = (event as CustomEvent).detail;
      console.log(`🌍 Currency changed: ${country} → ${currency}`);
      
      setDetectedCountry(country);
      setUserCurrency(currency);
      
      // Always fetch fresh USD rates for conversion
      try {
        const usdRates = await fetchExchangeRates(true);
        setExchangeRates(usdRates);
        console.log("✓ Fresh USD rates loaded for currency conversion");
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
      
      sessionStorage.setItem('userCountry', country);
      sessionStorage.setItem('userCurrency', currency);
    };
    
    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  // FIXED: Initialize with exchange rates first
  useEffect(() => {
    const checkStoredCurrency = () => {
      const storedCountry = sessionStorage.getItem('userCountry');
      const storedCurrency = sessionStorage.getItem('userCurrency');

      if (storedCountry && storedCurrency && currencyMap[storedCountry as keyof typeof currencyMap]) {
        setDetectedCountry(storedCountry);
        setUserCurrency(storedCurrency);
        console.log(`✓ Using stored currency: ${storedCurrency}`);
        return true;
      }
      return false;
    };

    const detectCountryAndCurrency = async () => {
      if (checkStoredCurrency()) return;

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

            if (countryCode && currencyMap[countryCode as keyof typeof currencyMap]) {
              const detectedCurrency = currencyMap[countryCode as keyof typeof currencyMap];
              setDetectedCountry(countryCode);
              setUserCurrency(detectedCurrency);
              sessionStorage.setItem('userCountry', countryCode);
              sessionStorage.setItem('userCurrency', detectedCurrency);
              console.log(`✓ Detected: ${countryCode} → ${detectedCurrency}`);
              return;
            }
          }
        } catch (error) {
          console.warn(`Geolocation API failed: ${api.url}`, error);
        }
      }

      console.log("Defaulting to USD");
      setUserCurrency("USD");
      setDetectedCountry("US");
    };

    const initializeData = async () => {
      try {
        // FIXED: Load exchange rates FIRST
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
        
        await detectCountryAndCurrency();
        
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("game", "GrowAGarden")
          .order("title", { ascending: true });

        if (error) throw new Error(`Supabase error: ${error.message}`);

        // FIXED: Ensure USD default for products
        const mappedProducts = (data || []).map((p: any) => ({
          node: {
            id: p.id,
            title: p.title,
            description: p.description,
            images: { edges: [{ node: { url: p.image_url || "" } }] },
            variants: { 
              edges: [{ 
                node: { 
                  id: p.id, 
                  price: { 
                    amount: (p.price || 0).toString(),
                    currencyCode: p.currency || "USD" // Default USD
                  } 
                } 
              }] 
            },
            tags: Array.isArray(p.tags) ? p.tags : [],
          },
        }));

        setAllProducts(mappedProducts);
        setProducts(mappedProducts);
        setLoading(false);
        console.log(`✓ Loaded ${mappedProducts.length} products`);
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Load cart
  useEffect(() => {
    const loadCart = async () => {
      if (auth.user) {
        const { data, error } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading cart:", error.message);
          return;
        }
        setCart(data as CartItem[] || []);
      } else {
        const guestCart = localStorage.getItem(GUEST_CART_KEY);
        setCart(guestCart ? JSON.parse(guestCart) : []);
      }
    };
    loadCart();
  }, [auth.user]);

  // Sync local cart on login
  useEffect(() => {
    if (auth.user) {
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      if (guestCart) {
        const localCart: CartItem[] = JSON.parse(guestCart);
        localCart.forEach(async (item) => {
          await supabase.from("cart_items").upsert({
            ...item,
            user_id: auth.user!.id,
          });
        });
        localStorage.removeItem(GUEST_CART_KEY);
      }
    }
  }, [auth.user]);

  // Category filtering
  useEffect(() => {
    if (activeCategory === "All") {
      setProducts(allProducts);
    } else {
      const categoryTag = activeCategory.toLowerCase().replace(/\s+/g, '-');
      const filtered = allProducts.filter((product) =>
        product.node.tags.some((tag: string) =>
          tag.toLowerCase() === categoryTag ||
          tag.toLowerCase().includes(activeCategory.toLowerCase())
        )
      );
      setProducts(filtered);
    }
  }, [activeCategory, allProducts]);

  // Logo hide on scroll
  useEffect(() => {
    const onScroll = () => setHideLogo(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // FIXED: Add to cart with currency conversion
  const addToCart = async (product: Product) => {
    const variant = product.node.variants.edges[0].node;
    const originalPrice = parseFloat(variant.price.amount);
    const originalCurrency = variant.price.currencyCode;
    
    // FIXED: Convert to user's currency for storage
    const convertedPrice = convertPrice(
      originalPrice, 
      originalCurrency, 
      userCurrency, 
      exchangeRates
    );
    
    const existingItem = cart.find((item) => item.id === variant.id);
    const newItem: CartItem = {
      id: variant.id,
      title: product.node.title,
      price: convertedPrice,
      currency: userCurrency,
      image: product.node.images.edges[0]?.node.url,
      quantity: existingItem ? existingItem.quantity + 1 : 1,
      user_id: auth.user?.id,
    };

    try {
      if (auth.user) {
        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;
          setCart(cart.map((item) =>
            item.id === variant.id ? { ...item, quantity: newQuantity } : item
          ));
          await supabase
            .from("cart_items")
            .update({ quantity: newQuantity })
            .eq("id", variant.id)
            .eq("user_id", auth.user.id);
        } else {
          setCart([...cart, newItem]);
          await supabase.from("cart_items").upsert(newItem);
        }
      } else {
        const updatedCart = existingItem
          ? cart.map((item) =>
              item.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
            )
          : [...cart, newItem];
        setCart(updatedCart);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedCart));
      }
      console.log(`✓ Added: ${product.node.title} (${convertedPrice} ${userCurrency})`);
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        setCart(cart.filter((item) => item.id !== itemId));
        if (auth.user) {
          await supabase.from("cart_items").delete().eq("id", itemId).eq("user_id", auth.user.id);
        } else {
          const updatedCart = cart.filter((item) => item.id !== itemId);
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedCart));
        }
      } else {
        setCart(cart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ));
        if (auth.user) {
          await supabase
            .from("cart_items")
            .update({ quantity: newQuantity })
            .eq("id", itemId)
            .eq("user_id", auth.user.id);
        } else {
          const updatedCart = cart.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          );
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedCart));
        }
      }
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setCart(cart.filter((item) => item.id !== itemId));
      if (auth.user) {
        await supabase.from("cart_items").delete().eq("id", itemId).eq("user_id", auth.user.id);
      } else {
        const updatedCart = cart.filter((item) => item.id !== itemId);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedCart));
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
    }
  };

  const handlePrev = (section: string) => {
    scrollRefs.current[section]?.scrollBy({ left: -240, behavior: 'smooth' });
  };

  const handleNext = (section: string) => {
    scrollRefs.current[section]?.scrollBy({ left: 240, behavior: 'smooth' });
  };

  // FIXED: Price formatting with conversion
  const formatPrice = (product: Product) => {
    if (!product.node.variants.edges[0]) return null;
    
    const variant = product.node.variants.edges[0].node;
    const originalAmount = parseFloat(variant.price.amount);
    const originalCurrency = variant.price.currencyCode || "USD";
    
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

  const filteredProducts = searchQuery
    ? products.filter((product) =>
        product.node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.node.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // Dropdown handlers (unchanged)
  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      window.clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = window.setTimeout(() => {
      setIsDropdownOpen(false);
      dropdownTimeoutRef.current = null;
    }, 180);
  };

  const renderSection = (sectionId: string, title: string, icon: string, productsToShow: Product[]) => {
    const isGridView = activeSection === sectionId;

    return (
      <section className="mt-[-20px] space-y-[-2] bg-[url('/bg/mesh.png')] bg-cover bg-center bg-no-repeat">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xl ${sectionId === 'bestSellers' ? 'text-yellow-500' : 'text-purple-500'}`}>
              <img src={icon} alt={title} className="w-6 h-6 inline-block" />
            </span>
            <h2 className="text-white text-xl font-bold">{title}</h2>
          </div>
          {!isGridView && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePrev(sectionId)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <img src="/icon/leftarrow.png" alt="left" className="w-8 h-8 inline-block" />
              </button>
              <button
                onClick={() => handleNext(sectionId)}
                className="text-[#3DFF88] hover:text-white transition-colors"
              >
                <img src="/icon/rightarrow.png" alt="Next" className="w-8 h-8 inline-block" />
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
            ref={(el) => (scrollRefs.current[sectionId] = el)}
            className={`${
              isGridView
                ? 'grid grid-cols-5 grid-rows-2 gap-3'
                : 'flex gap-3 overflow-x-auto scrollbar-hide py-4 px-1 cursor-grab active:cursor-grabbing'
            }`}
            style={{ scrollBehavior: isGridView ? 'auto' : 'smooth' }}
            onMouseDown={(e) => {
              if (isGridView) return;
              const el = e.currentTarget as HTMLElement;
              const startX = e.pageX - el.offsetLeft;
              const scrollLeft = el.scrollLeft;

              const handleMouseMove = (ev: MouseEvent) => {
                const x = ev.pageX - el.offsetLeft;
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
                  onMouseEnter={(e) => e.stopPropagation()}
                  onMouseLeave={(e) => e.stopPropagation()}
                >
                  <motion.div
                    className="relative bg-black h-[210px] w-full rounded-t-2xl overflow-hidden group"
                    whileHover="hovered"
                    initial="initial"
                    animate="initial"
                  >
                    <motion.div
                      className="absolute top-3 left-3 flex items-center gap-3 text-white text-[12px] font-bold px-3 py-2 rounded-2xl bg-[url('/icon/savebg.png')] bg-cover bg-center bg-no-repeat min-w-[9vw] z-20"
                      variants={{
                        initial: { opacity: 0, y: -15 },
                        hovered: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <img src="/icon/save.png" alt="save" className="h-[3vh] w-auto" />
                      <span className="text-[11px] tracking-tighter">Save $24.00</span>
                    </motion.div>

                    <motion.div
                      className="absolute inset-0 bg-[url('/icon/productbg.png')] bg-cover bg-center bg-no-repeat opacity-150"
                      variants={{
                        initial: { scale: 1 },
                        hovered: { scale: 1.15 },
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />

                    {product.node.images.edges[0] ? (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center z-5"
                        variants={{
                          initial: { rotate: 0 },
                          hovered: { rotate: [0, -3, 3, -2, 2, 0] },
                        }}
                        transition={{
                          delay: 0.25,
                          duration: 0.6,
                          ease: "easeInOut",
                        }}
                      >
                        <motion.img
                          src={product.node.images.edges[0].node.url}
                          alt={product.node.title}
                          className="object-contain relative z-5"
                          style={{ maxWidth: "150px", maxHeight: "120px" }}
                        />
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center z-5">
                        <div className="text-[#3dff87]/30 text-4xl">🎮</div>
                      </div>
                    )}

                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="absolute bottom-4 right-9 bg-[#3dff87] text-white font-semibold px-4 py-2 rounded-2xl hover:bg-[#2dd66e] hover:scale-110 flex items-center justify-center"
                      variants={{
                        initial: { y: 20, opacity: 0 },
                        hovered: { y: 2, opacity: 1 },
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <img src="/icon/car1.png" className="inline-block mr-1 w-6 h-6" /> Add to Cart
                    </motion.button>
                  </motion.div>

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
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="opacity-100 hover:bg-[#031C0D] transition-all duration-300"
                      >
                        <img
                          src="/icon/cart.png"
                          alt="Add to Cart"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06100A] flex flex-col">
        <Header />

        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3dff87]/20 border-t-[#3dff87]"></div>
          <p className="text-white mt-4">Loading products...</p>
        </div>
      </div>

    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#06100A] flex items-center justify-center">
        <Header />
        <div className="text-center text-red-500">
          <h2 className="text-xl mb-4">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#3dff87] text-black rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06100A] relative">
      <Header />

      <div className="bg-[#06100A] sticky top-0 z-10 backdrop-blur-sm border-b border-t border-[#3dff87]/10 bg-no-repeat bg-center bg-cover">
        <div className="max-w-[full] h-[9vh] mx-auto px-2 py-0 flex items-center gap-2 flex-wrap sm:flex-nowrap">
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
                  className={`absolute left-[3vw] top-[6vh] rounded-2xl py-2 min-w-[20vw] backdrop-blur-2xl backdrop-saturate-200 bg-[#0C1610] z-[1000] shadow-lg shadow-[#3dff87]/10 ${isDropdownOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {[
                    { id: 1, name: "Murder Mystery 2", icon: "/game/murder.png", route: "/murderMystery" },
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
            <h1 className="text-white text-2xl font-bold sm:text-lg whitespace-nowrap ml-3 transition-transform duration-300 ease-in-out hover:scale-105 hover:drop-shadow-lg cursor-pointer">
              {selectedGame.name}
            </h1>
          </div>

          <div className="flex justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-[#3dff87]/30 scrollbar-track-transparent flex-1">
            <div className="flex items-center gap-2">
              {categories.map((category) => (
                <React.Fragment key={category}>
                  <button
                    onClick={() => setActiveCategory(category)}
                    className={`relative whitespace-nowrap px-4 sm:px-6 sm:py-5 text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1
                      text-gray-400
                      hover:text-white hover:bg-gradient-to-b hover:from-[#d4dcd520] hover:to-[#01460d3d] hover:shadow-md hover:shadow-[#3dff87]/20
                      hover:after:absolute hover:after:bottom-0 hover:after:left-1/2 hover:after:-translate-x-1/2 hover:after:w-6 hover:after:h-[2px] hover:after:bg-white hover:after:rounded-full hover:after:content-[''] ${
                        activeCategory === category ? 'text-white bg-gradient-to-b from-[#d4dcd520] to-[#01460d3d]' : ''
                      }`}
                  >
                    {category === "Best Sellers" && (
                      <img
                        src={categoryIcons["Best Sellers"]}
                        alt="Best Sellers"
                        className="w-5 h-5 inline-block"
                      />
                    )}
                    {category}
                  </button>

                  {category === "Bundles" && (
                    <div className="h-6 w-[2px] mx-2 bg-gradient-to-b from-[#3a3c3b] via-[#3dff87] to-[#3a3c3b] opacity-60 rounded-full" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="relative flex items-center flex-shrink-0">
            {!isSearchActive ? (
              <button
                onClick={() => setIsSearchActive(true)}
                className="flex items-center gap-2 bg-[#1a2621]/50 border border-[#3dff87]/20 px-3 py-2 rounded-lg hover:bg-[#1a2621] hover:border-[#3dff87]/40 transition-all"
                title="Search products"
              >
                <svg className="w-5 h-5 text-[#f0f0f0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  onKeyDown={(e) => e.key === 'Escape' && setIsSearchActive(false)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
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
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
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

      <div className={`fixed bottom-4 left-2 z-50 transition-opacity duration-500 ${hideLogo ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <img src="/icon/ro.png" alt="Company Logo" className="w-12 h-12 object-contain" />
      </div>

      <div ref={mainRef} className="relative">
        {/* <TrustedBySection /> */}
        <FAQSection />
        <WeAre />
        <MainContentSection />
      </div>

      <Cart
        cart={cart}
        userCurrency={userCurrency}
        exchangeRates={exchangeRates}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        user={auth.user}
      />
    </div>
  );
};

export default GrowAGarden;