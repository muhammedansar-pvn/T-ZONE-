import { useContext } from "react";
import { CartContext } from "../Context/CartContext";
import { useNavigate } from "react-router-dom";
import React from "react";
import { FaStar } from "react-icons/fa";

const ProductCard = ({ watch }) => {
  const { cart, addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const isInCart = cart.some((item) => item.id === watch.id);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition duration-300 p-4 text-center w-full">

      {/* Image */}
      <div className="overflow-hidden rounded-lg">
        <img
          src={watch.image}
          alt={watch.name}
          loading="lazy"
          className="w-full h-48 object-cover hover:scale-105 transition duration-300"
        />
      </div>

      {/* Name */}
      <h2 className="mt-3 text-sm font-semibold truncate text-gray-800 dark:text-white">
        {watch.name}
      </h2>

      {/* Brand */}
      <p className="text-xs text-gray-500 mt-1">
        {watch.brand}
      </p>

      {/* Rating */}
      <div className="flex justify-center items-center gap-1 mt-1 text-yellow-400 text-xs">
        <FaStar />
        <FaStar />
        <FaStar />
        <FaStar />
        <FaStar className="text-gray-300" />
        <span className="text-gray-500 ml-1">(4.0)</span>
      </div>

      {/* Price */}
      <p className="text-yellow-500 font-semibold mt-2 text-sm">
        ₹ {watch.price}
      </p>

      {/* Buttons */}
      <div className="mt-3 flex justify-center gap-2">

        {isInCart ? (
          <button
            onClick={() => navigate("/cart")}
            className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700 transition"
          >
            Go to Cart
          </button>
        ) : (
          <button
            onClick={() => addToCart(watch)}
            className="bg-black text-white px-3 py-1 text-xs rounded hover:bg-gray-800 transition"
          >
            Add
          </button>
        )}

        <button
          onClick={() => navigate(`/product/${watch.id}`)}
          className="bg-yellow-500 px-3 py-1 text-xs rounded hover:bg-yellow-600 transition"
        >
          View
        </button>

      </div>
    </div>
  );
};

export default React.memo(ProductCard);
