export type Category = 'electronique' | 'meublier' | 'informatique';

export type Product = {
  id: number;
  product_name: string;
  category: Category;
  category_display?: string;
  product_ref: string;
  stock: number;
  unit_price: number | null;
  purchase_price: number | null;
  alert: number;
  created_by_username?: string;
  last_supplier?: string | null;
  last_entry_date?: string | null;
};

export type ProductPayload = Omit<Product, 'id' | 'product_ref' | 'stock' | 'created_by_username' | 'category_display' | 'last_supplier' | 'last_entry_date'>;