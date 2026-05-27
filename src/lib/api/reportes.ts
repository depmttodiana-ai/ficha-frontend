import api from './client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function getUrl(path: string) {
	if (typeof window === 'undefined') return `${API_URL.replace(/\/api\/v1$/, '')}${path}`;
	const token = localStorage.getItem('token');
	const base = API_URL.replace(/\/api\/v1$/, '');
	return `${base}${path}${token ? `?token=${token}` : ''}`;
}

export const reportesApi = {
	equipoPdf: (id: string) => getUrl(`/api/v1/reportes/equipo/${id}/pdf`),
	equipoMantenimientosPdf: (id: string) => getUrl(`/api/v1/reportes/equipo/${id}/mantenimientos/pdf`),
	equiposExcel: (params?: string) => {
		const qs = params ? `?${params}` : '';
		return getUrl(`/api/v1/reportes/equipos/excel${qs}`);
	},
	mantenimientosExcel: (params?: string) => {
		const qs = params ? `?${params}` : '';
		return getUrl(`/api/v1/reportes/mantenimientos/excel${qs}`);
	},
	repuestosExcel: () => getUrl('/api/v1/reportes/repuestos/excel'),
	equipoQr: (id: string) => getUrl(`/api/v1/reportes/equipo/${id}/qr`),
	qrMasivo: (ids: string[]) => api.post('/reportes/qr/masivo', ids),
	equipoWeb: (id: string) => getUrl(`/api/v1/reportes/equipo/${id}/web`),
};
