<script lang="ts">
	import { page } from '$app/stores';
	import { currentUser, clearAuth } from '$lib/stores/auth';

	let mobileOpen = $state(false);

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: '📊' },
		{ href: '/admin/equipos', label: 'Equipos', icon: '⚙️' },
		{ href: '/admin/repuestos', label: 'Repuestos', icon: '🔩' },
		{ href: '/admin/mantenimientos', label: 'Mantenimientos', icon: '🔧' },
		{ href: '/admin/areas', label: 'Áreas', icon: '🏢' },
		{ href: '/admin/clasificaciones', label: 'Clasificaciones', icon: '📂' },
		{ href: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
		{ href: '/admin/qr', label: 'Códigos QR', icon: '📱' },
		{ href: '/admin/reportes', label: 'Reportes', icon: '📄' },
	];

	function logout() {
		clearAuth();
		window.location.href = '/login';
	}

	function closeNav() {
		mobileOpen = false;
	}
</script>

<!-- Mobile overlay -->
{#if mobileOpen}
	<div
		class="fixed inset-0 z-30 bg-black/50 md:hidden"
		onclick={closeNav}
		role="presentation"
	/>
{/if}

<!-- Mobile hamburger (visible only on small screens) -->
<button
	onclick={() => (mobileOpen = !mobileOpen)}
	class="fixed top-3 left-3 z-40 md:hidden bg-slate-900 text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-lg {$page.url.pathname.startsWith('/login') && 'hidden'}"
>
	<span class="text-xl">{mobileOpen ? '✕' : '☰'}</span>
</button>

<!-- Sidebar: desktop fixed / mobile overlay -->
<aside
	class="bg-slate-900 dark:bg-slate-950 text-white flex flex-col transition-all duration-200
		{$page.url.pathname.startsWith('/login') && 'hidden'}
		md:relative md:w-64
		fixed inset-y-0 left-0 z-30 w-64
		{mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
>
	<div class="flex items-center justify-between p-4 border-b border-slate-700 dark:border-slate-800">
		<span class="font-bold text-lg">Ficha Técnica</span>
		<button onclick={closeNav} class="text-slate-400 hover:text-white text-xl px-1 md:hidden">
			✕
		</button>
	</div>

	<nav class="flex-1 py-2 overflow-y-auto">
		{#each navItems as item}
			<a
				href={item.href}
				onclick={closeNav}
				class="flex items-center gap-3 px-4 py-3 text-sm transition-colors
					{$page.url.pathname.startsWith(item.href) ? 'bg-slate-700 dark:bg-slate-600 text-white' : 'text-slate-300 dark:text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-700 hover:text-white'}"
			>
				<span class="text-lg shrink-0">{item.icon}</span>
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>

	<div class="p-4 border-t border-slate-700 dark:border-slate-800">
		{#if $currentUser}
			<div class="text-sm text-slate-400 mb-2 truncate">{$currentUser.nombre}</div>
		{/if}
		<button
			onclick={logout}
			class="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors w-full"
		>
			<span>🚪</span>
			<span>Cerrar sesión</span>
		</button>
	</div>
</aside>
