import api from './client';
import type { MantenimientoCreate, MantenimientoRead, MantenimientoList, MantenimientoUpdate, PaginationQuery, RepuestoNecesario } from '$lib/types';

export interface MantenimientoQuery extends PaginationQuery {
	equipo_id?: string;
	tipo?: string;
	estado?: string;
	fecha_desde?: string;
	fecha_hasta?: string;
	usuario_id?: string;
}

export const mantenimientosApi = {
	list: (params?: MantenimientoQuery) => api.get<MantenimientoList[]>('/mantenimientos/', { params }),
	get: (id: string) => api.get<MantenimientoRead>(`/mantenimientos/${id}`),
	byEquipo: (equipoId: string) => api.get<MantenimientoList[]>(`/mantenimientos/equipo/${equipoId}`),
	repuestosNecesarios: (equipoId: string) =>
		api.get<RepuestoNecesario[]>(`/mantenimientos/equipo/${equipoId}/repuestos-necesarios`),
	create: (data: MantenimientoCreate) => api.post<MantenimientoRead>('/mantenimientos/', data),
	update: (id: string, data: MantenimientoUpdate) => api.put<MantenimientoRead>(`/mantenimientos/${id}`, data),
	delete: (id: string) => api.delete(`/mantenimientos/${id}`),
};
