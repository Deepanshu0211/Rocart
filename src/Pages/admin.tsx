import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";

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
};

// Form data type
type FormData = {
  title: string;
  description?: string;
  price: number;
  currency: string;
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
  const [currencyChanged, setCurrencyChanged] = useState<boolean>(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      currency: "USD",
      stock_quantity: 0,
      is_available: true,
    },
  });
  const { register: registerLogin, handleSubmit: handleSubmitLogin } = useForm<{ password: string }>();

  const selectedCurrency = watch("currency");
  const stockQuantity = watch("stock_quantity");

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("title", { ascending: true });

    if (error) {
      setError(`Error fetching products: ${error.message}`);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (editingProduct && selectedCurrency !== editingProduct.currency) {
      setCurrencyChanged(true);
    } else {
      setCurrencyChanged(false);
    }
  }, [selectedCurrency, editingProduct]);

  // Handle file upload to Supabase Storage
  const uploadImage = async (file: File) => {
    const filePath = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(filePath, file);

    if (error) {
      throw new Error(`Error uploading image: ${error.message}`);
    }

    const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return publicData.publicUrl;
  };

  // Add or Update product
  const onSubmit = async (data: FormData) => {
    let imageUrl = editingProduct?.image_url || "";

    if (data.image && data.image.length > 0) {
      try {
        imageUrl = await uploadImage(data.image[0]);
      } catch (err: any) {
        setError(err.message);
        return;
      }
    }

    const tagsArray = data.tags.split(",").map((tag) => tag.trim()).filter(Boolean);

    const productData = {
      title: data.title,
      description: data.description,
      image_url: imageUrl,
      price: parseFloat(data.price.toString()),
      currency: data.currency,
      tags: tagsArray,
      game: data.game,
      stock_quantity: parseInt(data.stock_quantity.toString()),
      is_available: data.is_available,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        setError(`Error updating product: ${error.message}`);
      } else {
        setEditingProduct(null);
        setCurrencyChanged(false);
        fetchProducts();
      }
    } else {
      const { error } = await supabase.from("products").insert([productData]);

      if (error) {
        setError(`Error adding product: ${error.message}`);
      } else {
        setIsAddingNew(false);
        fetchProducts();
      }
    }

    reset();
  };

  // Quick toggle availability
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

  // Quick update stock
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

  // Delete product
  const deleteProduct = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      setError(`Error deleting product: ${error.message}`);
    } else {
      fetchProducts();
    }
  };

  // Start editing
  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setIsAddingNew(false);
    reset({
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      tags: product.tags.join(", "),
      game: product.game,
      stock_quantity: product.stock_quantity || 0,
      is_available: product.is_available,
    });
  };

  // Start adding new
  const startAdding = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    reset({
      title: "",
      description: "",
      price: 0,
      currency: "USD",
      tags: "",
      game: "",
      stock_quantity: 0,
      is_available: true,
    });
  };

  // Cancel editing/adding
  const cancel = () => {
    setEditingProduct(null);
    setIsAddingNew(false);
    setCurrencyChanged(false);
    reset();
  };

  // Handle login with password
  const onLoginSubmit = (data: { password: string }) => {
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
    if (data.password === correctPassword) {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-[#1a2621] p-8 rounded-lg shadow-lg border border-[#3dff87]/20 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-white mb-6">Admin Login</h1>
          <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                {...registerLogin("password", { required: "Password is required" })}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
              />
              {error && <span className="text-red-500 text-sm">{error}</span>}
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3dff87]/20 border-t-[#3dff87]"></div>
          <p className="text-gray-400 mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-500">
          <div className="text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchProducts();
            }}
            className="mt-4 px-4 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel - Manage Products</h1>

      {/* Add New Button */}
      {!isAddingNew && !editingProduct && (
        <button
          onClick={startAdding}
          className="mb-6 px-4 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e] transition w-full max-w-xs block mx-auto"
        >
          Add New Product
        </button>
      )}

      {/* Form for Add/Edit */}
      {(isAddingNew || editingProduct) && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4 bg-[#1a2621] p-6 rounded-lg border border-[#3dff87]/20 max-w-2xl mx-auto">
          <div>
            <label className="block mb-1 text-sm text-gray-300">Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87] transition"
            />
            {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Description</label>
            <textarea
              {...register("description")}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87] transition"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-gray-300">Price</label>
              <input
                type="number"
                step="0.01"
                {...register("price", { required: "Price is required", min: { value: 0, message: "Price must be positive" } })}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87] transition"
              />
              {errors.price && <span className="text-red-500 text-sm">{errors.price.message}</span>}
              {currencyChanged && (
                <p className="text-yellow-500 text-sm mt-1">
                  Currency changed. Please verify the price for {selectedCurrency}.
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">Currency</label>
              <select
                {...register("currency", { required: "Currency is required" })}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87] transition"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
              {errors.currency && <span className="text-red-500 text-sm">{errors.currency.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-gray-300">Stock Quantity</label>
              <input
                type="number"
                {...register("stock_quantity", { 
                  required: "Stock quantity is required", 
                  min: { value: 0, message: "Stock cannot be negative" } 
                })}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87] transition"
              />
              {errors.stock_quantity && <span className="text-red-500 text-sm">{errors.stock_quantity.message}</span>}
              {stockQuantity === 0 && (
                <p className="text-yellow-500 text-sm mt-1">⚠️ Product will show as "Out of Stock"</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">Availability Status</label>
              <div className="flex items-center h-[42px]">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("is_available")}
                    className="w-5 h-5 accent-[#3dff87] mr-2"
                  />
                  <span className="text-white">Available for Purchase</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Tags (comma-separated)</label>
            <input
              {...register("tags")}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87] transition"
              placeholder="e.g., best-sellers, summer-specials, knives"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Game</label>
            <select
              {...register("game", { required: "Game is required" })}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87] transition"
            >
              <option value="AdoptMe">AdoptMe</option>
              <option value="AnimeVanguards">Anime Vanguards</option>
              <option value="GrowAGarden">Grow A Garden</option>
              <option value="BladeBall">Blade Ball</option>
              <option value="BloxFruits">Blox Fruits</option>
              <option value="DressToImpress">Dress To Impress</option>
              <option value="NinetyNineNights">Ninety Nine Nights</option>
              <option value="StealABrainrot">Steal A Brainrot</option>
            </select>
            {errors.game && <span className="text-red-500 text-sm">{errors.game.message}</span>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Image Upload</label>
            <input
              type="file"
              accept="image/*"
              {...register("image")}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e] transition"
            >
              {editingProduct ? "Update Product" : "Add Product"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {products.map((product) => (
          <div key={product.id} className="p-4 bg-[#1a2621] rounded-lg shadow-lg border border-[#3dff87]/20 hover:shadow-xl transition relative">
            {/* Availability Badge */}
            <div className="absolute top-2 right-2 z-10">
              {!product.is_available ? (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Unavailable
                </span>
              ) : product.stock_quantity === 0 ? (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Out of Stock
                </span>
              ) : product.stock_quantity && product.stock_quantity < 10 ? (
                <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                  Low Stock
                </span>
              ) : (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  In Stock
                </span>
              )}
            </div>

            <img
              src={product.image_url || "/placeholder.png"}
              alt={product.title}
              className="w-full h-48 object-cover mb-4 rounded transition"
            />
            <h2 className="text-xl font-semibold text-white">{product.title}</h2>
            <p className="text-gray-400 text-sm mb-2">{product.description || "No description available"}</p>
            <p className="font-bold text-[#3dff87] mb-2">
              {product.price.toFixed(2)} {product.currency}
            </p>
            
            {/* Stock Info */}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-gray-400">Stock:</span>
              <input
                type="number"
                min="0"
                value={product.stock_quantity || 0}
                onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-[#3dff87]"
              />
              <span className="text-sm text-gray-400">units</span>
            </div>

            <p className="text-sm text-gray-500 mb-2">Tags: {product.tags.join(", ")}</p>
            <p className="text-sm text-gray-500 mb-3">Game: {product.game}</p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleAvailability(product)}
                className={`px-3 py-1 rounded font-semibold transition ${
                  product.is_available
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {product.is_available ? "Mark Unavailable" : "Mark Available"}
              </button>
              <button
                onClick={() => startEditing(product)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => deleteProduct(product.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;