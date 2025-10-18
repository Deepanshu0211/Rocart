import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useForm, useWatch } from "react-hook-form";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for Product
type Product = {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  price: number;
  currency: string;
  tags: string[];
  game: string;
  stock_quantity?: number;
  is_available: boolean;
  min_quantity?: number;
  max_quantity?: number;
  price_per_unit?: number;
};

// Form data type
type FormData = {
  title: string;
  description?: string;
  price: number;
  tags: string;
  game: string;
  image: FileList;
  stock_quantity: number;
  is_available: boolean;
};

const AdminPanel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'bladeball'>('all');

  const { register, handleSubmit, reset, formState: { errors }, control, setValue } = useForm<FormData>({
    defaultValues: {
      price: 0,
      stock_quantity: 0,
      is_available: true,
      tags: "",
      game: "",
    },
  });

  const selectedGame = useWatch({ control, name: "game" });
  const { register: registerLogin, handleSubmit: handleSubmitLogin } = useForm<{ email: string; password: string }>();

  // Auto-set BladeBall price when game changes
  useEffect(() => {
    if (selectedGame === "BladeBall") {
      setValue("price", 5); // Auto-set to $5
    }
  }, [selectedGame, setValue]);

  // Fetch products when authenticated
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          title,
          description,
          image_url,
          price,
          currency,
          tags,
          game,
          stock_quantity,
          is_available
        `)
        .order("title", { ascending: true });

      if (error) {
        throw new Error(`Error fetching products: ${error.message}`);
      }

      const mappedProducts = (data || []).map((product: any) => ({
        ...product,
        tags: Array.isArray(product.tags) ? product.tags : (product.tags ? product.tags.split(',').map((t: string) => t.trim()) : []),
        min_quantity: product.game === 'BladeBall' ? 2000 : 1,
        max_quantity: product.game === 'BladeBall' ? 300000 : 999999,
        price_per_unit: product.game === 'BladeBall' ? 5 : product.price,
      }));

      setProducts(mappedProducts);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Handle authentication state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session) fetchProducts();
      else setLoading(false);
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) fetchProducts();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const onLoginSubmit = async (data: { email: string; password: string }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      setError(null);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  const uploadImage = async (file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User is not authenticated. Please log in.");
    }
    const filePath = `product-images/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Error uploading image: ${error.message}`);
    }

    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);
    return publicData.publicUrl;
  };

  const onSubmit = async (data: FormData) => {
    if (!isAuthenticated) {
      setError("Please log in to perform this action.");
      return;
    }

    setError(null);
    let imageUrl = editingProduct?.image_url || "";
    if (data.image && data.image.length > 0) {
      try {
        imageUrl = await uploadImage(data.image[0]);
      } catch (err: any) {
        setError(err.message);
        return;
      }
    }

    const tagsArray = data.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    let finalPrice = parseFloat(data.price.toString());
    if (data.game === "BladeBall") {
      finalPrice = 5;
    }

    const productData = {
      title: data.title,
      description: data.description || null,
      image_url: imageUrl,
      price: finalPrice,
      currency: "USD",
      tags: tagsArray,
      game: data.game,
      stock_quantity: parseInt(data.stock_quantity.toString(), 10),
      is_available: data.is_available,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        setEditingProduct(null);
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw error;
        setIsAddingNew(false);
      }
      fetchProducts();
      reset();
    } catch (err: any) {
      setError(`Error saving product: ${err.message}`);
    }
  };

  const toggleAvailability = async (product: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_available: !product.is_available })
      .eq("id", product.id);

    if (error) {
      setError(`Error updating availability: ${error.message}`);
    } else {
      fetchProducts();
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    const { error } = await supabase
      .from("products")
      .update({ stock_quantity: newStock })
      .eq("id", productId);

    if (error) {
      setError(`Error updating stock: ${error.message}`);
    } else {
      fetchProducts();
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      setError(`Error deleting product: ${error.message}`);
    } else {
      fetchProducts();
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setIsAddingNew(false);
    reset({
      title: product.title,
      description: product.description || "",
      price: product.price,
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      game: product.game,
      stock_quantity: product.stock_quantity || 0,
      is_available: product.is_available,
    });
  };

  const startAdding = (game?: string) => {
    setIsAddingNew(true);
    setEditingProduct(null);
    const initialData = {
      title: "",
      description: "",
      price: game === "BladeBall" ? 5 : 0,
      tags: "",
      game: game || "",
      stock_quantity: 0,
      is_available: true,
    };
    reset(initialData);
    if (game === "BladeBall") {
      setActiveTab('bladeball');
    }
  };

  const cancel = () => {
    setEditingProduct(null);
    setIsAddingNew(false);
    reset();
  };

  const filteredProducts = activeTab === 'bladeball' 
    ? products.filter(p => p.game === 'BladeBall')
    : products;

  const bladeballProducts = products.filter(p => p.game === 'BladeBall');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-[#1a2621] p-8 rounded-lg shadow-lg border border-[#3dff87]/20 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-white mb-6">Admin Login</h1>
          <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                {...registerLogin("email", { required: "Email is required" })}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                {...registerLogin("password", { required: "Password is required" })}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
              />
              {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e] transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3dff87]/20 border-t-[#3dff87] mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Admin Panel - Manage Products
          <p className="text-sm text-gray-400 mt-1">💡 All prices stored in USD - Auto-converted for users</p>
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
            {error}
            <button
              onClick={() => { setError(null); fetchProducts(); }}
              className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-[#1a2621] rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-md font-semibold transition ${
              activeTab === 'all'
                ? 'bg-[#3dff87] text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('bladeball')}
            className={`flex-1 py-2 px-4 rounded-md font-semibold transition ${
              activeTab === 'bladeball'
                ? 'bg-[#3dff87] text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            BladeBall ⚔️ ({bladeballProducts.length})
          </button>
        </div>

        {/* BladeBall Info */}
        {activeTab === 'bladeball' && (
          <div className="bg-[#1a2621]/50 p-4 rounded-lg mb-6 border border-[#3dff87]/20">
            <h3 className="text-lg font-semibold mb-2">⚔️ BladeBall Special Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#3dff87]">$5</div>
                <div className="text-gray-400">per 1000 units</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#3dff87]">2000</div>
                <div className="text-gray-400">min quantity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#3dff87]">300,000</div>
                <div className="text-gray-400">max quantity</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">✅ Price automatically set to $5/1000 units</p>
          </div>
        )}

        {/* Add Buttons */}
        {!isAddingNew && !editingProduct && (
          <div className="flex flex-wrap gap-4 mb-6 justify-center">
            <button
              onClick={() => startAdding()}
              className="px-6 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e] transition"
            >
              ➕ Add New Product
            </button>
            <button
              onClick={() => startAdding("BladeBall")}
              className="px-6 py-2 bg-gradient-to-r from-[#3dff87] to-[#00a241] text-black rounded-lg font-semibold hover:from-[#2dd66e] transition"
            >
              ⚔️ Add BladeBall Product
            </button>
          </div>
        )}

        {/* Form */}
        {(isAddingNew || editingProduct) && (
          <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4 bg-[#1a2621] p-6 rounded-lg border border-[#3dff87]/20 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-sm text-gray-300">Title *</label>
                <input
                  {...register("title", { required: "Title is required" })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
                />
                {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-300">Game *</label>
                <select
                  {...register("game", { required: "Game is required" })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
                >
                  <option value="BladeBall">Blade Ball ⚔️</option>
                  <option value="GrowAGarden">Grow A Garden 🌱</option>
                  <option value="AdoptMe">Adopt Me! 🐶</option>
                  <option value="AnimeVanguards">Anime Vanguards ⚔️</option>
                  <option value="BloxFruits">Blox Fruits 🍎</option>
                  <option value="DressToImpress">Dress To Impress 👗</option>
                  <option value="NinetyNineNights">99 Nights In The Forest 🌲</option>
                  <option value="StealABrainrot">Steal A Brainrot 🧠</option>
                </select>
                {errors.game && <span className="text-red-500 text-sm">{errors.game.message}</span>}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">Description</label>
              <textarea
                {...register("description")}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm text-gray-300">
                  Price (USD) {selectedGame === "BladeBall" && "(Auto: $5/1000)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { 
                    required: "Price is required", 
                    min: { value: 0, message: "Price must be positive" }
                  })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87] disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-[#3dff87]"
                  disabled={selectedGame === "BladeBall"}
                />
                {errors.price && <span className="text-red-500 text-sm">{errors.price.message}</span>}
                {selectedGame === "BladeBall" && (
                  <div className="mt-1">
                    <p className="text-xs text-[#3dff87] font-semibold">✅ Auto-set to $5 per 1000 units</p>
                    <p className="text-xs text-gray-400">Price is automatically calculated on save</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-300">Stock Quantity</label>
                <input
                  type="number"
                  {...register("stock_quantity", { 
                    required: "Stock quantity is required", 
                    min: { value: 0, message: "Stock cannot be negative" } 
                  })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
                />
                {errors.stock_quantity && <span className="text-red-500 text-sm">{errors.stock_quantity.message}</span>}
              </div>
            </div>

            {selectedGame === "BladeBall" && (
              <div className="p-4 bg-[#0f1a14] rounded-lg border border-[#3dff87]/30">
                <p className="text-sm text-[#3dff87] mb-2">⚔️ BladeBall Auto-Settings:</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Min: <span className="font-bold text-[#3dff87]">2000</span> units</div>
                  <div>Max: <span className="font-bold text-[#3dff87]">300,000</span> units</div>
                  <div>Price: <span className="font-bold text-[#3dff87]">$5</span>/1000 units</div>
                </div>
                <p className="text-xs text-gray-400 mt-2">🎯 All settings automatically applied</p>
              </div>
            )}

            <div>
              <label className="block mb-1 text-sm text-gray-300">Tags (comma-separated)</label>
              <input
                {...register("tags")}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
                placeholder="best-seller, limited, bundle"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">Product Image</label>
              <input
                type="file"
                accept="image/*"
                {...register("image")}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              />
            </div>

            <div className="flex gap-4 justify-end pt-4 border-t border-gray-700">
              <button
                type="submit"
                className="px-6 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e] transition"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={cancel}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4 bg-[#1a2621] rounded-lg border border-[#3dff87]/20 hover:shadow-xl transition relative">
              {product.game === "BladeBall" && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-[#3dff87] to-[#00a241] text-black text-xs px-2 py-1 rounded-full font-semibold">
                  ⚔️ BladeBall Special
                </div>
              )}
              
              <div className="relative mb-4">
                <div className="absolute top-2 right-2 z-10">
                  {!product.is_available ? (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Unavailable</span>
                  ) : product.stock_quantity === 0 ? (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">Out of Stock</span>
                  ) : (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">In Stock</span>
                  )}
                </div>
                <img
                  src={product.image_url || "/placeholder.png"}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded"
                  onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                />
              </div>

              <h2 className="text-xl font-semibold text-white mb-2">{product.title}</h2>
              <p className="text-gray-400 text-sm mb-2 line-clamp-2">{product.description}</p>
              
              <div className="mb-3">
                {product.game === "BladeBall" ? (
                  <div>
                    <p className="font-bold text-[#3dff87] text-lg">$5 USD / 1000 units</p>
                    <p className="text-xs text-gray-500">⚔️ Auto-calculated pricing</p>
                  </div>
                ) : (
                  <p className="font-bold text-[#3dff87] text-lg">${product.price.toFixed(2)} USD</p>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-400">Stock:</span>
                <input
                  type="number"
                  min="0"
                  value={product.stock_quantity || 0}
                  onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                  className="w-20 p-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                />
              </div>

              <p className="text-sm text-gray-500 mb-3">🎮 {product.game}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleAvailability(product)}
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    product.is_available
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {product.is_available ? "👁️ Unavailable" : "✅ Available"}
                </button>
                <button
                  onClick={() => startEditing(product)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-[#3dff87]/30 text-6xl mb-4">{activeTab === 'bladeball' ? '⚔️' : '📦'}</div>
            <h3 className="text-xl font-bold mb-2">
              {activeTab === 'bladeball' ? 'No BladeBall products' : 'No products found'}
            </h3>
            <button
              onClick={() => startAdding(activeTab === 'bladeball' ? 'BladeBall' : undefined)}
              className="px-6 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e]"
            >
              {activeTab === 'bladeball' ? '⚔️ Add BladeBall Product' : '➕ Add First Product'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;