import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const Login = () => {

  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);



  // Auto redirect if logged in
  useEffect(() => {

    if(user){
      navigate(user.role === "admin" ? "/admin" : "/");
    }

  },[user,navigate]);



  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try{

      const res = await fetch(
        `http://localhost:5000/users?email=${email.trim()}`
      );

      if(!res.ok){
        throw new Error("Server error");
      }

      const data = await res.json();

      if(data.length === 0){
        setError("User not found");
        return;
      }

      const foundUser = data[0];

      if(foundUser.isBlocked){
        setError("Your account has been blocked");
        return;
      }

      if(foundUser.password !== password){
        setError("Incorrect password");
        return;
      }

      login(foundUser);

      navigate(foundUser.role === "admin" ? "/admin" : "/");

    }catch(err){

      console.error(err);
      setError("Login failed. Please try again.");

    }finally{

      setLoading(false);

    }

  };



  // Google Login
  const handleGoogleLogin = async () => {

    try{

      const result = await signInWithPopup(auth,googleProvider);

      const googleUser = result.user;

      const res = await fetch(
        `http://localhost:5000/users?email=${googleUser.email}`
      );

      const data = await res.json();

      let newUser;

      if(data.length > 0){

        newUser = data[0];

      }else{

        const createRes = await fetch(
          "http://localhost:5000/users",
          {
            method:"POST",
            headers:{
              "Content-Type":"application/json"
            },
            body:JSON.stringify({
              name:googleUser.displayName,
              email:googleUser.email,
              password:"",
              mobile:"",
              address:"",
              role:"user",
              googleUser:true,
              isBlocked:false
            })
          }
        );

        newUser = await createRes.json();

      }

      login(newUser);

      navigate("/");

    }catch(error){

      console.log(error);
      setError("Google login failed");

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

<input
type="email"
placeholder="Email"
className="w-full mb-4 p-2 border rounded"
value={email}
onChange={(e)=>setEmail(e.target.value)}
required
/>

<input
type="password"
placeholder="Password"
className="w-full mb-6 p-2 border rounded"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>

<button
type="submit"
disabled={loading}
className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-60"
>

{loading ? "Logging in..." : "Login"}

</button>



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