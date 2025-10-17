import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const CheckoutSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-10 rounded-2xl shadow-lg"
      >
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase. A payment receipt has been sent to your email.
        </p>
        <button
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </button>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;
