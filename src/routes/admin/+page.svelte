<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { equiposApi } from '$lib/api/equipos';
	import { mantenimientosApi } from '$lib/api/mantenimientos';

	let equipoCount = $state(0);
	let mantenimientoCount = $state(0);
	let loading = $state(true);

	onMount(async () => {
		try {
			const [eq, mt] = await Promise.all([
				equiposApi.list({ limit: 1 }),
				mantenimientosApi.list({ limit: 1 }),
			]);
			equipoCount = eq.headers['x-total-count'] ? Number(eq.headers['x-total-count']) : eq.data.length;
			mantenimientoCount = mt.headers['x-total-count'] ? Number(mt.headers['x-total-count']) : mt.data.length;
		} catch {
			// silent
		} finally {
			loading = false;
		}
	});

	const cards = $derived([
		{ label: 'Equipos registrados', value: equipoCount, icon: '⚙️', color: 'bg-blue-500', loading },
		{ label: 'Mantenimientos', value: mantenimientoCount, icon: '🔧', color: 'bg-green-500', loading },
	]);
</script>

<div class="space-y-5">
	<div>
		<h2 class="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">
			Bienvenido, {$currentUser?.nombre}
		</h2>
		<p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Panel de control del sistema de ficha técnica</p>
	</div>

	<div class="grid grid-cols-2 gap-3 md:gap-6">
		{#each cards as card}
			<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
				<div class="flex items-center justify-between gap-2">
					<div class="min-w-0">
						<p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">{card.label}</p>
						{#if card.loading}
							<div class="w-12 h-7 md:w-16 md:h-8 mt-1 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
						{:else}
							<p class="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{card.value}</p>
						{/if}
					</div>
					<div class="w-10 h-10 md:w-12 md:h-12 shrink-0 {card.color} rounded-lg flex items-center justify-center text-lg md:text-2xl">
						{card.icon}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
		<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3">Acceso rápido</h3>
		<div class="grid grid-cols-2 gap-2 md:gap-4">
			<a href="/admin/equipos" class="p-3 md:p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-center">
				<div class="text-xl md:text-2xl mb-0.5">⚙️</div>
				<div class="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200">Equipos</div>
			</a>
			<a href="/admin/mantenimientos" class="p-3 md:p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-center">
				<div class="text-xl md:text-2xl mb-0.5">🔧</div>
				<div class="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200">Mantenimientos</div>
			</a>
			<a href="/admin/equipos/crear" class="p-3 md:p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-center">
				<div class="text-xl md:text-2xl mb-0.5">➕</div>
				<div class="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200">Nuevo Equipo</div>
			</a>
			<a href="/admin/repuestos" class="p-3 md:p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-center">
				<div class="text-xl md:text-2xl mb-0.5">🔩</div>
				<div class="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200">Repuestos</div>
			</a>
		</div>
	</div>
</div>
