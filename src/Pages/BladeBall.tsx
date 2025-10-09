import { useEffect, useState } from "react";
import Header from "../screens/Frame/sections/HeaderSection/HeaderSection";
import MainContentSection from "../screens/Frame/sections/MainContentSection/MainContentSection";
import { Cart } from "../components/Cart";

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
  HK: "HKD", TW: "TWD", TH: "THB", MY: "MYR", IDR: "IDR",
  PH: "PHP", VN: "VND", PK: "PKR", BD: "BDT",
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", IL: "ILS",
  TR: "TRY", EG: "EGP",
  AU: "AUD", NZ: "NZD",
  BR: "BRL", AR: "ARS", CLP: "CLP", CO: "COP", PE: "PEN",
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
  const [selectedGame, setSelectedGame] = useState<{ name: string; icon: string }>(games[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatPrice = (product: Product | null) => {
    if (!product?.node.variants.edges[0]) return "$10.00";
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

  const handleAddToCart = () => {
    if (!product) return;
    
    const variant = product.node.variants.edges[0].node;
    const quantityInput = document.querySelector('input[type="number"]') as HTMLInputElement;
    const quantity = parseInt(quantityInput.value) || 2000;
    
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

  const renderTokenSection = () => {
    return (
    <div className="min-h-screen bg-[#06100A] bg-[url('/bg/mesh.png')] bg-repeat bg-[length:100vw_100vh] relative">

        <Header />
        <div className=" sticky top-0 z-10 b">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-[15vw] p-6  text-center mx-auto">
              <div className="w-64 h-64 flex-shrink-0">
                {product.node.images.edges[0]?.node.url ? (
                  <img
                    src={product.node.images.edges[0].node.url}
                    alt={product.node.title}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a2621] rounded-lg flex items-center justify-center">
                    <span className="text-[#3dff87]/30 text-2xl">🎮</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-white space-y-4 sm:text-left text-center">
                <h2 className="text-2xl font-bold text-left" >{product.node.title}</h2>

                {product.node.description && (
                  <p className="text-base text-gray-400 text-left">{product.node.description}</p>
                )}

                <p className="font-semibold text-left bg-gradient-to-r from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent">
                  5$ per 1000
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-6">
                  <p className="font-semibold bg-gradient-to-r from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent whitespace-nowrap">
                    Quantity
                  </p>
                  <input
                    type="number"
                    defaultValue="2000"
                    min="2000"
                    max="300000"
                    className="w-36 py-2 px-4 bg-[#1a2621] text-white border border-[#276838] rounded-2xl focus:outline-none focus:border-[#3dff87]"
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 2000;
                      if (value < 2000) e.target.value = "2000";
                      if (value > 300000) e.target.value = "300000";
                    }}
                  />
                  <span className="font-semibold bg-gradient-to-r from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent">
                    (min 2000 - max 300000)
                  </span>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#00a241] text-white rounded-2xl font-semibold hover:bg-[#2dd66e] transition-colors"
                >
                  <img src="/icon/car2.png" alt="cart" className="w-6 h-6" />
                  <span>Add to Cart</span>
                </button>

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