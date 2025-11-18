// src/types/menu.ts
export type MenuCategory =
  | "bowl"
  | "sandwich"
  | "wrap"
  | "breakfast"
  | "drink"
  | "other";

export interface IMenuItem {
  _id?: string;
  name: string;
  description: string;
  category: MenuCategory;
  section?: string; // e.g. "Global Bowls", "Gourmet Toasties"
  price: number;
  isAvailable: boolean;
  isFeatured?: boolean;
}
