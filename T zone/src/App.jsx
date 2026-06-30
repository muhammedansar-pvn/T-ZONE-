


import Footer from "./Components/Footer";


import { CartProvider } from "./Context/CartContext";
import { SearchProvider } from "./Context/SearchContext";
import { ThemeProvider } from "./Context/ThemeContext";
import { WishlistProvider } from "./Context/WishlistContext";
import AppRoutes from "./AppRoutes";

function App() {
  
  return (
    <WishlistProvider>
      <ThemeProvider>
        <SearchProvider>
          <CartProvider>

            <AppRoutes/>

            <Footer />

          </CartProvider>
        </SearchProvider>
      </ThemeProvider>
    </WishlistProvider>
  );
}

export default App;