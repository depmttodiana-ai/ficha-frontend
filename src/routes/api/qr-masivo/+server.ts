const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function GET({ url, cookies }) {
	const ids = url.searchParams.get('ids');
	const token = cookies.get('token');

	if (!token) {
		return new Response('No autorizado', { status: 401 });
	}
	if (!ids) {
		return new Response('Faltan ids', { status: 400 });
	}

	const idList = ids.split(',').filter(Boolean);

	try {
		const res = await fetch(`${API_URL}/reportes/qr/masivo`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(idList),
		});

		if (!res.ok) {
			return new Response('Error al generar QR masivo', { status: res.status });
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
