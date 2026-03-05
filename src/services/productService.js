import axios from "axios";

const API_URL = "http://localhost:5000/products";

/* ================= GET ALL PRODUCTS ================= */

export const getProducts = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error("Fetch Products Error:", error.message);
    throw error;
  }
};

/* ================= GET SINGLE PRODUCT ================= */

export const getProductById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("Fetch Product Error:", error.message);
    throw error;
  }
};

/* ================= ADD PRODUCT ================= */

export const addProduct = async (product) => {
  try {
    const newProduct = {
      name: product.name.trim(),
      price: Number(product.price),
      category: product.category,
      images: (product.images || []).slice(0, 4), // limit images
      description: product.description?.trim() || "",
      stock: Number(product.stock),
    };

    const payloadSize = JSON.stringify(newProduct).length;

    if (payloadSize > 100000) {
      throw new Error("Images too large. Please upload smaller images.");
    }

    const res = await axios.post(API_URL, newProduct);
    return res.data;
  } catch (error) {
    console.error("Add Product Error:", error.message);
    throw error;
  }
};

/* ================= UPDATE PRODUCT ================= */

export const updateProduct = async (id, product) => {
  try {
    const updatedProduct = {
      name: product.name.trim(),
      price: Number(product.price),
      category: product.category,
      images: (product.images || []).slice(0, 4),
      description: product.description?.trim() || "",
      stock: Number(product.stock),
    };

    const res = await axios.put(`${API_URL}/${id}`, updatedProduct);
    return res.data;
  } catch (error) {
    console.error("Update Product Error:", error.message);
    throw error;
  }
};

/* ================= DELETE PRODUCT ================= */

export const deleteProduct = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Delete Product Error:", error.message);
    throw error;
  }
};