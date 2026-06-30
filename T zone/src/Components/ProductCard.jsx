import React, { useRef } from "react";
import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WishlistContext";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaStar, FaHeart } from "react-icons/fa";

const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgNjAwIDYwMCI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Q0EzQUYiPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=";

const ProductCard = ({ product }) => {
  const { cart, addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const navigate = useNavigate();
  const cardRef = useRef(null);

  const isInCart = cart.some((item) => item._id === product._id);
  const inWishlist = isInWishlist(product._id);

  const getProductImage = () =>
    product.images?.[0] || PLACEHOLDER_IMAGE;

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `
      perspective(1000px)
      rotateX(${-rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
    `;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  const handleWishlist = (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    inWishlist
      ? removeFromWishlist(product._id)
      : addToWishlist(product);
  };

  const handleCartAction = (e) => {
    e.stopPropagation();
    if (isInCart) {
      navigate("/cart");
    } else {
      addToCart(product);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/product/${product._id}`)}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm hover:shadow-xl transition-all duration-300 p-4 flex flex-col justify-between w-full cursor-pointer transform-gpu overflow-hidden"
    >
      {/* Wishlist Button */}
      <button
        type="button"
        onClick={handleWishlist}
        className={`absolute top-3.5 right-3.5 z-10 p-2 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md rounded-full shadow-sm hover:scale-110 active:scale-90 transition-all duration-200 ${
          !user ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <FaHeart
          className={`text-base transition-colors duration-250 ${
            inWishlist ? "text-red-500" : "text-gray-400 dark:text-gray-500 hover:text-red-400"
          }`}
        />
      </button>

      <div className="space-y-4">
        {/* Product Image Wrapper */}
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 border border-gray-100 dark:border-gray-850/50">
          <img
            src={getProductImage()}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER_IMAGE;
            }}
            className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-2 text-left">
          {product.brand && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-500">
              {product.brand}
            </span>
          )}
          
          <h2 className="text-sm font-bold text-gray-800 dark:text-white truncate group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors duration-200">
            {product.name}
          </h2>

          {/* Rating stars */}
          <div className="flex items-center gap-1 text-yellow-400 text-[10px]">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={
                    star <= Math.round(product.averageRating || 0)
                      ? "text-yellow-400"
                      : "text-gray-300 dark:text-gray-700"
                  }
                />
              ))}
            </div>
            <span className="text-gray-500 dark:text-gray-400 ml-1 font-medium">
              ({(product.averageRating || 0).toFixed(1)})
            </span>
          </div>

          <p className="text-gray-900 dark:text-white font-extrabold text-sm pt-1">
            ₹ {(product.price || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleCartAction}
          className={`w-full py-2.5 px-4 text-xs font-bold rounded-full transition-all duration-200 active:scale-95 ${
            isInCart
              ? "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/10"
              : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 shadow-md shadow-black/10"
          }`}
        >
          {isInCart ? "Go to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);