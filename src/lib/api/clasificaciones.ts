import api from './client';
import type { ClasificacionCreate, ClasificacionUpdate, ClasificacionList, ClasificacionRead, PaginationQuery } from '$lib/types';

export const clasificacionesApi = {
	list: (params?: PaginationQuery & { search?: string }) => api.get<ClasificacionList[]>('/clasificaciones/', { params }),
	get: (id: string) => api.get<ClasificacionRead>(`/clasificaciones/${id}`),
	create: (data: ClasificacionCreate) => api.post<ClasificacionRead>('/clasificaciones/', data),
	update: (id: string, data: ClasificacionUpdate) => api.put<ClasificacionRead>(`/clasificaciones/${id}`, data),
	delete: (id: string) => api.delete(`/clasificaciones/${id}`),
};
