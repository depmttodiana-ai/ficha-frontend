const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function GET({ cookies }) {
	const token = cookies.get('token');
	if (!token) return new Response('No autorizado', { status: 401 });

	try {
		const res = await fetch(`${API_URL}/reportes/repuestos/pdf`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) return new Response('Error', { status: res.status });
		return new Response(await res.arrayBuffer(), {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'attachment; filename="catalogo_repuestos.pdf"',
			},
		});
	} catch {
		return new Response('Error de conexión', { status: 502 });
	}
}
