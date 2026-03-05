import React, { useContext, useRef } from "react";
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaStar, FaHeart } from "react-icons/fa";

const ProductCard = ({ product }) => {
  const { cart, addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useContext(WishlistContext);
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();
  const cardRef = useRef(null);

  const isInCart = cart.some((item) => item.id === product.id);
  const inWishlist = isInWishlist(product.id);

  // ✅ Safe Image Getter
  const getProductImage = () =>
    product.images?.[0] ||
    product.image ||
    "https://via.placeholder.com/300";

  // ✅ 3D Tilt Effect
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `
      perspective(1000px)
      rotateX(${-rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.03)
    `;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  // ✅ Wishlist Handler (Login Protected)
  const handleWishlist = (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    inWishlist
      ? removeFromWishlist(product.id)
      : addToWishlist(product);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/product/${product.id}`)}
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition duration-300 p-4 text-center w-full transform-gpu cursor-pointer"
    >
      {/* ❤️ Wishlist */}
      <button
        onClick={handleWishlist}
        className={`absolute top-3 right-3 text-lg transition hover:scale-125 ${
          !user ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <FaHeart
          className={`${
            inWishlist ? "text-red-500 scale-110" : "text-gray-400"
          } transition`}
        />
      </button>

      {/* 🖼 Image */}
      <div className="overflow-hidden rounded-lg">
        <img
          src={getProductImage()}
          alt={product.name}
          loading="lazy"
          onError={(e) =>
            (e.target.src = "https://via.placeholder.com/300")
          }
          className="w-full h-48 object-cover transition duration-300 hover:scale-110"
        />
      </div>

      {/* 🏷 Name */}
      <h2 className="mt-3 text-sm font-semibold truncate text-gray-800 dark:text-white">
        {product.name}
      </h2>

      {/* 🏢 Brand */}
      {product.brand && (
        <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
      )}

      {/* ⭐ Rating */}
      <div className="flex justify-center items-center gap-1 mt-1 text-yellow-400 text-xs">
        <FaStar />
        <FaStar />
        <FaStar />
        <FaStar />
        <FaStar className="text-gray-300" />
        <span className="text-gray-500 ml-1">(4.0)</span>
      </div>

      {/* 💰 Price */}
      <p className="text-yellow-500 font-semibold mt-2 text-sm">
        ₹ {product.price}
      </p>

      {/* 🛒 Buttons */}
      <div className="mt-3 flex justify-center gap-2">
        {isInCart ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/cart");
            }}
            className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700 transition"
          >
            Go to Cart
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="bg-black text-white px-3 py-1 text-xs rounded hover:bg-gray-800 transition"
          >
            Add
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product.id}`);
          }}
          className="bg-yellow-500 px-3 py-1 text-xs rounded hover:bg-yellow-600 transition"
        >
          View
        </button>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);