import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  getProductById,
  updateProduct,
} from "../../../services/productService";

const MAX_IMAGES = 5;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [imageInput, setImageInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);

        const normalizedData = {
          ...data,
          images: data.images || (data.image ? [data.image] : []),
        };

        setForm(normalizedData);
      } catch (err) {
        console.error(err);
        alert("Failed to load product");
      }
    };

    fetchProduct();
  }, [id]);

  /* ================= VALIDATION ================= */

  const validate = (currentForm) => {
    let newErrors = {};

    if (!currentForm.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!currentForm.price || Number(currentForm.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!currentForm.category) {
      newErrors.category = "Category is required";
    }

    if (!currentForm.images || currentForm.images.length === 0) {
      newErrors.images = "At least one image required";
    }

    if (!currentForm.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (currentForm.stock === "" || Number(currentForm.stock) < 0) {
      newErrors.stock = "Stock must be 0 or more";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= CLOUDINARY UPLOAD ================= */

  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();

    data.append("file", file);
    data.append("upload_preset", "T-zone");

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dit40na4i/image/upload",
      data
    );

    return res.data.secure_url;
  };

  /* ================= FILE IMAGE UPLOAD ================= */

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (form.images.length + files.length > MAX_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        images: `Maximum ${MAX_IMAGES} images allowed`,
      }));
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));

    if (invalidFile) {
      setErrors((prev) => ({
        ...prev,
        images: "Only image files are allowed",
      }));
      return;
    }

    try {
      setLoading(true);

      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const url = await uploadImageToCloudinary(file);

          if (form.images.includes(url)) return null;

          return url;
        })
      );

      const filteredImages = uploadedImages.filter(Boolean);

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...filteredImages],
      }));

      setErrors((prev) => ({ ...prev, images: "" }));
    } catch (error) {
      console.error("Image upload error:", error);

      setErrors((prev) => ({
        ...prev,
        images: "Image upload failed",
      }));
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD IMAGE URL ================= */

  const handleAddImage = () => {
    const trimmed = imageInput.trim();

    if (!trimmed) {
      setErrors((prev) => ({
        ...prev,
        images: "Enter image URL",
      }));
      return;
    }

    if (!/^https?:\/\//i.test(trimmed)) {
      setErrors((prev) => ({
        ...prev,
        images: "Enter valid image URL",
      }));
      return;
    }

    if (form.images.includes(trimmed)) {
      setErrors((prev) => ({
        ...prev,
        images: "Image already added",
      }));
      return;
    }

    if (form.images.length >= MAX_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        images: `Maximum ${MAX_IMAGES} images allowed`,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, trimmed],
    }));

    setImageInput("");
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  /* ================= REMOVE IMAGE ================= */

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentForm = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      images: form.images,
      description: form.description.trim(),
      stock: Number(form.stock),
    };

    if (!validate(currentForm)) return;

    try {
      setLoading(true);

      const { data: products } = await axios.get(
        "http://localhost:5000/products"
      );

      const duplicate = products.find(
        (p) =>
          p.name.toLowerCase() === currentForm.name.toLowerCase() &&
          p.id !== id
      );

      if (duplicate) {
        setErrors((prev) => ({
          ...prev,
          name: "Product name already exists",
        }));
        setLoading(false);
        return;
      }

      await updateProduct(id, currentForm);

      alert("Product Updated Successfully ✅");

      navigate("/admin/products");
    } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <p>Loading...</p>;

  /* ================= UI ================= */

  return (
    <div className="max-w-xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4"
      >
        <h2 className="text-xl font-bold">Edit Product</h2>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full p-2 border rounded"
        />

        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full p-2 border rounded"
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Category</option>
          <option value="sports">Sports</option>
          <option value="luxury">Luxury</option>
          <option value="casual">Casual</option>
        </select>

        {/* IMAGE URL */}

        <div className="flex gap-2">
          <input
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="Add Image URL"
            className="w-full p-2 border rounded"
          />

          <button
            type="button"
            onClick={handleAddImage}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add
          </button>
        </div>

        {/* FILE UPLOAD */}

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full"
        />

        {errors.images && (
          <p className="text-red-500 text-sm">{errors.images}</p>
        )}

        {/* IMAGE PREVIEW */}

        <div className="flex flex-wrap gap-3">
          {form.images.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={img}
                alt="preview"
                className="w-24 h-24 object-cover rounded border"
              />

              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded"
              >
                X
              </button>
            </div>
          ))}
        </div>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock"
          className="w-full p-2 border rounded"
        />

        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;