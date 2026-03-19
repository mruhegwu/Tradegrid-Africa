'use client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPPLIER' | 'BUYER';
  verified: boolean;
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function setUser(user: User, token: string): void {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
}

export function clearUser(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

export function isLoggedIn(): boolean {
  return !!getUser();
}
