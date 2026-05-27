<script lang="ts">
	import { onMount } from 'svelte';
	import { mantenimientosApi, type MantenimientoQuery } from '$lib/api/mantenimientos';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { goto } from '$app/navigation';
	import { addToast } from '$lib/stores/toast';
	import type { MantenimientoList } from '$lib/types';

	let mantenimientos = $state<MantenimientoList[]>([]);
	let loading = $state(true);
	let filterTipo = $state('');
	let filterEstado = $state('');

	onMount(() => loadData());

	async function loadData() {
		loading = true;
		try {
			const params: MantenimientoQuery = { limit: 100 };
			if (filterTipo) params.tipo = filterTipo;
			if (filterEstado) params.estado = filterEstado;
			const res = await mantenimientosApi.list(params);
			mantenimientos = res.data;
		} catch {
			addToast('error', 'Error al cargar mantenimientos');
		} finally {
			loading = false;
		}
	}

	const columns = [
		{ key: 'titulo', label: 'Título' },
		{ key: 'equipo_nombre', label: 'Equipo' },
		{ key: 'tipo', label: 'Tipo' },
		{ key: 'fecha', label: 'Fecha', render: (i: MantenimientoList) => new Date(i.fecha).toLocaleDateString() },
		{ key: 'estado', label: 'Estado', render: (i: MantenimientoList) => `<span class="status-badge">${i.estado}</span>` },
		{ key: 'usuario_nombre', label: 'Realizado por' },
	];
</script>

<div class="space-y-4 md:space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
		<h2 class="text-lg md:text-xl font-semibold text-slate-800">Mantenimientos</h2>
		<a href="/admin/mantenimientos/crear" class="inline-block text-center px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
			+ Nuevo
		</a>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-4">
		<div class="flex flex-wrap gap-2 md:gap-3">
			<select bind:value={filterTipo} class="flex-1 min-w-0 rounded-lg border border-slate-300 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm">
				<option value="">Todos los tipos</option>
				<option value="CORRECTIVO">Correctivo</option>
				<option value="PREVENTIVO">Preventivo</option>
				<option value="EMERGENCIA">Emergencia</option>
			</select>
			<select bind:value={filterEstado} class="flex-1 min-w-0 rounded-lg border border-slate-300 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm">
				<option value="">Todos los estados</option>
				<option value="PENDIENTE">Pendiente</option>
				<option value="REALIZADO">Realizado</option>
			</select>
			<button onclick={loadData} class="px-3 md:px-4 py-1.5 md:py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs md:text-sm rounded-lg transition-colors">Filtrar</button>
		</div>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="min-w-[500px] w-full divide-y divide-slate-200">
				<thead class="bg-slate-50">
					<tr>
						{#each columns as col}
							<th class="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 uppercase">{col.label}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200">
					{#if loading}
						<tr><td colspan={columns.length} class="px-2 md:px-4 py-8 md:py-12 text-center text-slate-500 text-sm">Cargando...</td></tr>
					{:else if mantenimientos.length === 0}
						<tr><td colspan={columns.length} class="px-2 md:px-4 py-8 md:py-12 text-center text-slate-400 text-sm">Sin mantenimientos</td></tr>
					{:else}
						{#each mantenimientos as m}
							<tr class="hover:bg-slate-50 transition-colors">
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-slate-800">{m.titulo}</td>
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-600">{m.equipo_nombre}</td>
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-600 capitalize">{m.tipo}</td>
								<td class="hidden sm:table-cell px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-600">{new Date(m.fecha).toLocaleDateString()}</td>
								<td class="px-2 md:px-4 py-2 md:py-3"><StatusBadge status={m.estado} /></td>
								<td class="hidden md:table-cell px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-600">{m.usuario_nombre}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
