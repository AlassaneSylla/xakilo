export type PaymentMode = 'especes' | 'mobile_money' | 'carte';

export type Payment = {
  id: number;
  amount: number;
  date: string;
  mode: PaymentMode;
  mode_display: string;
  received_by: number | null;
  received_by_username: string;
  note: string | null;
};

export type RemovalItem = {
  product: number;
  quantity: number;
};

export type InvoiceData = {
  invoice_number: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: string;
  date_created: string;
  products: {
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
};

export type InvoiceStatus =
  | 'en_attente'
  | 'partiellement_payee'
  | 'payee'
  | 'annulee'
  | '';

export type Removal = {
  id: number;
  date_register: string;
  client_name: string;
  client_phone: string | null;
  destination: 'vente' | 'don' | 'perte';
  removal_ref: string;
  invoice_status: InvoiceStatus;
  created_by_username: string;
  invoice: InvoiceData | null;
  payments: Payment[];
  amount_paid: number;
  balance_due: number;
};

export type RemovalPayload = {
  client_name: string;
  client_phone?: string;
  destination: string;
  invoice_status: string;
  items: RemovalItem[];
  justification?: string;
  proof_image?: File | null;
  initial_payment?: number;
  payment_mode?: 'especes' | 'mobile_money' | 'carte';
};

export type LossRecord = {
  date: string;
  employee: string;
  product: string;
  quantity: number;
  justification: string;
  proof_image: string | null;
};