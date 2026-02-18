import { Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import Watches from "./Pages/Watches";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ProductDetails from "./Pages/ProductDetails";
import { CartProvider } from "./Context/CartContext";
import { SearchProvider } from "./Context/SearchContext";
import Footer from "./Components/Footer";
import { ThemeProvider } from "./Context/ThemeContext";
import Checkout from "./Pages/Checkout";
import ProtectedRoute from "./Components/ProtectedRoute";
import OrderSuccess from "./Pages/OrderSuccess";
import Orders from "./Pages/Orders";
import { AuthProvider } from "./Context/AuthContext";   // IMPORTANT

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>   {/* Wrap AuthProvider */}
        <SearchProvider>
          <CartProvider>

            <Navbar />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/watches" element={<Watches />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/product/:id" element={<ProductDetails />} />

              {/*  Protected Checkout */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />

              <Route path="/order-success" element={<OrderSuccess />} />

              {/*Protected Orders Page */}
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
            </Routes>

            <Footer />

          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
