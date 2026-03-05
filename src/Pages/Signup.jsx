import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { registerUser } from "../services/authService";
import emailjs from "@emailjs/browser";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const Signup = () => {

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInputs, setOtpInputs] = useState(["","","","","",""]);
  const [showOtpBox, setShowOtpBox] = useState(false);

  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP countdown
  useEffect(() => {

    if (!showOtpBox) return;

    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    },1000);

    return () => clearInterval(interval);

  },[timer,showOtpBox]);



  // input change
  const handleChange = (e) => {

    const {name,value} = e.target;

    if(name === "mobile"){
      setForm({...form,[name]:value.replace(/\D/g,"")});
    }else{
      setForm({...form,[name]:value});
    }

  };


  // validation
  const validateForm = () => {

    const {name,email,mobile,address,password,confirmPassword} = form;

    if(!name || !email || !mobile || !address || !password || !confirmPassword)
      return "All fields required";

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email";

    if(!/^[0-9]{10}$/.test(mobile))
      return "Mobile must be 10 digits";

    if(password.length < 6)
      return "Password must be at least 6 characters";

    if(password !== confirmPassword)
      return "Passwords do not match";

    return null;

  };


  // check duplicate email
  const checkEmailExists = async (email) => {

    try{

      const res = await fetch(`http://localhost:5000/users?email=${email}`);
      const data = await res.json();

      return data.length > 0;

    }catch(err){

      return false;

    }

  };


  // generate OTP
  const generateOTP = () => {

    return Math.floor(100000 + Math.random() * 900000).toString();

  };


  // send OTP email
  const sendOtpEmail = async (email,otp) => {

    const templateParams = {
      to_email: email,
      otp_code: otp
    };

    try{

      const response = await emailjs.send(
        "service_eq3pd1j",
        "template_rumre8z",
        templateParams,
        "HOIbxOYoyaLd2ldKH"
      );

      return response.status === 200;

    }catch(err){

      console.log(err);
      return false;

    }

  };


  // signup submit
  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");

    const validationError = validateForm();

    if(validationError){
      setError(validationError);
      return;
    }

    const emailExists = await checkEmailExists(form.email);

    if(emailExists){
      setError("Email already registered");
      return;
    }

    const newOtp = generateOTP();

    const sent = await sendOtpEmail(form.email,newOtp);

    if(!sent){
      setError("Failed to send OTP");
      return;
    }

    setGeneratedOtp(newOtp);
    setShowOtpBox(true);
    setTimer(60);

  };


  // OTP change
  const handleOtpChange = (value,index) => {

    if(!/^\d?$/.test(value)) return;

    const newOtp = [...otpInputs];

    newOtp[index] = value;

    setOtpInputs(newOtp);

    if(value && index < 5){

      const nextInput = document.getElementById(`otp-${index+1}`);

      if(nextInput) nextInput.focus();

    }

  };


  // verify OTP
  const verifyOtp = async () => {

    const enteredOtp = otpInputs.join("");

    if(enteredOtp !== generatedOtp){
      setError("Invalid OTP");
      return;
    }

    try{

      setLoading(true);

      const newUser = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        mobile: form.mobile,
        address: form.address.trim(),
      });

      login(newUser);

      navigate("/");

    }catch(err){

      setError("Signup failed");

    }finally{

      setLoading(false);

    }

  };


  // resend OTP
  const resendOtp = async () => {

    const newOtp = generateOTP();

    const sent = await sendOtpEmail(form.email,newOtp);

    if(!sent){
      setError("Failed to resend OTP");
      return;
    }

    setGeneratedOtp(newOtp);
    setTimer(60);
    setOtpInputs(["","","","","",""]);

  };



  // Google signup
  const handleGoogleSignup = async () => {

    try{

      const result = await signInWithPopup(auth,googleProvider);

      const user = result.user;

      const res = await fetch(`http://localhost:5000/users?email=${user.email}`);

      const data = await res.json();

      let newUser;

      if(data.length > 0){

        newUser = data[0];

      }else{

        newUser = await registerUser({
          name: user.displayName,
          email: user.email,
          password: "",
          mobile: "",
          address: "",
          googleUser:true
        });

      }

      login(newUser);

      navigate("/");

    }catch(error){

      console.log(error);
      setError("Google signup failed");

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

<input
type="text"
name="name"
placeholder="Full Name"
className="w-full mb-4 p-2 border rounded"
value={form.name}
onChange={handleChange}
/>

<input
type="email"
name="email"
placeholder="Email"
className="w-full mb-4 p-2 border rounded"
value={form.email}
onChange={handleChange}
/>

<input
type="text"
name="mobile"
placeholder="Mobile"
className="w-full mb-4 p-2 border rounded"
value={form.mobile}
onChange={handleChange}
maxLength="10"
/>

<textarea
name="address"
placeholder="Address"
className="w-full mb-4 p-2 border rounded"
value={form.address}
onChange={handleChange}
/>

<input
type="password"
name="password"
placeholder="Password"
className="w-full mb-4 p-2 border rounded"
value={form.password}
onChange={handleChange}
/>

<input
type="password"
name="confirmPassword"
placeholder="Confirm Password"
className="w-full mb-6 p-2 border rounded"
value={form.confirmPassword}
onChange={handleChange}
/>

<button
type="submit"
className="w-full bg-black text-white py-2 rounded"
>
Send OTP
</button>


<div className="mt-4">

<div className="flex items-center gap-2 mb-4">

<div className="flex-1 h-px bg-gray-300"></div>

<span className="text-gray-500 text-sm">OR</span>

<div className="flex-1 h-px bg-gray-300"></div>

</div>

<button
type="button"
onClick={handleGoogleSignup}
className="w-full flex items-center justify-center gap-2 border py-2 rounded hover:bg-gray-100"
>

<img
src="https://www.svgrepo.com/show/475656/google-color.svg"
alt="google"
className="w-5 h-5"
/>

Sign up with Google

</button>

</div>

</>
)}



{showOtpBox && (

<div className="text-center">

<p className="mb-4">
Enter OTP sent to email
</p>

<div className="flex justify-between mb-4">

{otpInputs.map((digit,index)=>(
<input
key={index}
id={`otp-${index}`}
type="text"
maxLength="1"
value={digit}
onChange={(e)=>handleOtpChange(e.target.value,index)}
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

):(

<button
type="button"
onClick={resendOtp}
className="text-blue-600 text-sm"
>
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