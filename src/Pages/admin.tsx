// admin.tsx

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";

// Initialize Supabase clients
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Public client for regular operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Admin client for setup (use with caution)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

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
};

// Form data type
type FormData = {
  title: string;
  description?: string;
  price: number;
  currency: string;
  tags: string; // Comma-separated string for input
  game: string;
  image: FileList; // For file upload
};

const AdminPanel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  // Setup Supabase (table, bucket, policies)
  const setupSupabase = async () => {
    try {
      // Step 1: Create the 'products' table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          price NUMERIC NOT NULL,
          currency TEXT NOT NULL,
          tags TEXT[] NOT NULL,
          game TEXT NOT NULL
        );
      `;
      const { error: tableError } = await supabaseAdmin.rpc("execute_sql", { sql: createTableQuery });
      if (tableError) throw new Error(`Error creating table: ${tableError.message}`);

      // Step 2: Create the 'product-images' storage bucket
      const { error: bucketError } = await supabaseAdmin.storage.createBucket("product-images", {
        public: true, // Public read access
        allowedMimeTypes: ["image/*"],
      });
      if (bucketError && bucketError.message !== "Bucket already exists") {
        throw new Error(`Error creating bucket: ${bucketError.message}`);
      }

      // Step 3: Set storage policies
      const policies = [
        // Allow authenticated users to upload
        {
          name: "Allow authenticated uploads",
          definition: `
            CREATE POLICY "Allow authenticated uploads" ON storage.objects
            FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
          `,
        },
        // Allow public read access
        {
          name: "Allow public read",
          definition: `
            CREATE POLICY "Allow public read" ON storage.objects
            FOR SELECT TO public USING (bucket_id = 'product-images');
          `,
        },
      ];

      for (const policy of policies) {
        const { error: policyError } = await supabaseAdmin.rpc("execute_sql", {
          sql: policy.definition,
        });
        if (policyError && !policyError.message.includes("already exists")) {
          throw new Error(`Error creating policy ${policy.name}: ${policyError.message}`);
        }
      }

      // Step 4: Enable UUID extension (if not already enabled)
      const { error: uuidError } = await supabaseAdmin.rpc("execute_sql", {
        sql: "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";",
      });
      if (uuidError) throw new Error(`Error enabling UUID extension: ${uuidError.message}`);

      setIsSetupComplete(true);
    } catch (err: any) {
      setError(`Setup failed: ${err.message}`);
      setLoading(false);
    }
  };

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

  // Run setup and fetch products on mount
  useEffect(() => {
    const initialize = async () => {
      await setupSupabase();
      if (isSetupComplete) {
        await fetchProducts();
      }
    };
    initialize();
  }, [isSetupComplete]);

  // Handle file upload to Supabase Storage
  const uploadImage = async (file: File) => {
    const filePath = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(filePath, file);

    if (error) {
      throw new Error(`Error uploading image: ${error.message}`);
    }

    // Get public URL
    const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return publicData.publicUrl;
  };

  // Add or Update product
  const onSubmit = async (data: FormData) => {
    let imageUrl = editingProduct?.image_url || "";

    // Upload image if provided
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
      price: data.price,
      currency: data.currency,
      tags: tagsArray,
      game: data.game,
    };

    if (editingProduct) {
      // Update existing product
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        setError(`Error updating product: ${error.message}`);
      } else {
        setEditingProduct(null);
        fetchProducts();
      }
    } else {
      // Add new product
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

  // Delete product
  const deleteProduct = async (id: string) => {
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
    });
  };

  // Start adding new
  const startAdding = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    reset();
  };

  // Cancel editing/adding
  const cancel = () => {
    setEditingProduct(null);
    setIsAddingNew(false);
    reset();
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-white">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3dff87]/20 border-t-[#3dff87]"></div>
        <p className="text-gray-400 mt-4">Setting up or loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <div className="text-xl mb-4">⚠️ Error</div>
        <p className="text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - Manage Products</h1>

      {/* Add New Button */}
      {!isAddingNew && !editingProduct && (
        <button
          onClick={startAdding}
          className="mb-6 px-4 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e]"
        >
          Add New Product
        </button>
      )}

      {/* Form for Add/Edit */}
      {(isAddingNew || editingProduct) && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4 bg-[#1a2621] p-6 rounded-lg border border-[#3dff87]/20">
          <div>
            <label className="block mb-1 text-sm">Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
            />
            {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
          </div>

          <div>
            <label className="block mb-1 text-sm">Description</label>
            <textarea
              {...register("description")}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Price</label>
            <input
              type="number"
              step="0.01"
              {...register("price", { required: "Price is required", min: { value: 0, message: "Price must be positive" } })}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
            />
            {errors.price && <span className="text-red-500 text-sm">{errors.price.message}</span>}
          </div>

          <div>
            <label className="block mb-1 text-sm">Currency</label>
            <select
              {...register("currency", { required: "Currency is required" })}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
            {errors.currency && <span className="text-red-500 text-sm">{errors.currency.message}</span>}
          </div>

          <div>
            <label className="block mb-1 text-sm">Tags (comma-separated)</label>
            <input
              {...register("tags")}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
              placeholder="e.g., best-sellers, summer-specials, knives"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Game</label>
            <select
              {...register("game", { required: "Game is required" })}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-[#3dff87]"
            >
              <option value="AdoptMe">AdoptMe</option>
              <option value="AnimeVanguards">Anime Vanguards</option>
              <option value="GrowAGarden">Grow A Garden</option>
              <option value="BladeBall">Blade Ball</option>
            </select>
            {errors.game && <span className="text-red-500 text-sm">{errors.game.message}</span>}
          </div>

          <div>
            <label className="block mb-1 text-sm">Image Upload</label>
            <input
              type="file"
              accept="image/*"
              {...register("image")}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-[#3dff87] text-black rounded-lg font-semibold hover:bg-[#2dd66e]"
            >
              {editingProduct ? "Update Product" : "Add Product"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="p-4 bg-[#1a2621] rounded-lg shadow-lg border border-[#3dff87]/20">
            <img
              src={product.image_url || "/placeholder.png"}
              alt={product.title}
              className="w-full h-48 object-cover mb-4 rounded"
            />
            <h2 className="text-xl font-semibold">{product.title}</h2>
            <p className="text-gray-400">{product.description || "No description available"}</p>
            <p className="font-bold">
              {product.price} {product.currency}
            </p>
            <p className="text-sm text-gray-500">Tags: {product.tags.join(", ")}</p>
            <p className="text-sm text-gray-500">Game: {product.game}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => startEditing(product)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => deleteProduct(product.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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