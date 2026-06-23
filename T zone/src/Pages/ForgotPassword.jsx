import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../config/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Password reset link sent to your email.");
      setEmail("");
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message || "Failed to send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>

        {error && (
          <p className="text-red-500 mb-4 text-center text-sm font-medium">
            {error}
          </p>
        )}
        {message && (
          <p className="text-green-600 mb-4 text-center text-sm font-medium">
            {message}
          </p>
        )}

        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {/* EMAIL */}
        <label htmlFor="email" className="block text-sm mb-1 text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="w-full mb-6 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-60 font-semibold"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="text-center mt-6 text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="text-yellow-500 hover:underline font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
