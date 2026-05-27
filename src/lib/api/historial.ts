import api from './client';
import type { HistorialRead, PaginationQuery } from '$lib/types';

export const historialApi = {
	byEquipo: (equipoId: string, params?: PaginationQuery) =>
		api.get<HistorialRead[]>(`/historial/equipo/${equipoId}`, { params }),
};
