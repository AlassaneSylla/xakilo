import { client } from '../../../../shared/api/client';
import type { LossRecord, Removal, RemovalPayload } from '../types';

export const getRemovals = async (): Promise<Removal[]> => {
  const { data } = await client.get<Removal[]>('removals/');
  return data;
};

export const getRemovalById = async (id: number): Promise<Removal> => {
  const { data } = await client.get<Removal>(`removals/${id}/`);
  return data;
};

export const getRemovalsByProductId = async (productId: number): Promise<Removal[]> => {
  const { data } = await client.get<Removal[]>(`removals/product/${productId}/`);
  return data;
};

export const postRemoval = async (payload: RemovalPayload): Promise<Removal> => {
  if (payload.proof_image) {
    const form = new FormData();
    form.append('client_name',    payload.client_name);
    form.append('destination',    payload.destination);
    form.append('invoice_status', payload.invoice_status);
    form.append('items',          JSON.stringify(payload.items));
    if (payload.justification)  form.append('justification', payload.justification);
    form.append('proof_image',    payload.proof_image);
    const { data } = await client.post<Removal>('removals/add/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  const body: Record<string, unknown> = {
    client_name:    payload.client_name,
    destination:    payload.destination,
    invoice_status: payload.invoice_status,
    items:          payload.items,
  };
  if (payload.client_phone)     body.client_phone     = payload.client_phone;
  if (payload.justification)    body.justification    = payload.justification;
  if (payload.initial_payment)  body.initial_payment  = payload.initial_payment;
  if (payload.payment_mode)     body.payment_mode     = payload.payment_mode;

  const { data } = await client.post<Removal>('removals/add/', body);
  return data;
};

export const updateRemoval = async (id: number, payload: Partial<RemovalPayload>): Promise<Removal> => {
  const { data } = await client.patch<Removal>(`removals/${id}/update/`, payload);
  return data;
};

export const cancelRemoval = async (id: number): Promise<Removal> => {
  const { data } = await client.patch<Removal>(`removals/${id}/update/`, { invoice_status: 'annulee' });
  return data;
};

export type UnpaidInvoice = {
  id: number;
  invoice_number: string;
  client_name: string;
  client_phone: string;
  date: string;
  total: number;
  amount_paid: number;
  balance_due: number;
  status: 'en_attente' | 'partiellement_payee';
};

export const getUnpaidInvoices = async (): Promise<UnpaidInvoice[]> => {
  const { data } = await client.get<UnpaidInvoice[]>('removals/unpaid/');
  return data;
};

export const addPayment = async (
  removalId: number,
  payload: { amount: number; mode: 'especes' | 'mobile_money' | 'carte' }
): Promise<void> => {
  await client.post(`removals/${removalId}/payments/add/`, payload);
};

export const getLossRegistry = async (params?: {
  period?: string;
  date_from?: string;
  date_to?: string;
}): Promise<LossRecord[]> => {
  const { data } = await client.get<LossRecord[]>('removals/losses/', { params });
  return data;
};