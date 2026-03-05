import { useContext } from "react";
import { WishlistContext } from "../Context/WishlistContext";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } =
    useContext(WishlistContext);
    

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>

      {wishlist.length === 0 ? (
        <p>No items in wishlist</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white shadow p-4 rounded">
              <img src={item.images[0]} alt={item.name} />
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="text-red-500 mt-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
