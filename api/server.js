import express from "express";
import cors from "cors";
import createPaymentIntentHandler from "./create-payment-intent.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.post("/api/create-payment-intent", createPaymentIntentHandler);

app.get("/", (req, res) => {
  res.send("Backend server running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});