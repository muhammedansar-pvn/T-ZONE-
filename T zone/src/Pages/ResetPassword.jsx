import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../config/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message || "Password reset successfully!");
      
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message || "Failed to reset password. Link may have expired."
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
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

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
          Enter your new password below.
        </p>

        {/* PASSWORD */}
        <label htmlFor="password" className="block text-sm mb-1 text-gray-700 font-medium">
          New Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter new password"
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* CONFIRM PASSWORD */}
        <label htmlFor="confirmPassword" className="block text-sm mb-1 text-gray-700 font-medium">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          className="w-full mb-6 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-60 font-semibold"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="text-center mt-6 text-sm text-gray-600">
          Back to{" "}
          <Link to="/login" className="text-yellow-500 hover:underline font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
