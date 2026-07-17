import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import api from "../../api/axios";
import MediaUploader from "../../components/MediaUploader";
import Loader from "../../components/ProtectedRoute";

const emptyForm = {
  name: "",
  category: "",
  gender: "unisex",
  concentration: "",
  shortDescription: "",
  description: "",
  isFeatured: false,
  isBestseller: false,
  variants: [{ size: "", price: "", compareAtPrice: "", stock: "", sku: "" }],
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    api
      .get("/admin/products")
      .then(({ data }) => setProducts(data.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProducts, []);

  const openCreate = () => {
    setForm(emptyForm);
    setMediaFiles([]);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      gender: product.gender,
      concentration: product.concentration || "",
      shortDescription: product.shortDescription || "",
      description: product.description,
      isFeatured: product.isFeatured,
      isBestseller: product.isBestseller,
      variants: product.variants.map((v) => ({
        ...v,
        price: String(v.price),
        stock: String(v.stock),
        compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : "",
      })),
    });
    setMediaFiles([]);
    setEditingId(product._id);
    setShowForm(true);
  };

  const updateVariant = (idx, field, value) => {
    const variants = [...form.variants];
    variants[idx] = { ...variants[idx], [field]: value };
    setForm({ ...form, variants });
  };

  const addVariant = () =>
    setForm({
      ...form,
      variants: [
        ...form.variants,
        { size: "", price: "", compareAtPrice: "", stock: "", sku: "" },
      ],
    });
  const removeVariant = (idx) =>
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "variants") {
          formData.append(
            "variants",
            JSON.stringify(
              value.map((v) => ({
                ...v,
                price: Number(v.price),
                compareAtPrice: v.compareAtPrice
                  ? Number(v.compareAtPrice)
                  : undefined,
                stock: Number(v.stock),
              })),
            ),
          );
        } else {
          formData.append(key, value);
        }
      });
      mediaFiles.forEach((f) => formData.append("media", f));

      if (editingId) {
        await api.patch(`/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated.");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product created.");
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this product? It will be hidden from the store."))
      return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deactivated.");
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Products</h1>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> New Product
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-surface-container-lowest rounded-md overflow-auto">
          <table className="md:w-full text-sm items-center">
            <thead className="bg-surface-container-high text-left">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p._id}
                  className="border-t border-surface-container-high"
                >
                  <td className="p-3 flex items-center gap-3 ">
                    <img
                      src={
                        p.media?.[0]?.url?.startsWith("/uploads/")
                          ? `${import.meta.env.VITE_API_URL}${p.media[0].url}`
                          : p.media?.[0]?.url
                      }
                      alt={p.name}
                      className="w-10 h-10 rounded-sm object-cover"
                    />
                    <span className="md:font-medium text-xs">{p.name}</span>
                  </td>
                  <td className="p-3 pl-5">{p.category}</td>
                  <td className="p-3">₹{p.variants?.[0]?.price}</td>
                  <td className="p-3">
                    {p.variants?.reduce((sum, v) => sum + v.stock, 0)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${p.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className=" flex gap-4 mb-6">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-primary"
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-error "
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-md w-full max-w-2xl my-8 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">
                {editingId ? "Edit Product" : "New Product"}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <FiX size={20} />
              </button>
            </div>

            {editingId && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Uploaded Media</h3>
                <div className="flex flex-wrap gap-3">
                  {(products.find((p) => p._id === editingId)?.media || []).map(
                    (m, i) => {
                      const src = m.url?.startsWith("/uploads/")
                        ? `${import.meta.env.VITE_API_URL}${m.url}`
                        : m.url;

                      return (
                        <div key={`${m.url || "media"}-${i}`} className="w-24">
                          {m.type === "video" ? (
                            <video
                              src={src}
                              muted
                              className="w-24 h-16 object-cover rounded-sm bg-black/10"
                            />
                          ) : (
                            <img
                              src={src}
                              alt={m.alt || "product media"}
                              className="w-24 h-16 object-cover rounded-sm"
                            />
                          )}

                          <div className="mt-1 text-[10px] text-on-surface-variant truncate">
                            {m.type}
                          </div>

                          <button
                            type="button"
                            className="text-error text-xs underline mt-1"
                            onClick={async () => {
                              const ok = confirm(
                                "Delete this media from the product?",
                              );
                              if (!ok) return;

                              try {
                                await api.patch(`/products/${editingId}`, {
                                  removeMedia: JSON.stringify([m.url]),
                                });
                                toast.success("Media deleted.");
                                fetchProducts();
                              } catch (err) {
                                toast.error(err.message);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                placeholder="Product Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Category (e.g. Oud, Attar)"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="input-field"
                />
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="input-field"
                >
                  <option value="unisex">Unisex</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </div>

              <input
                placeholder="Concentration (e.g. Pure Attar)"
                value={form.concentration}
                onChange={(e) =>
                  setForm({ ...form, concentration: e.target.value })
                }
                className="input-field"
              />
              <input
                placeholder="Short Description"
                value={form.shortDescription}
                onChange={(e) =>
                  setForm({ ...form, shortDescription: e.target.value })
                }
                className="input-field"
              />
              <textarea
                required
                placeholder="Full Description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="input-field"
              />

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm({ ...form, isFeatured: e.target.checked })
                    }
                  />{" "}
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isBestseller}
                    onChange={(e) =>
                      setForm({ ...form, isBestseller: e.target.checked })
                    }
                  />{" "}
                  Bestseller
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold">
                    Variants (Size / Price / Stock)
                  </label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="text-xs text-primary font-semibold"
                  >
                    + Add Variant
                  </button>
                </div>
                {form.variants.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 mb-2">
                    <input
                      required
                      placeholder="Size"
                      value={v.size}
                      onChange={(e) =>
                        updateVariant(idx, "size", e.target.value)
                      }
                      className="input-field text-xs"
                    />
                    <input
                      required
                      type="number"
                      placeholder="Price"
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(idx, "price", e.target.value)
                      }
                      className="input-field text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Compare At"
                      value={v.compareAtPrice}
                      onChange={(e) =>
                        updateVariant(idx, "compareAtPrice", e.target.value)
                      }
                      className="input-field text-xs"
                    />
                    <input
                      required
                      type="number"
                      placeholder="Stock"
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(idx, "stock", e.target.value)
                      }
                      className="input-field text-xs"
                    />
                    <div className="flex gap-1">
                      <input
                        required
                        placeholder="SKU"
                        value={v.sku}
                        onChange={(e) =>
                          updateVariant(idx, "sku", e.target.value)
                        }
                        className="input-field text-xs"
                      />
                      {form.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="text-error"
                        >
                          <FiX size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Product Media (Images &amp; Videos)
                </label>
                <MediaUploader
                  files={mediaFiles}
                  onChange={setMediaFiles}
                  maxFiles={10}
                  label="Upload product photos/videos —"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
