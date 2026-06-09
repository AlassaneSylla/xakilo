export type SessionStatus = 'open' | 'closed';

export type CashSession = {
  id: number;
  status: SessionStatus;
  start_time: string;
  end_time: string | null;
  opening_balance: number;
  closing_balance: number | null;
  expected_balance: number | null;
  opened_by_username: string;
  gap: number | null;
};

export type Expense = {
  id: number;
  amount: number;
  description: string;
  payment_mode: 'especes' | 'mobile_money';
  date_register: string;
  declared_by_username: string;
};

export type ExpensePayload = {
  amount: number;
  description: string;
  payment_mode: 'especes' | 'mobile_money';
};