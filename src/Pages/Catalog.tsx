import { useEffect, useState } from "react";
import Header from "../screens/Frame/sections/HeaderSection/HeaderSection";
import MainContentSection from "../screens/Frame/sections/MainContentSection/MainContentSection";


// Vite uses import.meta.env, not process.env
const domain = import.meta.env.VITE_SHOPIFY_DOMAIN;
const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

// Game data - matches WelcomeBannerSection
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

export const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedGame, setSelectedGame] = useState(games[1]); // Default Murder Mystery 2

  useEffect(() => {
    // Get selected game from sessionStorage
    const storedGame = sessionStorage.getItem('selectedGame');
    if (storedGame) {
      try {
        setSelectedGame(JSON.parse(storedGame));
      } catch (e) {
        console.error('Error parsing stored game:', e);
      }
    }

    // Fetch products
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06100A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3dff87] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-2xl">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#06100A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#3dff87] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#2dd66f] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06100A]">
      {/* Header Section */}
      <Header />
      

    

      {/* Categories Navigation - Dark theme */}
{/* Game Header & Categories Navigation - Dark theme */}
 {/* Game Header & Categories Navigation - Dark theme */}
   {/* Game Header & Categories Navigation - Compact Design */}
      <div className="bg-[#0a1612]/95 border-b border-[#3dff87]/10 sticky top-0 z-10 backdrop-blur-sm">
      
        <div className="max-w-[95vw] mx-auto px-4 py-3 flex items-center gap-4">
           <div className="border-l border-[#3dff87]/30  py-3" />
          {/* Left: Game Info - Compact */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3dff87]/20 to-[#259951]/20 p-1.5 flex items-center justify-center border border-[#3dff87]/30">
              <img
                src={selectedGame.icon}
                alt={selectedGame.name}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-white text-lg font-bold tracking-tight whitespace-nowrap">{selectedGame.name}</h1>
          </div>

          {/* Center: Categories - Compact */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#3dff87]/30 scrollbar-track-transparent flex-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeCategory === category
                    ? "text-black bg-gradient-to-r from-[#a9d692] via-[#3DFF88] to-[#259951] shadow-md shadow-[#3dff87]/20"
                    : "text-gray-400 hover:text-white hover:bg-[#1a2621] border border-[#3dff87]/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Right: Join Discord Button - Compact */}
          <button className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 flex-shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join Discord
          </button>
        </div>
      </div>

      {/* Products Grid - Dark theme matching WelcomeBannerSection */}
      <div className="max-w-[95vw] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
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
              
              <div className="p-5">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#3dff87] transition-colors">
                  {product.node.title}
                </h3>
                
                {product.node.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {product.node.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between gap-3">
                  {product.node.variants.edges[0] && (
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-medium">Price</span>
                      <span className="text-[#3dff87] font-bold text-xl">
                        {product.node.variants.edges[0].node.price.currencyCode}{" "}
                        {product.node.variants.edges[0].node.price.amount}
                      </span>
                    </div>
                  )}
                  
                  <button className="bg-gradient-to-r from-[#a9d692] via-[#3DFF88] to-[#259951] hover:from-[#3DFF88] hover:to-[#1f7d40] text-black font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-[#3dff87]/20 hover:shadow-[#3dff87]/40 hover:scale-105 whitespace-nowrap">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-[#3dff87]/30 text-8xl mb-4">🎮</div>
            <h3 className="text-white text-2xl font-bold mb-2">No products found</h3>
            <p className="text-gray-400">Check back later for new items!</p>
          </div>
        )}
      </div>

      {/* Bottom Gradient Line matching WelcomeBannerSection */}
      <div
        className="w-full h-[0.2vh] mt-auto"
        style={{
          background: "linear-gradient(to right, #3DFF87, #000000)",
        }}
      />

      {/* Main Content Section */}
      <MainContentSection />
    </div>
  );
};