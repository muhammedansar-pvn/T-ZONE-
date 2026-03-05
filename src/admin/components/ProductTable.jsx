import { Link } from "react-router-dom";

const ProductTable = ({ products, onDelete }) => {
  return (
    <table className="w-full bg-white rounded-xl shadow">
      <thead className="bg-gray-200">
        <tr>
          <th className="p-3 text-left">Image</th>
          <th>Name</th>
          <th>Price</th>
          <th>Category</th>
          <th>Stock</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="border-t text-center">
            <td className="p-2">
              <img
                src={product.image}
                alt={product.name}
                className="w-14 h-14 object-cover rounded"
              />
            </td>
            <td>{product.name}</td>
            <td>₹{product.price}</td>
            <td>{product.category}</td>
            <td>{product.stock}</td>

            <td className="space-x-2">
              <Link
                to={`/admin/products/edit/${product.id}`}
                className="bg-yellow-500 px-3 py-1 rounded text-black"
              >
                Edit
              </Link>

              <button
                onClick={() => onDelete(product.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;