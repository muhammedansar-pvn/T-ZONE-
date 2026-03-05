import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../Context/CartContext";
import { FaHeart } from "react-icons/fa";

const API_BASE = "http://localhost:5000/products";
const MAX_QUANTITY = 5;

const ProductDetails = () => {
  const { id } = useParams(); // keep as string
  const navigate = useNavigate();
  const { cart, addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [wishlist, setWishlist] = useState(false);

  const existingItem = cart.find(
    (item) => String(item.id) === String(id)
  );

  const isInCart = !!existingItem;

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE}/${id}`);
        const data = res.data;

        // Normalize image system
        const normalizedImages =
          data.images?.length > 0
            ? data.images
            : data.image
            ? [data.image]
            : [];

        const normalizedProduct = {
          ...data,
          images: normalizedImages,
        };

        setProduct(normalizedProduct);
        setSelectedImage(
          normalizedImages[0] ||
            "https://via.placeholder.com/600"
        );

        // Wishlist check
        const wishlistItems =
          JSON.parse(localStorage.getItem("wishlist")) || [];

        setWishlist(wishlistItems.includes(id));
      } catch (err) {
        console.error("Product fetch error:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ================= WISHLIST =================
  const handleWishlist = () => {
    const wishlistItems =
      JSON.parse(localStorage.getItem("wishlist")) || [];

    if (wishlist) {
      const updated = wishlistItems.filter(
        (item) => item !== id
      );
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setWishlist(false);
    } else {
      if (!wishlistItems.includes(id)) {
        wishlistItems.push(id);
      }
      localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
      setWishlist(true);
    }
  };

  // ================= ADD TO CART =================
  const handleAddToCart = () => {
    if (existingItem) {
      const newQty = existingItem.quantity + quantity;

      if (newQty > MAX_QUANTITY) {
        alert(`Maximum ${MAX_QUANTITY} items allowed`);
        return;
      }
    }

    addToCart({ ...product, quantity });
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-yellow-400 text-xl">
          Loading product...
        </div>
      </div>
    );
  }

  // ================= NOT FOUND =================
  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
        <h2 className="text-2xl mb-4 text-red-500">
          Product Not Found
        </h2>
        <button
          onClick={() => navigate("/watches")}
          className="bg-yellow-500 px-6 py-2 rounded text-black"
        >
          Back to Products
        </button>
      </div>
    );
  }

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
            onError={(e) =>
              (e.target.src =
                "https://via.placeholder.com/600")
            }
          />

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-4 mt-4">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="thumb"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border ${
                    selectedImage === img
                      ? "border-yellow-400"
                      : "border-gray-600"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            {product.name}
          </h1>

          <p className="text-3xl font-semibold mb-6">
            ₹ {product.price}
          </p>

          <p className="text-gray-400 mb-8">
            {product.description}
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-5 mb-6">
            <button
              onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
              className="bg-gray-800 px-4 py-2 rounded"
            >
              -
            </button>

            <span className="text-xl">{quantity}</span>

            <button
              onClick={() =>
                setQuantity((q) =>
                  q < MAX_QUANTITY ? q + 1 : MAX_QUANTITY
                )
              }
              className="bg-gray-800 px-4 py-2 rounded"
            >
              +
            </button>
          </div>

          <p className="mb-6">
            Total:{" "}
            <span className="text-yellow-400 font-bold">
              ₹ {totalPrice}
            </span>
          </p>

          <div className="flex gap-6">
            {isInCart ? (
              <button
                onClick={() => navigate("/cart")}
                className="bg-green-600 px-8 py-3 rounded-lg"
              >
                Go to Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="bg-yellow-500 text-black px-8 py-3 rounded-lg"
              >
                Add to Cart
              </button>
            )}

            <button onClick={handleWishlist}>
              <FaHeart
                className={
                  wishlist ? "text-red-500" : "text-gray-500"
                }
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;