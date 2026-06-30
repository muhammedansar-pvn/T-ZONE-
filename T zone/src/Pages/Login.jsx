import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import API from "../config/api";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    const res = await API.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem(
      "authUser",
      JSON.stringify({
        ...user,
        token,
      })
    );

    login({
      ...user,
      token,
    });

    navigate(user.role === "admin" ? "/admin" : "/");
  } catch (err) {
    console.log(err);

    setError(
      err.response?.data?.message ||
        "Login failed"
    );
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      const idToken = await result.user.getIdToken();
      console.log("=== GOOGLE ID TOKEN FOR POSTMAN ===");
      console.log(idToken);
      console.log("===================================");

      const res = await API.post("/auth/google-login", {
        idToken,
      });

      const { token, user: backendUser } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          ...backendUser,
          token,
        })
      );

      login({
        ...backendUser,
        token,
      });

      navigate(backendUser.role === "admin" ? "/admin" : "/");
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-xl w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        {error && (
          <p className="text-red-500 mb-4 text-center">
            {error}
          </p>
        )}

        {/* EMAIL */}
        <label htmlFor="email" className="block text-sm mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* PASSWORD */}
        <label htmlFor="password" className="block text-sm mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          className="w-full mb-2 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex justify-end mb-6">
          <Link
            to="/forgot-password"
            className="text-xs text-yellow-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* GOOGLE LOGIN */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border py-2 rounded hover:bg-gray-100"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-5 h-5"
            />
            Login with Google
          </button>
        </div>

        <p className="text-center mt-4">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-yellow-500 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;