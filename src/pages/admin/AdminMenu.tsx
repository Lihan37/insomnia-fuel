import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { api } from "@/lib/api";
import type { IMenuItem, MenuCategory, IMenuSubItem } from "@/types/menu";
import { Trash2, Pencil, Loader2, X, Plus } from "lucide-react";
import Swal from "sweetalert2";

const categories: { value: MenuCategory; label: string }[] = [
  { value: "bowl", label: "Bowl" },
  { value: "sandwich", label: "Sandwich / Toastie" },
  { value: "wrap", label: "Wrap" },
  { value: "breakfast", label: "Breakfast" },
  { value: "drink", label: "Drink" },
  { value: "other", label: "Other" },
  { value: "addon", label: "Add-ons / Extras" },
];

const drinkSections = [
  { value: "HOT DRINKS", label: "Hot Drinks" },
  { value: "COLD DRINKS", label: "Cold Drinks" },
  { value: "ASSORTED TEA", label: "Assorted Tea" },
  { value: "DRINK EXTRAS", label: "Drink Extras" },
] as const;

const addonSectionPresets = [
  { value: "BREAKFAST EXTRAS", label: "Breakfast Extras" },
  { value: "HOT DRINKS", label: "Hot Drinks" },
  { value: "COLD DRINKS", label: "Cold Drinks" },
  { value: "ASSORTED TEA", label: "Assorted Tea" },
  { value: "DRINK EXTRAS", label: "Drink Extras" },
] as const;

export default function AdminMenu() {
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<IMenuItem>({
    name: "",
    description: "",
    category: "bowl",
    section: "",
    price: 0,
    isAvailable: true,
    isFeatured: false,
    subItems: [],
  });

  // ✅ Add-on form (creates NEW item with category "addon")
  const [addonForm, setAddonForm] = useState<IMenuItem>({
    name: "",
    description: "",
    category: "addon",
    section: "BREAKFAST EXTRAS",
    price: 0,
    isAvailable: true,
    isFeatured: false,
    subItems: [],
  });

  const isEditing = Boolean(editingId);

  const addonItems = useMemo(
    () => items.filter((i) => i.category === "addon"),
    [items]
  );

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

  const handleAddonChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";

    setAddonForm((prev) => ({
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
      subItems: [],
    });
    setEditingId(null);
    setError(null);
  };

  const resetAddonForm = () => {
    setAddonForm({
      name: "",
      description: "",
      category: "addon",
      section: "BREAKFAST EXTRAS",
      price: 0,
      isAvailable: true,
      isFeatured: false,
      subItems: [],
    });
  };

  // ✅ MAIN Sub-item helpers
  const handleSubItemChange = (
    index: number,
    field: "name" | "price",
    value: string
  ) => {
    setForm((prev) => {
      const subItems: IMenuSubItem[] = [...(prev.subItems || [])];
      const current = subItems[index] || { name: "", price: 0 };
      subItems[index] = {
        ...current,
        [field]: field === "price" ? Number(value) : value,
      };
      return { ...prev, subItems };
    });
  };

  const addSubItem = () => {
    setForm((prev) => ({
      ...prev,
      subItems: [...(prev.subItems || []), { name: "", price: 0 }],
    }));
  };

  const removeSubItem = (index: number) => {
    setForm((prev) => {
      const subItems = [...(prev.subItems || [])];
      subItems.splice(index, 1);
      return { ...prev, subItems };
    });
  };

  // ✅ ADDON Sub-item helpers
  const handleAddonSubItemChange = (
    index: number,
    field: "name" | "price",
    value: string
  ) => {
    setAddonForm((prev) => {
      const subItems: IMenuSubItem[] = [...(prev.subItems || [])];
      const current = subItems[index] || { name: "", price: 0 };
      subItems[index] = {
        ...current,
        [field]: field === "price" ? Number(value) : value,
      };
      return { ...prev, subItems };
    });
  };

  const addAddonSubItem = () => {
    setAddonForm((prev) => ({
      ...prev,
      subItems: [...(prev.subItems || []), { name: "", price: 0 }],
    }));
  };

  const removeAddonSubItem = (index: number) => {
    setAddonForm((prev) => {
      const subItems = [...(prev.subItems || [])];
      subItems.splice(index, 1);
      return { ...prev, subItems };
    });
  };

  // Quick presets for common breakfast add-ons
  const setCroissantPreset = () => {
    setAddonForm({
      name: "Croissant",
      description: "Butter and Jam",
      category: "addon",
      section: "BREAKFAST EXTRAS",
      price: 0,
      isAvailable: true,
      isFeatured: false,
      subItems: [{ name: "Butter & Jam", price: 6.5 }],
    });
  };

  const setToastSpreadsPreset = () => {
    setAddonForm({
      name: "TOAST (2 SLICE)",
      description:
        "with Butter / Vegemite / Jam / Peanut Butter / Marmalade White / Wholemeal / Multigrain",
      category: "addon",
      section: "BREAKFAST EXTRAS",
      price: 0,
      isAvailable: true,
      isFeatured: false,
      subItems: [
        { name: "Butter", price: 4.5 },
        { name: "Vegemite", price: 4.5 },
        { name: "Jam", price: 4.5 },
        { name: "Peanut Butter", price: 4.5 },
        { name: "Marmalade", price: 4.5 },
        { name: "White", price: 4.5 },
        { name: "Wholemeal", price: 4.5 },
        { name: "Multigrain", price: 4.5 },
      ],
    });
  };

  const setToastArtisanPreset = () => {
    setAddonForm({
      name: "TOAST (2 SLICE)",
      description: "Focaccia / Sourdough / Rye",
      category: "addon",
      section: "BREAKFAST EXTRAS",
      price: 0,
      isAvailable: true,
      isFeatured: false,
      subItems: [
        { name: "Focaccia", price: 6 },
        { name: "Sourdough", price: 6 },
        { name: "Rye", price: 6 },
      ],
    });
  };

  // ✅ Quick helpers for Drinks
  const setDrinkHotPreset = () => {
    setForm((p) => ({
      ...p,
      category: "drink",
      section: "HOT DRINKS",
      price: 0,
      subItems: [
        { name: "Regular", price: 0 },
        { name: "Large", price: 0 },
      ],
    }));
  };

  const setDrinkColdPreset = () => {
    setForm((p) => ({
      ...p,
      category: "drink",
      section: "COLD DRINKS",
      subItems: [],
    }));
  };

  const setTeaPreset = () => {
    setForm((p) => ({
      ...p,
      category: "drink",
      section: "ASSORTED TEA",
      price: p.price || 4.5,
      subItems: [],
    }));
  };

  // MAIN submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // ✅ price rule: Drink + (Regular/Large etc) -> main price not required
    const hasSizePricing =
      form.category === "drink" && (form.subItems?.length || 0) > 0;
    const needsMainPrice = !hasSizePricing;

    if (!form.name || !form.category || (needsMainPrice && !form.price)) {
      setError("Name, category and price are required.");
      return;
    }

    try {
      setSaving(true);
      const { _id, ...payload } = form as any;

      if (editingId) {
        const res = await api.put<IMenuItem>(`/api/menu/${editingId}`, payload);
        setItems((prev) =>
          prev.map((item) => (item._id === editingId ? res.data : item))
        );
        Swal.fire({
          icon: "success",
          title: "Menu item updated",
          timer: 1100,
          showConfirmButton: false,
        });
      } else {
        const res = await api.post<IMenuItem>("/api/menu", payload);
        setItems((prev) => [res.data, ...prev]);
        Swal.fire({
          icon: "success",
          title: "Menu item added",
          timer: 1100,
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

  // ADDON submit
  const handleAddonSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const hasSubPrices =
      (addonForm.subItems || []).some((s) => Number(s.price) > 0);

    if (!addonForm.name || (!addonForm.price && !hasSubPrices)) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Add-on name and either a base price or option prices are required.",
      });
      return;
    }

    try {
      setSaving(true);

      const payload: IMenuItem = {
        ...addonForm,
        category: "addon",
        price: addonForm.price || 0,
        isAvailable: addonForm.isAvailable ?? true,
      };

      const res = await api.post<IMenuItem>("/api/menu", payload);
      setItems((prev) => [res.data, ...prev]);

      Swal.fire({
        icon: "success",
        title: "Add-on added",
        timer: 1000,
        showConfirmButton: false,
      });

      resetAddonForm();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Add-on save failed",
        text: "Could not save add-on. Please try again.",
      });
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
      subItems: item.subItems || [],
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
      if (editingId === id) resetForm();

      Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 900,
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1E2B4F]">Menu Manager</h2>
          <p className="text-sm text-neutral-600">
            Create, update and organise the Insomnia Fuel menu.
          </p>
        </div>
      </div>

      {/* ✅ Add-ons / Extras form (separate cards) */}
      <form
        onSubmit={handleAddonSubmit}
        className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 md:p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#1E2B4F]">
              Add-ons / Extras (Separate Cards)
            </h3>
            <p className="text-xs text-neutral-600">
              Add Toast, Croissant, drink add-ons etc — these show as separate
              cards under Breakfast/Drinks based on section.
            </p>
          </div>
          <div className="text-[11px] text-neutral-500">
            Saved as <span className="font-semibold">category: addon</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-neutral-700">
          <span className="font-semibold text-[11px] text-neutral-600">
            Quick presets:
          </span>
          <button
            type="button"
            onClick={setCroissantPreset}
            className="rounded-full border border-neutral-300 bg-white px-3 py-1 hover:bg-neutral-50"
          >
            Croissant (Butter & Jam $6.5)
          </button>
          <button
            type="button"
            onClick={setToastSpreadsPreset}
            className="rounded-full border border-neutral-300 bg-white px-3 py-1 hover:bg-neutral-50"
          >
            Toast spreads ($4.50 options)
          </button>
          <button
            type="button"
            onClick={setToastArtisanPreset}
            className="rounded-full border border-neutral-300 bg-white px-3 py-1 hover:bg-neutral-50"
          >
            Toast artisan ($6.00 options)
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-neutral-800">
              Add-on name
            </label>
            <input
              name="name"
              value={addonForm.name}
              onChange={handleAddonChange}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
              placeholder="TOAST (2 SLICE)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-800">
              Price (AUD)
            </label>
            <input
              type="number"
              name="price"
              value={addonForm.price || ""}
              onChange={handleAddonChange}
              step="0.1"
              min="0"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
              placeholder="4.5"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-800">
              Section (where it shows)
            </label>

            <div className="mt-1 grid gap-2 md:grid-cols-2">
              <select
                name="section"
                value={addonForm.section || ""}
                onChange={handleAddonChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
              >
                {addonSectionPresets.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <input
                name="section"
                value={addonForm.section || ""}
                onChange={handleAddonChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
                placeholder="Or type custom section"
              />
            </div>

            <p className="mt-1 text-[11px] text-neutral-500">
              Breakfast tab includes add-ons where section contains “breakfast”.
              Drinks tab includes add-ons where section contains “drink/coffee”.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-800">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={addonForm.description || ""}
              onChange={handleAddonChange}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
              rows={2}
              placeholder="with Butter / Vegemite / Jam / Peanut Butter / Marmalade"
            />
          </div>

          {/* Add-on sub-items */}
          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-medium text-neutral-800">
                Options (optional)
              </label>
              <button
                type="button"
                onClick={addAddonSubItem}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-white"
              >
                <Plus className="h-3 w-3" />
                Add option
              </button>
            </div>

            {(addonForm.subItems || []).length === 0 ? (
              <p className="text-xs text-neutral-500">
                Example: “White / Wholemeal / Multigrain – 4.5”
              </p>
            ) : (
              <div className="space-y-2">
                {(addonForm.subItems || []).map((sub, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[minmax(0,1fr)_110px_auto] gap-2"
                  >
                    <input
                      value={sub.name}
                      onChange={(e) =>
                        handleAddonSubItemChange(idx, "name", e.target.value)
                      }
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
                      placeholder="Option name"
                    />
                    <input
                      type="number"
                      value={sub.price || ""}
                      onChange={(e) =>
                        handleAddonSubItemChange(idx, "price", e.target.value)
                      }
                      step="0.1"
                      min="0"
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
                      placeholder="Price"
                    />
                    <button
                      type="button"
                      onClick={() => removeAddonSubItem(idx)}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                name="isAvailable"
                checked={addonForm.isAvailable}
                onChange={handleAddonChange}
                className="h-4 w-4 rounded border-neutral-300"
              />
              <span>Available</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1E2B4F] px-4 py-2 text-sm font-medium text-white hover:bg-[#263567] disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Add add-on</span>
            </button>
          </div>
        </div>
      </form>

      {/* ✅ Main Item Form */}
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
            placeholder="Cappuccino / Big Breakfast"
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
            {categories
              .filter((c) => c.value !== "addon") // keep main form clean
              .map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
          </select>
        </div>

        {/* ✅ Drink-specific section selector + quick presets */}
        {form.category === "drink" ? (
          <>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-neutral-800">
                Drink Type
              </label>
              <select
                name="section"
                value={form.section || ""}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
              >
                <option value="">Select drink type</option>
                {drinkSections.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={setDrinkHotPreset}
                  className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100"
                >
                  Hot preset (Reg/Lrg)
                </button>
                <button
                  type="button"
                  onClick={setDrinkColdPreset}
                  className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100"
                >
                  Cold preset
                </button>
                <button
                  type="button"
                  onClick={setTeaPreset}
                  className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100"
                >
                  Tea preset ($4.5)
                </button>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-neutral-800">
                Base Price (optional)
              </label>
              <input
                type="number"
                name="price"
                value={form.price || ""}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
                placeholder="Use only if single price"
              />
              <p className="mt-1 text-[11px] text-neutral-500">
                If you add Regular/Large options, base price is not required.
              </p>
            </div>
          </>
        ) : (
          <>
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
                placeholder="Global Bowls / Breakfast"
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
          </>
        )}

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
            placeholder="e.g. Iced Coffee (with Ice Cream)"
          />
        </div>

        {/* Sub-foods for MAIN item */}
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-800">
              Options (optional)
            </label>
            <button
              type="button"
              onClick={addSubItem}
              className="inline-flex items-center rounded-lg border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100"
            >
              + Add option
            </button>
          </div>

          {(form.subItems || []).length === 0 ? (
            <p className="text-xs text-neutral-500">
              Drinks: use this for Regular/Large. Breakfast: use for toppings.
            </p>
          ) : (
            <div className="space-y-2">
              {(form.subItems || []).map((sub, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[minmax(0,1fr)_110px_auto] gap-2"
                >
                  <input
                    type="text"
                    placeholder="Option name (Regular / Large / Add bacon)"
                    value={sub.name}
                    onChange={(e) =>
                      handleSubItemChange(idx, "name", e.target.value)
                    }
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={sub.price || ""}
                    onChange={(e) =>
                      handleSubItemChange(idx, "price", e.target.value)
                    }
                    step="0.1"
                    min="0"
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubItem(idx)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
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

                    {item.category === "addon" && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                        Add-on
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

                  {item.subItems && item.subItems.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-[11px] text-neutral-700">
                      {item.subItems.map((sub, i) => (
                        <li
                          key={`${item._id}-sub-${i}`}
                          className="flex items-center justify-between"
                        >
                          <span>• {sub.name}</span>
                          <span className="font-medium">
                            ${sub.price.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
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

        {addonItems.length > 0 && (
          <div className="border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500">
            Tip: Add-ons show as separate cards if their section matches
            Breakfast/Drinks.
          </div>
        )}
      </div>
    </div>
  );
}
