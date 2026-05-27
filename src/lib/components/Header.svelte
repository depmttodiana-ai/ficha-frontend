<script lang="ts">
	import { page } from '$app/stores';

	function getTitle(): string {
		const path = $page.url.pathname;
		if (path === '/admin') return 'Dashboard';
		if (path.includes('/equipos')) return 'Equipos';
		if (path.includes('/repuestos')) return 'Repuestos';
		if (path.includes('/mantenimientos')) return 'Mantenimientos';
		if (path.includes('/areas')) return 'Áreas';
		if (path.includes('/clasificaciones')) return 'Clasificaciones';
		if (path.includes('/usuarios')) return 'Usuarios';
		if (path.includes('/reportes')) return 'Reportes';
		return 'Ficha Técnica';
	}
</script>

<header class="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 pl-14 md:pl-6 {$page.url.pathname.startsWith('/login') && 'hidden'}">
	<h1 class="text-lg md:text-xl font-semibold text-slate-800">{getTitle()}</h1>
</header>
