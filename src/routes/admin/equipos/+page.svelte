<script lang="ts">
	import { onMount } from 'svelte';
	import { equiposApi, type EquipoQuery } from '$lib/api/equipos';
	import { areasApi } from '$lib/api/areas';
	import { clasificacionesApi } from '$lib/api/clasificaciones';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { goto } from '$app/navigation';
	import { addToast } from '$lib/stores/toast';
	import { getErrorDetail } from '$lib/api/client';
	import type { AreaList, ClasificacionList, EquipoList } from '$lib/types';

	let equipos = $state<EquipoList[]>([]);
	let areas = $state<AreaList[]>([]);
	let clasificaciones = $state<ClasificacionList[]>([]);
	let loading = $state(true);
	let searchNombre = $state('');
	let searchCodigo = $state('');
	let filterArea = $state('');
	let filterClasificacion = $state('');
	let filterEstado = $state('');
	let showFilters = $state(false);

	onMount(async () => {
		try {
			const [areaRes, clasifRes] = await Promise.all([
				areasApi.list({ limit: 100 }),
				clasificacionesApi.list({ limit: 100 }),
			]);
			areas = areaRes.data;
			clasificaciones = clasifRes.data;
		} catch {
			// silent
		}
		await loadEquipos();
	});

	async function loadEquipos() {
		loading = true;
		try {
			const params: EquipoQuery = { limit: 100 };
			if (searchNombre) params.nombre = searchNombre;
			if (searchCodigo) params.codigo = searchCodigo;
			if (filterArea) params.area_id = filterArea;
			if (filterClasificacion) params.clasificacion_id = filterClasificacion;
			if (filterEstado) params.estado = filterEstado;
			const res = await equiposApi.list(params);
			equipos = res.data;
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		} finally {
			loading = false;
		}
	}

	function verEquipo(id: string) {
		goto(`/admin/equipos/${id}`);
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-2">
		<h2 class="text-lg md:text-xl font-semibold text-slate-800">Listado de Equipos</h2>
		<div class="flex gap-2">
			<button
				onclick={() => (showFilters = !showFilters)}
				class="md:hidden px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded-lg transition-colors"
			>
				{showFilters ? '✕' : '🔍'}
			</button>
			<a
				href="/admin/equipos/crear"
				class="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
			>
				+ Nuevo
			</a>
		</div>
	</div>

	<!-- Filters: visible on desktop, toggle on mobile -->
	<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-4 {showFilters ? '' : 'hidden md:block'}">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
			<input
				type="text"
				bind:value={searchNombre}
				placeholder="Nombre..."
				class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full"
			/>
			<input
				type="text"
				bind:value={searchCodigo}
				placeholder="Código..."
				class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full"
			/>
			<select bind:value={filterArea} class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full">
				<option value="">Todas las áreas</option>
				{#each areas as a}
					<option value={a.id}>{a.nombre}</option>
				{/each}
			</select>
			<select bind:value={filterClasificacion} class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full">
				<option value="">Todas las clasificaciones</option>
				{#each clasificaciones as c}
					<option value={c.id}>{c.nombre}</option>
				{/each}
			</select>
			<select bind:value={filterEstado} class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full">
				<option value="">Todos los estados</option>
				<option value="OPERATIVO">Operativo</option>
				<option value="PARADO">Parado</option>
				<option value="REPARACION">Reparación</option>
				<option value="BAJA">Baja</option>
			</select>
		</div>
		<div class="mt-2 md:mt-3 flex gap-2">
			<button onclick={loadEquipos} class="flex-1 md:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors">
				Buscar
			</button>
			<button
				onclick={() => { searchNombre = ''; searchCodigo = ''; filterArea = ''; filterClasificacion = ''; filterEstado = ''; showFilters = false; loadEquipos(); }}
				class="flex-1 md:flex-none px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded-lg transition-colors"
			>
				Limpiar
			</button>
		</div>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="min-w-[500px] md:min-w-full w-full divide-y divide-slate-200">
				<thead class="bg-slate-50">
					<tr>
						<th class="px-3 md:px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Código</th>
						<th class="px-3 md:px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th>
						<th class="hidden sm:table-cell px-3 md:px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Marca</th>
						<th class="hidden lg:table-cell px-3 md:px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Área</th>
						<th class="px-3 md:px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200">
					{#if loading}
						<tr>
							<td colspan="5" class="px-4 py-12 text-center text-slate-500">
								<div class="flex items-center justify-center gap-2 text-sm">
									<div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
									Cargando...
								</div>
							</td>
						</tr>
					{:else if equipos.length === 0}
						<tr>
							<td colspan="5" class="px-4 py-12 text-center text-slate-400 text-sm">No hay equipos</td>
						</tr>
					{:else}
						{#each equipos as eq}
							<tr
								onclick={() => verEquipo(eq.id)}
								class="hover:bg-slate-50 cursor-pointer transition-colors"
							>
								<td class="px-3 md:px-4 py-3 text-sm font-medium text-blue-600">{eq.codigo_equipo}</td>
								<td class="px-3 md:px-4 py-3 text-sm text-slate-800">{eq.nombre}</td>
								<td class="hidden sm:table-cell px-3 md:px-4 py-3 text-sm text-slate-600">{eq.marca || '—'}</td>
								<td class="hidden lg:table-cell px-3 md:px-4 py-3 text-sm text-slate-600">{eq.nombre_area || '—'}</td>
								<td class="px-3 md:px-4 py-3"><StatusBadge status={eq.estado} /></td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
