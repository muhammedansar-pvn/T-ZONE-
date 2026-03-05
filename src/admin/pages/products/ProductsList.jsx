// src/admin/pages/products/ProductList.jsx

import { useEffect, useState, useMemo } from "react";
import { getProducts, deleteProduct } from "../../../services/productService";
import { Link } from "react-router-dom";

const ITEMS_PER_PAGE = 5;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All");
  const [sortOption, setSortOption] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // ================= IMAGE HELPER =================
  const getProductImage = (item) =>
    item.images?.[0] ||
    item.image ||
    "https://via.placeholder.com/100";

  // ================= FETCH =================
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, stockFilter, sortOption]);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ================= BULK DELETE =================
  const handleBulkDelete = async () => {
    if (!window.confirm("Delete selected products?")) return;

    try {
      await Promise.all(selectedProducts.map((id) => deleteProduct(id)));

      setProducts((prev) =>
        prev.filter((item) => !selectedProducts.includes(item.id))
      );
      setSelectedProducts([]);
    } catch (err) {
      console.error("Bulk delete error:", err);
    }
  };

  // ================= FILTER + SORT =================
  const processedProducts = useMemo(() => {
    let filtered = products.filter((item) => {
      const matchesSearch = item.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "In Stock" && item.stock > 0) ||
        (stockFilter === "Out of Stock" && item.stock === 0);

      return matchesSearch && matchesStock;
    });

    switch (sortOption) {
      case "priceLow":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "nameAZ":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "stockHigh":
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }

    return filtered;
  }, [products, search, stockFilter, sortOption]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = processedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>

        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Selected ({selectedProducts.length})
            </button>
          )}

          <Link
            to="/admin/products/add"
            className="bg-black text-white px-4 py-2 rounded"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow">
            <thead className="bg-gray-200">
              <tr>
                <th></th>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-8 text-center text-gray-500 font-semibold"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t text-center hover:bg-gray-50"
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([
                              ...selectedProducts,
                              item.id,
                            ]);
                          } else {
                            setSelectedProducts(
                              selectedProducts.filter(
                                (id) => id !== item.id
                              )
                            );
                          }
                        }}
                      />
                    </td>

                    <td className="p-3">
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        onClick={() =>
                          setPreviewImage(getProductImage(item))
                        }
                        className="w-14 h-14 object-cover rounded cursor-pointer hover:scale-110 transition"
                      />
                    </td>

                    <td>{item.name}</td>
                    <td>₹{item.price}</td>

                    <td
                      className={`font-semibold ${
                        item.stock > 0
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {item.stock > 0 ? item.stock : "Out"}
                    </td>

                    <td className="space-x-2">
                      <Link
                        to={`/admin/products/edit/${item.id}`}
                        className="bg-yellow-500 px-3 py-1 rounded"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative bg-white p-4 rounded-xl shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
            >
              ✕
            </button>

            <img
              src={previewImage}
              alt="Preview"
              className="w-full max-h-[500px] object-contain rounded"
            />
          </div>
        </div>
      )}

      {/* PAGINATION */}
{totalPages > 1 && (
  <div className="flex justify-center gap-2 mt-6">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => prev - 1)}
      className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
    >
      Prev
    </button>

    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-3 py-1 rounded ${
          currentPage === i + 1
            ? "bg-black text-white"
            : "bg-gray-200"
        }`}
      >
        {i + 1}
      </button>
    ))}

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((prev) => prev + 1)}
      className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
)}
    </div>
  );
};

export default ProductList;