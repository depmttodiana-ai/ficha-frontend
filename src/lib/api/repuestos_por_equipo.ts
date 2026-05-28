import api from './client';
import type {
	RepuestoPorEquipoCreate,
	RepuestoPorEquipoRead,
} from '$lib/types';

export const repuestosPorEquipoApi = {
	list: () => api.get<RepuestoPorEquipoRead[]>('/repuestos-por-equipo/'),
	get: (id: string) =>
		api.get<RepuestoPorEquipoRead>(`/repuestos-por-equipo/${id}`),
	byRepuestoGeneral: (repuestoGeneralId: string) =>
		api.get<RepuestoPorEquipoRead[]>(
			`/repuestos-por-equipo/repuesto-general/${repuestoGeneralId}`,
		),
	byEquipo: (equipoId: string) =>
		api.get<RepuestoPorEquipoRead[]>(
			`/repuestos-por-equipo/equipo/${equipoId}`,
		),
	create: (data: RepuestoPorEquipoCreate) =>
		api.post<RepuestoPorEquipoRead>('/repuestos-por-equipo/', data),
	delete: (id: string) => api.delete(`/repuestos-por-equipo/${id}`),
};
