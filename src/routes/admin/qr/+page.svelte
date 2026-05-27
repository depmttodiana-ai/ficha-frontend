<script lang="ts">
	import { onMount } from 'svelte';
	import { equiposApi } from '$lib/api/equipos';
	import { reportesApi } from '$lib/api/reportes';
	import { addToast } from '$lib/stores/toast';
	import type { EquipoList } from '$lib/types';

	let equipos = $state<EquipoList[]>([]);
	let filtered = $state<EquipoList[]>([]);
	let loading = $state(true);
	let search = $state('');
	let downloadingId = $state<string | null>(null);

	onMount(async () => {
		try {
			const res = await equiposApi.list({ limit: 100 });
			equipos = res.data;
			filtered = res.data;
		} catch {
			addToast('error', 'Error al cargar equipos');
		} finally {
			loading = false;
		}
	});

	function handleSearch() {
		const q = search.toLowerCase().trim();
		if (!q) {
			filtered = equipos;
			return;
		}
		filtered = equipos.filter(
			(e) =>
				e.codigo_equipo.toLowerCase().includes(q) ||
				e.nombre.toLowerCase().includes(q)
		);
	}

	async function downloadQr(equipo: EquipoList) {
		if (downloadingId) return;
		downloadingId = equipo.id;
		try {
			const res = await fetch('/api/qr/' + equipo.id);
			if (!res.ok) throw new Error();
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'qr_' + equipo.codigo_equipo + '.png';
			a.click();
			URL.revokeObjectURL(url);
		} catch {
			addToast('error', 'Error al descargar QR');
		} finally {
			downloadingId = null;
		}
	}
</script>

<div class="space-y-4 md:space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
		<h2 class="text-lg md:text-xl font-semibold text-slate-800">Códigos QR</h2>

	</div>

	<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-4">
		<div class="flex gap-2 md:gap-3">
			<input
				type="text"
				bind:value={search}
				oninput={handleSearch}
				placeholder="Buscar por código o nombre..."
				class="flex-1 min-w-0 rounded-lg border border-slate-300 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm"
			/>
		</div>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if filtered.length === 0}
		<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 text-center">
			<p class="text-sm text-slate-400">No se encontraron equipos</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
			{#each filtered as eq}
				<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
					<img
						src={'/api/qr/' + eq.id}
						alt={'QR ' + eq.codigo_equipo}
						class="w-full max-w-[140px] md:max-w-[160px] aspect-square"
						loading="lazy"
					/>
					<div class="text-center min-w-0 w-full">
						<p class="text-xs md:text-sm font-medium text-slate-800 truncate">{eq.codigo_equipo}</p>
						<p class="text-xs text-slate-500 truncate">{eq.nombre}</p>
					</div>
					<div class="flex gap-1.5 md:gap-2 w-full">
						<button
							onclick={() => downloadQr(eq)}
							disabled={downloadingId === eq.id}
							class="flex-1 text-center px-2 py-1 md:py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
						>{downloadingId === eq.id ? '...' : 'Descargar'}</button>
						<a
							href={'/api/pdf/' + eq.id}
							target="_blank"
							class="flex-1 text-center px-2 py-1 md:py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
						>PDF</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
