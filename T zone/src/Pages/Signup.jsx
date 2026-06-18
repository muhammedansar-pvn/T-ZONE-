import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { registerUser } from "../services/authService";
import emailjs from "@emailjs/browser";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import API from "../config/api";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [showOtpBox, setShowOtpBox] = useState(false);

  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP countdown
  useEffect(() => {
    if (!showOtpBox || timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, showOtpBox]);

  // input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      setForm({ ...form, [name]: value.replace(/\D/g, "") });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // validation
  const validateForm = () => {
    const { name, email, mobile, address, password, confirmPassword } = form;

    if (!name || !email || !mobile || !address || !password || !confirmPassword)
      return "All fields required";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email";

    if (!/^[0-9]{10}$/.test(mobile))
      return "Mobile must be 10 digits";

    if (password.length < 6)
      return "Password must be at least 6 characters";

    if (password !== confirmPassword)
      return "Passwords do not match";

    return null;
  };

 

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOtpEmail = async (email, otp) => {
    const templateParams = {
      to_email: email,
      otp_code: otp,
    };

    try {
      const response = await emailjs.send(
        "service_eq3pd1j",
        "template_rumre8z",
        templateParams,
        "HOIbxOYoyaLd2ldKH"
      );
      return response.status === 200;
    } catch {
      return false;
    }
  };

  // submit
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const validationError = validateForm();

  if (validationError) {
    setError(validationError);
    return;
  }

  try {
    setLoading(true);

    const data = await registerUser({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      mobile: form.mobile,
      address: form.address.trim(),
    });

    alert(data.message || "Registration Successful! Please check your email to verify your account.");

    // Redirect to login page
    navigate("/login");
  } catch (error) {
    setError(error.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};

  // OTP change
  // const handleOtpChange = (value, index) => {
  //   if (!/^\d?$/.test(value)) return;

  //   const newOtp = [...otpInputs];
  //   newOtp[index] = value;
  //   setOtpInputs(newOtp);

  //   if (value && index < 5) {
  //     document.getElementById(`otp-${index + 1}`)?.focus();
  //   }
  // };

  // verify OTP
//  const verifyOtp = async () => {
//   const enteredOtp = otpInputs.join("");

//   if (enteredOtp !== generatedOtp) {
//     setError("Invalid OTP");
//     return;
//   }

//   try {
//     setLoading(true);

//    await registerUser({
//   name: form.name.trim(),
//   email: form.email.trim(),
//   password: form.password,
//   mobile: form.mobile,
//   address: form.address.trim(),
// });

//     navigate("/login");
//   } catch (error) {
//     setError(error.message);
//   } finally {
//     setLoading(false);
//   }
// };

  // const resendOtp = async () => {
  //   const otp = generateOTP();
  //   const sent = await sendOtpEmail(form.email, otp);

  //   if (!sent) return setError("Failed to resend OTP");

  //   setGeneratedOtp(otp);
  //   setTimer(60);
  //   setOtpInputs(["", "", "", "", "", ""]);
  // };

  // Google signup
  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const res = await API.post("/auth/google-login", {
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        googleId: firebaseUser.uid,
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

      alert("Sign up successful!");
      navigate("/");
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Google signup failed"
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
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        {!showOtpBox && (
          <>
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="w-full mb-4 p-2 border rounded" />

            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="w-full mb-4 p-2 border rounded" />

            <label htmlFor="mobile">Mobile</label>
            <input id="mobile" name="mobile" type="text" value={form.mobile} onChange={handleChange} className="w-full mb-4 p-2 border rounded" maxLength="10" />

            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" value={form.address} onChange={handleChange} className="w-full mb-4 p-2 border rounded" />

            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} className="w-full mb-4 p-2 border rounded" />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="w-full mb-6 p-2 border rounded" />

            <button type="submit" className="w-full bg-black text-white py-2 rounded">
              Send OTP
            </button>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full mt-3 border py-2 rounded"
            >
              Sign up with Google
            </button>
          </>
        )}

        {showOtpBox && (
          <div className="text-center">
            <p className="mb-4">Enter OTP</p>

            <div className="flex justify-between mb-4">
              {otpInputs.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  name={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  className="w-10 h-10 text-center border rounded"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={verifyOtp}
              className="w-full bg-green-600 text-white py-2 rounded mb-3"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {timer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in {timer}s
              </p>
            ) : (
              <button onClick={resendOtp} className="text-blue-600 text-sm">
                Resend OTP
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default Signup;