import bgvideo from "../assets/Images/background.mp4";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { SearchContext } from "../Context/SearchContext";
import { AuthContext } from "../Context/AuthContext";

const API_URL = "http://localhost:5000/products";

const Home = () => {
  const navigate = useNavigate();
  const { searchTerm = "" } = useContext(SearchContext);
  const { isAdmin } = useContext(AuthContext);

  const [allProducts, setAllProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const productSectionRef = useRef(null);

  /* ===============================
     FETCH PRODUCTS
  ================================ */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(API_URL);
        setAllProducts(res.data);
        setFeatured(res.data.slice(0, 3));
      } catch (err) {
        console.error("Product Fetch Error:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ===============================
     AUTO SCROLL ON SEARCH
  ================================ */
  useEffect(() => {
    if (searchTerm && productSectionRef.current) {
      const yOffset = -80;
      const y =
        productSectionRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [searchTerm]);

  /* ===============================
     FILTER PRODUCTS
  ================================ */
  const filteredProducts = allProducts.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productsToShow = searchTerm ? filteredProducts : featured;

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">

      {/* ===============================
         ADMIN QUICK ACCESS BUTTON
      ================================ */}
      {isAdmin && (
        <div className="fixed top-5 right-5 z-50">
          <button
            onClick={() => navigate("/admin")}
            className="bg-yellow-500 text-black px-5 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition duration-300"
          >
            Go to Admin Panel
          </button>
        </div>
      )}

      {/* ===============================
         HERO SECTION
      ================================ */}
      <div className="relative h-screen overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute w-full h-full object-cover"
        >
          <source src={bgvideo} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/60"></div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-widest uppercase bg-gradient-to-r from-yellow-400 via-white to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
            T-ZONE
          </h1>

          <p className="mt-6 text-gray-200 text-lg md:text-xl">
            Time Defines Your Style
          </p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-xl md:text-2xl mb-8 text-gray-200"
          >
            Every Second Tells a Story.
          </motion.p>

          <button
            onClick={() => navigate("/watches")}
            className="mt-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition duration-300 shadow-2xl"
          >
            Shop Now
          </button>
        </motion.div>
      </div>

      {/* ===============================
         PRODUCTS SECTION
      ================================ */}
      <section ref={productSectionRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">

          <h2 className="text-4xl font-bold mb-16">
            {searchTerm ? (
              <>
                Search Results for{" "}
                <span className="text-yellow-500">
                  "{searchTerm}"
                </span>
              </>
            ) : (
              <>
                Featured{" "}
                <span className="text-yellow-500">
                  Products
                </span>
              </>
            )}
          </h2>

          {loading && (
            <p className="text-gray-400 text-lg animate-pulse">
              Loading products...
            </p>
          )}

          {error && (
            <p className="text-red-500 text-lg">
              {error}
            </p>
          )}

          {!loading && !error && productsToShow.length === 0 && (
            <p className="text-gray-400 text-lg">
              No products found.
            </p>
          )}

          {!loading && !error && productsToShow.length > 0 && (
            <div className="grid md:grid-cols-3 gap-10">
              {productsToShow.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() =>
                    navigate(`/product/${product.id}`)
                  }
                  className="cursor-pointer bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-yellow-500/20 hover:scale-105 transition duration-500 shadow-lg"
                >
                  <img
                    src={product.image || product.images?.[0]}
                    alt={product.name}
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-yellow-400">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 mt-2">
                      ₹ {product.price}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default Home;