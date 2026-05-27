import api from './client';
import type { LoginRequest, RegisterRequest, TokenResponse, UsuarioRead } from '$lib/types';

export const authApi = {
	login: (data: LoginRequest) => api.post<TokenResponse>('/auth/login', data),
	register: (data: RegisterRequest) => api.post<UsuarioRead>('/auth/register', data),
	me: () => api.get<UsuarioRead>('/auth/me'),
};
