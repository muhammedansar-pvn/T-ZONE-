import { useEffect, useState, useContext } from "react";
import axios from "axios";
import ProductCard from "../Components/Productcard";
import { SearchContext } from "../Context/SearchContext";

const Watches = () => {
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { searchTerm } = useContext(SearchContext);

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchWatches = async () => {
      try {
        const res = await axios.get("http://localhost:5000/watches");
        setWatches(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, []);

  // Filter
  const filteredWatches =
    !searchTerm || searchTerm.trim() === ""
      ? watches
      : watches.filter((watch) =>
          watch?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  //  Pagination Logic
  const totalPages = Math.ceil(filteredWatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentWatches = filteredWatches.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading Watches...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 w-full px-6 py-8">

      {filteredWatches.length === 0 ? (
        <h2 className="text-center text-xl text-gray-500">
          No matching watches found.
        </h2>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full">
            {currentWatches.map((watch) => (
              <ProductCard key={watch.id} watch={watch} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-10 gap-2 flex-wrap">

            {/* Prev */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-40"
            >
              Prev
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                {index + 1}
              </button>
            ))}

            {/* Next */}
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-40"
            >
              Next
            </button>

          </div>
        </>
      )}
    </div>
  );
};

export default Watches;
