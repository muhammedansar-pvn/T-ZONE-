import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../config/api";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const verificationStarted = useRef(false);
  
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;

    const verifyToken = async () => {
      try {
        const res = await API.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage(err.response?.data?.message || "Invalid or expired verification link.");
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus("error");
      setMessage("No verification token provided.");
    }
  }, [token]);

  // Redirect countdown
  useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Email Verification</h2>

        {status === "verifying" && (
          <div className="flex flex-col items-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
            <p className="text-gray-600 font-medium">Verifying your email address...</p>
            <p className="text-sm text-gray-400 mt-2">Please do not close this window</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-4">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-semibold text-lg mb-2">Verification Successful!</p>
            <p className="text-gray-600 mb-6 text-sm">{message}</p>
            <div className="bg-gray-50 rounded-lg p-3 w-full mb-4">
              <p className="text-xs text-gray-500">
                Redirecting you to login in <span className="font-bold text-yellow-500">{countdown}s</span>...
              </p>
            </div>
            <Link
              to="/login"
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition font-semibold"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-4">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-semibold text-lg mb-2">Verification Failed</p>
            <p className="text-gray-600 mb-6 text-sm">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/signup"
                className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800 transition font-semibold text-sm"
              >
                Sign Up Again
              </Link>
              <Link
                to="/login"
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition font-semibold text-sm"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
