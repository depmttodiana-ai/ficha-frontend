const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function GET({ url, cookies }) {
	const token = cookies.get('token');
	if (!token) return new Response('No autorizado', { status: 401 });

	const params = new URLSearchParams();
	const equipoId = url.searchParams.get('equipo_id');
	const fechaDesde = url.searchParams.get('fecha_desde');
	const fechaHasta = url.searchParams.get('fecha_hasta');
	if (equipoId) params.set('equipo_id', equipoId);
	if (fechaDesde) params.set('fecha_desde', fechaDesde);
	if (fechaHasta) params.set('fecha_hasta', fechaHasta);

	const qs = params.toString();
	const endpoint = `/reportes/mantenimientos/excel${qs ? '?' + qs : ''}`;

	try {
		const res = await fetch(`${API_URL}${endpoint}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) return new Response('Error', { status: res.status });
		return new Response(await res.arrayBuffer(), {
			headers: {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'Content-Disposition': 'attachment; filename="mantenimientos.xlsx"',
			},
		});
	} catch {
		return new Response('Error de conexión', { status: 502 });
	}
}
