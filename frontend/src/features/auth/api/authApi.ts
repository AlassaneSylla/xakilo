import { client } from '../../../shared/api/client';
import type { LoginPayload, TokenPair, AuthUser } from '../types';

export async function login(payload: LoginPayload): Promise<TokenPair> {
  const { data } = await client.post<TokenPair>('token/', payload);
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await client.get<AuthUser>('users/me/');
  return data;
}

export async function blacklistToken(refresh: string): Promise<void> {
  await client.post('token/blacklist/', { refresh });
}