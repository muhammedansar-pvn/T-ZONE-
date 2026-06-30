import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WishlistContext";
import { useAuth } from "../Context/AuthContext";
import { FaStar, FaHeart } from "react-icons/fa";
import { getProductById } from "../services/productService";
import API from "../config/api";

const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgNjAwIDYwMCI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Q0EzQUYiPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=";

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

  
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const isInCart = cart.some((item) => String(item._id) === String(id));

  const inWishlist = product ? isInWishlist(product._id) : false;

  
  const fetchReviews = async () => {
    try {
      const res = await API.get(`/products/${id}/reviews`);
      setReviews(res.data.reviews || []);
      setAverageRating(res.data.averageRating || 0);
      setReviewsCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  
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
          normalizedImages[0] || PLACEHOLDER_IMAGE,
        );
      })
      .catch((err) => {
        console.log(err);
        setProduct(null);
      });

    fetchReviews();
  }, [id]);

  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    if (!userComment.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      setSubmittingReview(true);
      await API.post(`/products/${id}/reviews`, {
        rating: Number(userRating),
        comment: userComment.trim(),
      });
      setUserComment("");
      await fetchReviews();
      alert("Review submitted successfully! ✅");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  

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

  

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* IMAGE SECTION */}
        <div className="w-full lg:col-span-7 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center aspect-square overflow-hidden group">
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
              onError={(e) => {
                if (selectedImage !== PLACEHOLDER_IMAGE) {
                  setSelectedImage(PLACEHOLDER_IMAGE);
                }
              }}
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-4 justify-center overflow-x-auto py-2">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="thumb"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 object-contain p-2 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                    selectedImage === img
                      ? "border-yellow-500 scale-105"
                      : "border-gray-200 dark:border-gray-850 hover:border-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="w-full lg:col-span-5 lg:sticky lg:top-24 space-y-6 lg:pl-4">
          <div className="space-y-2">
            {product.brand && (
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 px-3 py-1 rounded-full">
                {product.brand}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={
                    star <= Math.round(averageRating)
                      ? "text-yellow-400 text-base"
                      : "text-gray-300 dark:text-gray-700 text-base"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {averageRating.toFixed(1)} ({reviewsCount} reviews)
            </span>
          </div>

          <div className="border-y border-gray-100 dark:border-gray-800 py-4">
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
              ₹ {(product.price || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Description</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity */}
          <div className="space-y-3 pt-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Quantity</span>
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-full w-fit bg-gray-50 dark:bg-gray-900 p-1">
              <button
                type="button"
                onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white rounded-full transition hover:bg-gray-200 dark:hover:bg-gray-800 font-bold"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-bold text-gray-900 dark:text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => (prev < 5 ? prev + 1 : prev))}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white rounded-full transition hover:bg-gray-200 dark:hover:bg-gray-850 font-bold"
                disabled={quantity >= 5}
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            {isInCart ? (
              <button
                onClick={() => navigate("/cart")}
                className="flex-1 bg-green-600 text-white font-bold py-3.5 px-6 rounded-full hover:bg-green-700 active:scale-98 transition duration-200 shadow-md shadow-green-600/10 text-center text-sm"
              >
                Go to Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-3.5 px-6 rounded-full hover:opacity-90 active:scale-98 transition duration-200 shadow-md shadow-black/10 text-center text-sm"
              >
                Add to Cart
              </button>
            )}

            <button
              onClick={handleWishlist}
              disabled={!user}
              className={`p-3.5 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center transition-all duration-200 active:scale-95 ${
                !user
                  ? "opacity-50 cursor-not-allowed text-gray-300"
                  : inWishlist
                  ? "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-500"
                  : "text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <FaHeart className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= REVIEWS SECTION ================= */}
      <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Reviews</h2>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* REVIEWS LIST */}
          <div className="w-full lg:w-2/3 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-900 dark:text-white">{rev.name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="flex gap-1 text-yellow-400 text-sm mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={star <= rev.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* ADD REVIEW FORM */}
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Rating</label>
                    <select
                      value={userRating}
                      onChange={(e) => setUserRating(Number(e.target.value))}
                      className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded p-2 text-sm focus:border-yellow-500 outline-none"
                    >
                      <option value="5">5 Stars - Excellent</option>
                      <option value="4">4 Stars - Good</option>
                      <option value="3">3 Stars - Average</option>
                      <option value="2">2 Stars - Poor</option>
                      <option value="1">1 Star - Very Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Your Comment</label>
                    <textarea
                      rows="4"
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Share your thoughts about this watch..."
                      className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded p-2 text-sm focus:border-yellow-500 outline-none resize-none"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-yellow-500 text-black py-2 rounded font-semibold hover:bg-yellow-600 transition text-sm disabled:opacity-60"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Please log in to leave a review</p>
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition text-xs"
                  >
                    Log In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
