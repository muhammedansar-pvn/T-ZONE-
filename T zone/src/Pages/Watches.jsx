import { useEffect, useState } from "react";
import ProductCard from "../Components/ProductCard";
import { useSearch } from "../Context/SearchContext";
import { getProducts } from "../services/productService";

const Watches = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { searchTerm } = useSearch();

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        const productsList = data && Array.isArray(data.products) ? data.products : [];
        setProducts(productsList);
      } catch (err) {
        console.error("Fetch Error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        if (!product) return false;
        const matchesSearch =
          !searchTerm ||
          searchTerm.trim() === "" ||
          product?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" ||
          product?.category?.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
      })
    : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);
const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;

const currentProducts = filteredProducts.slice(
  startIndex,
  startIndex + itemsPerPage
);



  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading Products...</p>
      </div>
    );
  }

  const categories = [
    { id: "all", name: "All Watches" },
    { id: "sports", name: "Sports" },
    { id: "luxury", name: "Luxury" },
    { id: "casual", name: "Casual" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Our Collection
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
            Explore our curated range of premium timepieces, handpicked for every lifestyle.
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 justify-center no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold border transition duration-200 shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-yellow-500 text-black border-yellow-500 shadow-md shadow-yellow-500/10"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <h2 className="text-center text-xl text-gray-500 dark:text-gray-400 py-10">
            No matching products found.
          </h2>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 w-full">
              {currentProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-12 gap-2 flex-wrap pt-6 border-t border-gray-150 dark:border-gray-900">
              {/* Prev */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 text-sm font-semibold rounded-full border border-gray-300 dark:border-gray-700 text-gray-750 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
              >
                Prev
              </button>

              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-full border transition ${
                    currentPage === index + 1
                      ? "bg-yellow-500 text-black border-yellow-500 shadow-sm shadow-yellow-500/10"
                      : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              {/* Next */}
              <button
                type="button"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 text-sm font-semibold rounded-full border border-gray-300 dark:border-gray-700 text-gray-750 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Watches;
