import { client } from '../../../shared/api/client';
import type { User, UserPayload } from '../types';

export const getUsers = async (): Promise<User[]> => {
  const { data } = await client.get<User[]>('users/');
  return data;
};

export const getUserById = async (id: number): Promise<User> => {
  const { data } = await client.get<User>(`users/${id}/`);
  return data;
};

export const postUser = async (payload: UserPayload): Promise<User> => {
  const { data } = await client.post<User>('users/add/', payload);
  return data;
};

export const updateUser = async (id: number, payload: Partial<UserPayload>): Promise<User> => {
  const { data } = await client.patch<User>(`users/${id}/update/`, payload);
  return data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await client.delete(`users/${id}/delete/`);
};