import { useWishlist } from "../Context/WishlistContext";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgNjAwIDYwMCI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Q0EzQUYiPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white px-6 md:px-12 py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-yellow-500">My Wishlist</h2>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 text-lg">No items in your wishlist yet ❤️</p>
            <button
              onClick={() => navigate("/watches")}
              className="mt-6 bg-yellow-500 text-black px-6 py-2.5 rounded-full font-semibold hover:scale-105 transition"
            >
              Discover Watches
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/product/${item._id}`)}
                className="group cursor-pointer relative bg-white dark:bg-[#141418] border border-gray-200 dark:border-[#222228] p-4 rounded-2xl shadow hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                  <img
                    src={item.images?.[0] || PLACEHOLDER_IMAGE}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mt-3 truncate">
                  {item.name}
                </h3>
                <p className="text-yellow-500 font-bold mt-1">₹ {item.price}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(item._id);
                  }}
                  className="w-full mt-4 border border-red-500/30 text-red-500 py-2 rounded-xl text-xs hover:bg-red-500 hover:text-white transition duration-300 font-medium"
                >
                  Remove Item
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
