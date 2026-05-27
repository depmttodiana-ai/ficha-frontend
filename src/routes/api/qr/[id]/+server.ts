const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function GET({ params, cookies }) {
	const { id } = params;
	const token = cookies.get('token');

	if (!token) {
		return new Response('No autorizado', { status: 401 });
	}

	try {
		const res = await fetch(`${API_URL}/reportes/equipo/${id}/qr`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res.ok) {
			return new Response('Error al generar QR', { status: res.status });
		}

		const arrayBuffer = await res.arrayBuffer();
		return new Response(arrayBuffer, {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=3600',
			},
		});
	} catch (err) {
		return new Response('Error de conexión', { status: 502 });
	}
}
