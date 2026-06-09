import { client } from '../../../shared/api/client';
import type { CashSession, Expense, ExpensePayload } from '../types';

export const getCurrentSession = async (): Promise<CashSession | null> => {
  const { data } = await client.get<{ session: CashSession | null }>('sessions/current/');
  return data.session;
};

export const openSession = async (opening_balance: number): Promise<CashSession> => {
  const { data } = await client.post<CashSession>('sessions/open/', { opening_balance });
  return data;
};

export const closeSession = async (closing_balance: number): Promise<CashSession> => {
  const { data } = await client.post<CashSession>('sessions/close/', { closing_balance });
  return data;
};

export const getSessionHistory = async (): Promise<CashSession[]> => {
  const { data } = await client.get<CashSession[]>('sessions/history/');
  return data;
};

export const addExpense = async (payload: ExpensePayload): Promise<Expense> => {
  const { data } = await client.post<Expense>('sessions/expenses/add/', payload);
  return data;
};

export const listExpenses = async (): Promise<Expense[]> => {
  const { data } = await client.get<Expense[]>('sessions/expenses/');
  return data;
};