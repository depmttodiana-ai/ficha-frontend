import api from './client';
import type {
	RepuestoGeneralCreate,
	RepuestoGeneralUpdate,
	RepuestoGeneralRead,
	RepuestoGeneralList,
	PaginationQuery,
} from '$lib/types';

export interface RepuestoGeneralQuery extends PaginationQuery {
	nombre?: string;
	codigo?: string;
	marca?: string;
	modelo?: string;
}

export const repuestosGeneralesApi = {
	list: (params?: RepuestoGeneralQuery) =>
		api.get<RepuestoGeneralList[]>('/repuestos-generales/', { params }),
	get: (id: string) => api.get<RepuestoGeneralRead>(`/repuestos-generales/${id}`),
	create: (data: RepuestoGeneralCreate) =>
		api.post<RepuestoGeneralRead>('/repuestos-generales/', data),
	update: (id: string, data: RepuestoGeneralUpdate) =>
		api.put<RepuestoGeneralRead>(`/repuestos-generales/${id}`, data),
	delete: (id: string) => api.delete(`/repuestos-generales/${id}`),
};
