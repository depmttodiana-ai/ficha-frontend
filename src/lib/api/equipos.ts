import api from './client';
import type { EquipoList, EquipoRead, EquipoArbolRead, EstadoUpdate, RepuestoNecesario, PaginationQuery, EquipoCompatibleRead, EquipoCompatibleCreate } from '$lib/types';

export interface EquipoQuery extends PaginationQuery {
	nombre?: string;
	codigo?: string;
	area_id?: string;
	clasificacion_id?: string;
	estado?: string;
	nivel?: number;
	fecha_desde?: string;
	fecha_hasta?: string;
}

export const equiposApi = {
	list: (params?: EquipoQuery) => api.get<EquipoList[]>('/equipos/', { params }),
	raices: () => api.get<EquipoList[]>('/equipos/raices'),
	get: (id: string) => api.get<EquipoRead>(`/equipos/${id}`),
	arbol: (id: string) => api.get<EquipoArbolRead>(`/equipos/${id}/arbol`),
	create: (formData: FormData) =>
		api.post<EquipoRead>('/equipos/', formData),
	update: (id: string, data: Record<string, unknown>) => api.put<EquipoRead>(`/equipos/${id}`, data),
	patchEstado: (id: string, data: EstadoUpdate) => api.patch<EquipoRead>(`/equipos/${id}/estado`, data),
	delete: (id: string) => api.delete(`/equipos/${id}`),
	repuestosList: (id: string) => api.get<RepuestoNecesario[]>(`/equipos/${id}/repuestos-necesarios`),
	repuestosCreate: (id: string, data: Partial<RepuestoNecesario>) =>
		api.post<RepuestoNecesario>(`/equipos/${id}/repuestos-necesarios`, data),
	repuestosDelete: (equipoId: string, repuestoId: string) =>
		api.delete(`/equipos/${equipoId}/repuestos-necesarios/${repuestoId}`),
	addFotos: (id: string, formData: FormData) =>
		api.post(`/equipos/${id}/fotos`, formData),
	compatibleList: (id: string) => api.get<EquipoCompatibleRead[]>(`/equipos/${id}/compatible-con`),
	compatibleCreate: (id: string, data: EquipoCompatibleCreate) =>
		api.post<EquipoCompatibleRead>(`/equipos/${id}/compatible-con`, data),
	compatibleDelete: (componenteId: string, relacionId: string) =>
		api.delete(`/equipos/${componenteId}/compatible-con/${relacionId}`),
};
