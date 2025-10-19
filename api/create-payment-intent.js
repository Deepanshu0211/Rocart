// In create-checkout-session.js
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-09-30.acacia',
});


export default async function createCheckoutSessionHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_BASE_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { lineItems, customerEmail, userId, successUrl, cancelUrl } = req.body;

    if (!lineItems || lineItems.length === 0) {
      return res.status(400).json({ error: "Line items are required" });
    }

    // Calculate total to apply discount
    const totalAmount = lineItems.reduce((sum, item) => {
      return sum + (item.price_data.unit_amount * item.quantity) / 100;
    }, 0);
    const discountAmount = totalAmount > 10 ? totalAmount * 0.1 : 0;

    // Apply discount to line items
    const adjustedLineItems = discountAmount > 0
      ? [
          ...lineItems,
          {
            price_data: {
              currency: lineItems[0].price_data.currency,
              product_data: { name: "Discount" },
              unit_amount: Math.round(-discountAmount * 100), // Negative amount for discount
            },
            quantity: 1,
          },
        ]
      : lineItems;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail || undefined,
      line_items: adjustedLineItems,
      success_url:
        successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}`,
      metadata: {
        userId: userId || "guest",
        timestamp: new Date().toISOString(),
      },
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "IN"],
      },
      automatic_tax: { enabled: false },
    });

    console.log("Checkout session created:", {
      sessionId: session.id,
      userId,
      customerEmail,
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to create checkout session" });
  }
}