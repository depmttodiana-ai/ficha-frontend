import api from './client';
import type { AreaCreate, AreaUpdate, AreaList, AreaRead, PaginationQuery } from '$lib/types';

export const areasApi = {
	list: (params?: PaginationQuery & { search?: string }) => api.get<AreaList[]>('/areas/', { params }),
	get: (id: string) => api.get<AreaRead>(`/areas/${id}`),
	create: (data: AreaCreate) => api.post<AreaRead>('/areas/', data),
	update: (id: string, data: AreaUpdate) => api.put<AreaRead>(`/areas/${id}`, data),
	delete: (id: string) => api.delete(`/areas/${id}`),
};
