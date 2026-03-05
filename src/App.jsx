

// Layout Components
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";



// Context Providers
import { CartProvider } from "./Context/CartContext";
import { SearchProvider } from "./Context/SearchContext";
import { ThemeProvider } from "./Context/ThemeContext";
import { AuthProvider } from "./Context/AuthContext";
import { WishlistProvider } from "./Context/WishlistContext";
import AppRoutes from "./AppRoutes";

function App() {
  
  return (
    <WishlistProvider>
      <ThemeProvider>
        <AuthProvider>
          <SearchProvider>
            <CartProvider>

              <AppRoutes/>

              <Footer />

            </CartProvider>
          </SearchProvider>
        </AuthProvider>
      </ThemeProvider>
    </WishlistProvider>
  );
}

export default App;