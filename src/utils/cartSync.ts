// cartSync.ts - Utility for syncing cart with Shopify customer account

const SHOPIFY_DOMAIN = (import.meta as any).env.VITE_SHOPIFY_DOMAIN;
const STOREFRONT_TOKEN = (import.meta as any).env.VITE_SHOPIFY_STOREFRONT_TOKEN;

export type CartItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  quantity: number;
};

// Custom event for cart sync
export const CART_SYNC_EVENT = 'cartSynced';

export function dispatchCartSyncEvent(cart: CartItem[]) {
  window.dispatchEvent(new CustomEvent(CART_SYNC_EVENT, { detail: { cart } }));
}

// Save cart to Shopify customer metafields
export async function saveCartToShopify(
  customerAccessToken: string,
  cart: CartItem[]
): Promise<boolean> {
  try {
    const mutation = `
      mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
        customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
          customer {
            id
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          customerAccessToken,
          customer: {
            note: JSON.stringify({ cart, savedAt: new Date().toISOString() })
          }
        }
      })
    });

    const data = await response.json();
    
    if (data.data?.customerUpdate?.customer) {
      console.log('✓ Cart synced to Shopify account');
      return true;
    } else {
      console.error('Failed to sync cart:', data.data?.customerUpdate?.customerUserErrors);
      return false;
    }
  } catch (error) {
    console.error('Error syncing cart to Shopify:', error);
    return false;
  }
}

// Load cart from Shopify customer metafields
export async function loadCartFromShopify(
  customerAccessToken: string
): Promise<CartItem[] | null> {
  try {
    const query = `
      query getCustomer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          note
        }
      }
    `;

    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: { customerAccessToken }
      })
    });

    const data = await response.json();
    
    if (data.data?.customer?.note) {
      try {
        const parsed = JSON.parse(data.data.customer.note);
        if (Array.isArray(parsed.cart)) {
          console.log('✓ Cart loaded from Shopify account');
          return parsed.cart;
        }
      } catch (e) {
        console.warn('Could not parse cart data from customer note');
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error loading cart from Shopify:', error);
    return null;
  }
}

// Merge local cart with account cart
export function mergeCart(localCart: CartItem[], accountCart: CartItem[]): CartItem[] {
  const merged = [...accountCart];
  
  localCart.forEach(localItem => {
    const existingIndex = merged.findIndex(item => item.id === localItem.id);
    
    if (existingIndex >= 0) {
      // Item exists in both - combine quantities
      merged[existingIndex].quantity += localItem.quantity;
    } else {
      // Item only in local cart - add it
      merged.push(localItem);
    }
  });
  
  return merged;
}

// Get local cart from localStorage
export function getLocalCart(storeName: string = 'cart'): CartItem[] {
  try {
    const stored = localStorage.getItem(storeName);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version && Array.isArray(parsed.items)) {
        return parsed.items;
      } else if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local cart:', e);
  }
  return [];
}

// Save local cart to localStorage
export function saveLocalCart(cart: CartItem[], storeName: string = 'cart'): void {
  try {
    localStorage.setItem(storeName, JSON.stringify({
      version: '1.0.0',
      items: cart
    }));
  } catch (e) {
    console.error('Error saving local cart:', e);
  }
}

// Clear local cart
export function clearLocalCart(storeName: string = 'cart'): void {
  try {
    localStorage.removeItem(storeName);
  } catch (e) {
    console.error('Error clearing local cart:', e);
  }
}