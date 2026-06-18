import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WishlistContext";
import { useAuth } from "../Context/AuthContext";
import { FaStar, FaHeart } from "react-icons/fa";
import { getProductById } from "../services/productService";
import API from "../config/api";

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

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const isInCart = cart.some((item) => String(item._id) === String(id));

  const inWishlist = product ? isInWishlist(product._id) : false;

  // ================= FETCH REVIEWS =================
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

    fetchReviews();
  }, [id]);

  // ================= SUBMIT REVIEW =================
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

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={
                  star <= Math.round(averageRating)
                    ? "text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }
              />
            ))}
            <span className="text-gray-500 ml-2 text-sm">
              ({averageRating.toFixed(1)} / 5 from {reviewsCount} reviews)
            </span>
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
