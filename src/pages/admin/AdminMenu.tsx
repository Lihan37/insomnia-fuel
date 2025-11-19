// src/pages/admin/AdminMenu.tsx
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "@/lib/api";
import type { IMenuItem, MenuCategory } from "@/types/menu";
import { Trash2, Pencil, Loader2, X } from "lucide-react";
import Swal from "sweetalert2";

const categories: { value: MenuCategory; label: string }[] = [
  { value: "bowl", label: "Bowl" },
  { value: "sandwich", label: "Sandwich / Toastie" },
  { value: "wrap", label: "Wrap" },
  { value: "breakfast", label: "Breakfast" },
  { value: "drink", label: "Drink" },
  { value: "other", label: "Other" },
];

export default function AdminMenu() {
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // which item is in edit mode
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<IMenuItem>({
    name: "",
    description: "",
    category: "bowl",
    section: "",
    price: 0,
    isAvailable: true,
    isFeatured: false,
  });

  const isEditing = Boolean(editingId);

  // Fetch existing menu items
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<{ items: IMenuItem[] }>("/api/menu");
        setItems(res.data.items || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load menu items.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";

    setForm((prev) => ({
      ...prev,
      [name]: isCheckbox
        ? (e.target as HTMLInputElement).checked
        : name === "price"
        ? Number(value)
        : value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "bowl",
      section: "",
      price: 0,
      isAvailable: true,
      isFeatured: false,
    });
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.category || !form.price) {
      setError("Name, category and price are required.");
      return;
    }

    try {
      setSaving(true);

      // don't send _id field to backend
      const { _id, ...payload } = form as any;

      if (editingId) {
        // UPDATE
        const res = await api.put<IMenuItem>(
          `/api/menu/${editingId}`,
          payload
        );

        setItems((prev) =>
          prev.map((item) =>
            item._id === editingId ? res.data : item
          )
        );

        Swal.fire({
          icon: "success",
          title: "Menu item updated",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        // CREATE
        const res = await api.post<IMenuItem>("/api/menu", payload);

        setItems((prev) => [res.data, ...prev]);

        Swal.fire({
          icon: "success",
          title: "Menu item added",
          timer: 1200,
          showConfirmButton: false,
        });
      }

      resetForm();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: "Could not save the menu item. Please try again.",
      });
      setError("Failed to save menu item.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (item: IMenuItem) => {
    setEditingId(item._id ?? null);
    setForm({
      ...item,
      section: item.section || "",
      description: item.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this item?",
      text: "This cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#b91c1c",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/menu/${id}`);
      setItems((prev) => prev.filter((item) => item._id !== id));

      if (editingId === id) {
        resetForm();
      }

      Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: "Could not delete the menu item. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1E2B4F]">
            Menu Manager
          </h2>
          <p className="text-sm text-neutral-600">
            Create, update and organise the Insomnia Fuel menu.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:p-5 md:grid-cols-2"
      >
        {error && (
          <div className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-neutral-800">
            Item name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
            placeholder="Peruvian Andes Bowl"
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-neutral-800">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-neutral-800">
            Section (optional)
          </label>
          <input
            type="text"
            name="section"
            value={form.section || ""}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
            placeholder="Global Bowls / Gourmet Toasties"
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-neutral-800">
            Price (AUD)
          </label>
          <input
            type="number"
            name="price"
            value={form.price || ""}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
            placeholder="16.9"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-800">
            Description
          </label>
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
            rows={3}
            placeholder="Charred corn, chimichurri, black beans, lime crema..."
          />
        </div>

        <div className="flex items-center gap-4 md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
              className="h-4 w-4 rounded border-neutral-300"
            />
            <span>Available</span>
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured ?? false}
              onChange={handleChange}
              className="h-4 w-4 rounded border-neutral-300"
            />
            <span>Feature on main menu</span>
          </label>
        </div>

        <div className="md:col-span-2 flex items-center justify-between">
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100"
            >
              <X className="h-3 w-3" />
              Cancel editing
            </button>
          )}

          <div className="flex-1" />

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E2B4F] px-4 py-2 text-sm font-medium text-white hover:bg-[#263567] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isEditing ? "Update item" : "Add item"}</span>
          </button>
        </div>
      </form>

      {/* List */}
      <div className="rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700">
          Existing menu items
        </div>

        {loading ? (
          <div className="p-4 text-sm text-neutral-600">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-neutral-600">
            No items yet. Add your first menu item above.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1E2B4F]">
                      {item.name}
                    </span>
                    {item.isFeatured && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                        Featured
                      </span>
                    )}
                    {!item.isAvailable && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-600">
                    {item.section && (
                      <span className="mr-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-600">
                        {item.section}
                      </span>
                    )}
                    <span className="text-[11px] uppercase tracking-wide text-neutral-500">
                      {item.category}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-1 text-xs text-neutral-600 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#1E2B4F]">
                    ${item.price.toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleEditClick(item)}
                    className="inline-flex items-center rounded-lg border border-neutral-200 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="inline-flex items-center rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
