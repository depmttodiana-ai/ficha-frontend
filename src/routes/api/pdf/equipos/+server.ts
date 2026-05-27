const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function GET({ url, cookies }) {
	const token = cookies.get('token');
	if (!token) return new Response('No autorizado', { status: 401 });

	const params = new URLSearchParams();
	const areaId = url.searchParams.get('area_id');
	const clasificacionId = url.searchParams.get('clasificacion_id');
	const estado = url.searchParams.get('estado');
	const nivel = url.searchParams.get('nivel');
	if (areaId) params.set('area_id', areaId);
	if (clasificacionId) params.set('clasificacion_id', clasificacionId);
	if (estado) params.set('estado', estado);
	if (nivel) params.set('nivel', nivel);

	const qs = params.toString();
	const endpoint = `/reportes/equipos/pdf${qs ? '?' + qs : ''}`;

	try {
		const res = await fetch(`${API_URL}${endpoint}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) return new Response('Error', { status: res.status });
		return new Response(await res.arrayBuffer(), {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'attachment; filename="listado_equipos.pdf"',
			},
		});
	} catch {
		return new Response('Error de conexión', { status: 502 });
	}
}
