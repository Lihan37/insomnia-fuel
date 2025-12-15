// src/types/menu.ts
export type MenuCategory =
  | "bowl"
  | "sandwich"
  | "wrap"
  | "breakfast"
  | "drink"
  | "other"
  | "addon"; // ✅ NEW: add-ons / extras

// ✅ Sub-item type for sub foods / options
export interface IMenuSubItem {
  name: string;
  price: number;
}

export interface IMenuItem {
  _id?: string;
  name: string;
  description: string;
  category: MenuCategory;
  section?: string; // e.g. "Global Bowls", "Gourmet Toasties", "BREAKFAST EXTRAS"
  price: number;
  isAvailable: boolean;
  isFeatured?: boolean;

  // ✅ Optional sub-foods / options (e.g. Breakfast toppings, drink sizes)
  subItems?: IMenuSubItem[];
}
