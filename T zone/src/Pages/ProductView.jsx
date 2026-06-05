import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WishlistContext";
import { useAuth } from "../Context/AuthContext";
import { FaStar, FaHeart } from "react-icons/fa";
import { getProductById } from "../services/productService";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { cart, addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  const isInCart = cart.some((item) => String(item._id) === String(id));

  const inWishlist = product ? isInWishlist(product._id) : false;

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    window.scrollTo(0, 0);

    getProductById(id)
      .then((data) => {
        const normalizedImages = data.images || [];

        const normalizedProduct = {
          ...data,
          images: normalizedImages,
        };

        setProduct(normalizedProduct);
        setSelectedImage(
          normalizedImages[0] || "https://via.placeholder.com/600",
        );
      })
      .catch((err) => {
        console.log(err);
        setProduct(null);
      });
  }, [id]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  // ================= HANDLERS =================

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
  };

  const handleWishlist = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    inWishlist ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  // ================= UI =================

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-12">
        {/* IMAGE SECTION */}
        <div className="w-full md:w-1/2">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-[450px] object-contain transition duration-300 hover:scale-105"
              onError={(e) =>
                (e.target.src = "https://via.placeholder.com/600")
              }
            />

            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 justify-center">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="thumb"
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border ${
                      selectedImage === img
                        ? "border-yellow-500"
                        : "border-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="w-full md:w-1/2 space-y-5">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {product.name}
          </h1>

          {product.brand && (
            <p className="text-gray-500 text-sm">{product.brand}</p>
          )}

          <div className="flex items-center gap-1 text-yellow-400">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar className="text-gray-300" />
            <span className="text-gray-500 ml-2 text-sm">(4.0 Reviews)</span>
          </div>

          <p className="text-yellow-500 text-3xl font-semibold">
            ₹ {product.price}
          </p>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              -
            </button>

            <span className="text-lg font-semibold">{quantity}</span>

            <button
              onClick={() => setQuantity((prev) => (prev < 5 ? prev + 1 : prev))}
              className="px-3 py-1 bg-gray-200 rounded"
              disabled={quantity >= 5}
            >
              +
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            {isInCart ? (
              <button
                onClick={() => navigate("/cart")}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Go to Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Add to Cart
              </button>
            )}

            <button
              onClick={handleWishlist}
              disabled={!user}
              className={`border px-6 py-2 rounded-lg flex items-center gap-2 transition ${
                !user
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <FaHeart
                className={inWishlist ? "text-red-500" : "text-gray-400"}
              />
              {inWishlist ? "Remove" : "Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
