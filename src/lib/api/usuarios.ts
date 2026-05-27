import api from './client';
import type { UsuarioRead, UsuarioList, UsuarioCreate, UsuarioUpdate, PaginationQuery } from '$lib/types';

export const usuariosApi = {
	list: (params?: PaginationQuery) => api.get<UsuarioList[]>('/usuarios/', { params }),
	get: (id: string) => api.get<UsuarioRead>(`/usuarios/${id}`),
	create: (data: UsuarioCreate) => api.post<UsuarioRead>('/usuarios/admin', data),
	update: (id: string, data: UsuarioUpdate) => api.put<UsuarioRead>(`/usuarios/${id}`, data),
	delete: (id: string) => api.delete(`/usuarios/${id}`),
};
