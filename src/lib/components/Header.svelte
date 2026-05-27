<script lang="ts">
	import { page } from '$app/stores';
	import { toggleTheme, isDark } from '$lib/stores/theme';

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

<header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-3 md:py-4 pl-14 md:pl-6 {$page.url.pathname.startsWith('/login') && 'hidden'}">
	<div class="flex items-center justify-between">
		<h1 class="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">{getTitle()}</h1>
		<button
			onclick={toggleTheme}
			class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg transition-colors"
			aria-label="Toggle theme"
		>
			{$isDark ? '☀️' : '🌙'}
		</button>
	</div>
</header>
