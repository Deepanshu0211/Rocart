import "dotenv/config"; // 👈 load .env automatically
import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 

app.use(cors());
app.use(express.json());

app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency, referralCode } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { referralCode },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { lineItems, userId, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: item.currency,
          product_data: { name: item.name },
          unit_amount: item.amount,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
