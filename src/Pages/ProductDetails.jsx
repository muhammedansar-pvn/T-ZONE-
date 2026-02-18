import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../Context/CartContext";
import { FaStar, FaHeart } from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [wishlist, setWishlist] = useState(false);

  
  const isInCart = cart.some(item => item.id === Number(id));

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const productId = Number(id);

        const [productRes, allRes] = await Promise.all([
          axios.get(`http://localhost:5000/watches/${productId}`),
          axios.get(`http://localhost:5000/watches`)
        ]);

        setProduct(productRes.data);
        setSelectedImage(productRes.data.image);
        setAllProducts(allRes.data);

        // Wishlist persistence
        const wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlist(wishlistItems.includes(productId));

      } catch (err) {
        console.error("Product fetch error:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleWishlist = () => {
    const wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || [];

    if (wishlist) {
      const updated = wishlistItems.filter(item => item !== product.id);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setWishlist(false);
    } else {
      wishlistItems.push(product.id);
      localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
      setWishlist(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-yellow-400 text-xl">
          Loading product...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
        <p className="mb-4">Product not found.</p>
        <button
          onClick={() => navigate("/watches")}
          className="bg-yellow-500 px-6 py-2 rounded text-black"
        >
          Back
        </button>
      </div>
    );
  }

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const totalPrice = product.price * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-20">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">

        {/* IMAGE SECTION */}
        <div>
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-[500px] object-contain rounded-3xl shadow-xl"
          />

          <div className="flex gap-4 mt-6">
            {[product.image, product.image, product.image].map((img, i) => (
              <img
                key={i}
                src={img}
                alt="thumb"
                onClick={() => setSelectedImage(img)}
                className="w-20 h-20 object-cover rounded-xl cursor-pointer border border-yellow-500/30 hover:scale-105 transition"
              />
            ))}
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-1 mb-4">
            {[1,2,3,4,5].map((star) => (
              <FaStar key={star} className="text-yellow-400" />
            ))}
            <span className="ml-2 text-gray-400">(4.8)</span>
          </div>

          <p className="text-3xl font-semibold mb-6">
            ₹ {product.price}
          </p>

          <p className="text-gray-400 mb-8 leading-relaxed">
            {product.description || "Premium crafted luxury timepiece built for elegance and durability."}
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setQuantity(q => (q > 1 ? q - 1 : 1))}
              className="bg-gray-800 px-4 py-2 rounded"
            >
              -
            </button>

            <span className="text-xl">{quantity}</span>

            <button
              onClick={() => setQuantity(q => q + 1)}
              className="bg-gray-800 px-4 py-2 rounded"
            >
              +
            </button>
          </div>

          <p className="mb-6">
            Total: <span className="text-yellow-400 font-bold">₹ {totalPrice}</span>
          </p>

          <div className="flex gap-6 mb-10">

            {isInCart ? (
              <button
                onClick={() => navigate("/cart")}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
              >
                Go to Cart
              </button>
            ) : (
              <button
                onClick={() => addToCart({ ...product, quantity })}
                className="bg-yellow-500 text-black px-8 py-3 rounded-lg hover:bg-yellow-600 transition"
              >
                Add to Cart
              </button>
            )}

            <button
              onClick={handleWishlist}
              className="text-2xl"
            >
              <FaHeart className={wishlist ? "text-red-500" : "text-gray-500"} />
            </button>

          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="max-w-7xl mx-auto mt-24">
        <h2 className="text-3xl font-bold mb-10 text-center">
          Related <span className="text-yellow-400">Products</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {relatedProducts.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/product/${item.id}`)}
              className="cursor-pointer bg-white/5 rounded-2xl p-6 hover:scale-105 transition"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-60 w-full object-cover rounded-xl mb-4"
              />
              <h3 className="text-yellow-400">{item.name}</h3>
              <p className="text-gray-400">₹ {item.price}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProductDetails;
