import { useEffect, useState } from "react";
import Header from "../screens/Frame/sections/HeaderSection/HeaderSection";
import MainContentSection from "../screens/Frame/sections/MainContentSection/MainContentSection";

const domain = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SHOPIFY_DOMAIN 
  ? process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN 
  : null;
const token = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
  ? process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
  : null;

async function fetchProducts() {
  const query = `
    {
      products(first: 5) {
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

  if (!domain || !token) {
    throw new Error("Shopify domain or storefront token is not defined.");
  }

  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token as string,
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  return data.data.products.edges;
}

export const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06100A] flex items-center justify-center">
        <p className="text-white text-2xl">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06100A] p-2">
      <Header />
      <h1 className="text-4xl font-bold text-white mb-8">Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <div
            key={product.node.id}
            className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors"
          >
            {product.node.images.edges[0] && (
              <img
                src={product.node.images.edges[0].node.url}
                alt={product.node.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h2 className="text-xl font-bold text-white mb-2">
              {product.node.title}
            </h2>
            <p className="text-gray-300 mb-4">{product.node.description}</p>
            {product.node.variants.edges[0] && (
              <p className="text-[#3dff87] font-bold text-lg">
                {product.node.variants.edges[0].node.price.currencyCode}{" "}
                {product.node.variants.edges[0].node.price.amount}
              </p>
            )}
          </div>
        ))}
      </div>
      <MainContentSection />
    </div>
  );
};