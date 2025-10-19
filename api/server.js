import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from root directory
dotenv.config({ path: "../.env", debug: true });

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Error: STRIPE_SECRET_KEY is not defined in .env file");
  process.exit(1);
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-09-30.acacia',
});

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "https://rocart.vercel.app",
  "https://rocart.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Configure CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS Blocked Origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Endpoint to create PaymentIntent
app.post("/api/create-payment-intent", async (req, res) => {
  const { amount, currency, lineItems, customerEmail, userId } = req.body;

  if (!amount || !currency || !lineItems || lineItems.length === 0) {
    return res.status(400).json({ error: "Missing amount, currency, or line items" });
  }

  try {
    // Calculate total and apply discount
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
              unit_amount: Math.round(-discountAmount * 100),
            },
            quantity: 1,
          },
        ]
      : lineItems;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((totalAmount - discountAmount) * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId || "guest",
        timestamp: new Date().toISOString(),
      },
    });

    console.log("PaymentIntent created:", {
      paymentIntentId: paymentIntent.id,
      userId,
      customerEmail,
    });

    res.json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Handle OPTIONS preflight requests
app.options("/api/create-payment-intent", cors());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});