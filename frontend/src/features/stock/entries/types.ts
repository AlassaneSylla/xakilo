export type Entry = {
  id: number;
  product: number;
  product_name: string;
  category: string;
  date_register: string;
  quantity: number;
  supplier: string;
  entry_reference: string;
};

export type EntryPayload = {
  product: number;
  quantity: number;
  supplier: string;
  category?: string;
};