import api from './axios';

export const login = (email: string, password: string) =>
  api.post('/api/login', { email, password });

export const register = (name: string, email: string, password: string) =>
  api.post('/api/register', { name, email, password });

export const logout = () => api.post('/api/auth/logout');

export const me = () => api.post('/api/auth/me');

export const refresh = () => api.post('/api/auth/refresh');

export const updateUser = (id: number, data: any) =>
  api.put(`/api/auth/user/${id}`, data);
