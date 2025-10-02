// hooks/useCheckout.ts
import { useState, useEffect, useCallback } from "react";

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type LineItem = { variantId: string; quantity: number };

export function useCheckout(userCurrency: string, shopifyCustomerToken: string | null) {
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
      console.error("Missing Shopify environment variables");
      setCheckoutError("Store configuration error. Contact support.");
    }
  }, []);

  // Map currency → Shopify countryCode
  const getCountryCode = (currency: string) => {
    const map: Record<string, string> = {
      USD: "US", INR: "IN", GBP: "GB", EUR: "FR", JPY: "JP",
      CAD: "CA", AUD: "AU", CNY: "CN", BRL: "BR", MXN: "MX",
    };
    return map[currency] || "US";
  };

  // Validate customer token
  const validateCustomerToken = useCallback(async () => {
    if (!shopifyCustomerToken) return false;

    try {
      const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2025-01/graphql.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              customer(customerAccessToken: "${shopifyCustomerToken}") {
                id
              }
            }
          `,
        }),
      });
      const data = await res.json();
      return !!data?.data?.customer;
    } catch (err) {
      console.error("Customer token validation failed:", err);
      return false;
    }
  }, [shopifyCustomerToken]);

  // Create checkout & redirect
  const createCheckout = useCallback(
    async (items: LineItem[], discount?: string) => {
      if (!items.length) {
        setCheckoutError("Your cart is empty!");
        return;
      }

      const countryCode = getCountryCode(userCurrency);

      const mutation = `
        mutation checkoutCreate($input: CheckoutCreateInput!) {
          checkoutCreate(input: $input) {
            checkout {
              webUrl
            }
            checkoutUserErrors {
              message
            }
          }
        }
      `;

      const variables = {
        input: {
          lineItems: items,
          ...(discount ? { discountCode: discount } : {}),
          ...(shopifyCustomerToken ? { customerAccessToken: shopifyCustomerToken } : {}),
          presentmentCurrencyCode: userCurrency,
          buyerIdentity: { countryCode },
        },
      };

      try {
        const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2025-01/graphql.json`, {
          method: "POST",
          headers: {
            "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: mutation, variables }),
        });

        const data = await res.json();
        const { checkout, checkoutUserErrors } = data.data.checkoutCreate;

        if (checkoutUserErrors?.length) {
          setCheckoutError(checkoutUserErrors.map((e: any) => e.message).join(", "));
          return;
        }

        if (checkout?.webUrl) {
          window.location.href = checkout.webUrl;
        }
      } catch (err) {
        console.error("Checkout error:", err);
        setCheckoutError("Checkout failed. Try again.");
      }
    },
    [shopifyCustomerToken, userCurrency]
  );

  return { checkoutError, createCheckout, validateCustomerToken };
}
