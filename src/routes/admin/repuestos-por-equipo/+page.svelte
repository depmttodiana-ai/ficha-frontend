<script lang="ts">
	import { onMount } from 'svelte';
	import { repuestosPorEquipoApi } from '$lib/api/repuestos_por_equipo';
	import { repuestosGeneralesApi } from '$lib/api/repuestos_generales';
	import { equiposApi } from '$lib/api/equipos';
	import { addToast } from '$lib/stores/toast';
	import Modal from '$lib/components/Modal.svelte';
	import { getErrorDetail } from '$lib/api/client';
	import type { RepuestoPorEquipoRead, RepuestoGeneralList, EquipoList } from '$lib/types';

	let asignaciones = $state<RepuestoPorEquipoRead[]>([]);
	let repuestosGenerales = $state<RepuestoGeneralList[]>([]);
	let equipos = $state<EquipoList[]>([]);
	let loading = $state(true);

	let filterRepuestoId = $state('');
	let filterEquipoId = $state('');

	let showModal = $state(false);
	let formRepuestoId = $state('');
	let formEquipoId = $state('');
	let formClasificacion = $state('');
	let formObservaciones = $state('');

	let showDeleteModal = $state(false);
	let deletingId = $state<string | null>(null);

	onMount(async () => {
		try {
			const [rgRes, eqRes] = await Promise.all([
				repuestosGeneralesApi.list(),
				equiposApi.list(),
			]);
			repuestosGenerales = rgRes.data;
			equipos = eqRes.data;
		} catch (err: any) {
			addToast('error', 'Error al cargar datos iniciales');
		}
		await loadAsignaciones();
	});

	async function loadAsignaciones() {
		loading = true;
		try {
			if (filterRepuestoId) {
				const res = await repuestosPorEquipoApi.byRepuestoGeneral(filterRepuestoId);
				asignaciones = res.data;
			} else if (filterEquipoId) {
				const res = await repuestosPorEquipoApi.byEquipo(filterEquipoId);
				asignaciones = res.data;
			} else {
				const res = await repuestosPorEquipoApi.list();
				asignaciones = res.data;
			}
		} catch (err: any) {
			addToast('error', 'Error al cargar asignaciones');
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		formRepuestoId = '';
		formEquipoId = '';
		formClasificacion = '';
		formObservaciones = '';
		showModal = true;
	}

	async function handleSave() {
		if (!formRepuestoId || !formEquipoId) {
			addToast('error', 'Selecciona un repuesto y un equipo');
			return;
		}
		try {
			await repuestosPorEquipoApi.create({
				repuesto_general_id: formRepuestoId,
				equipo_id: formEquipoId,
				clasificacion: formClasificacion || undefined,
				observaciones: formObservaciones || undefined,
			});
			addToast('success', 'Asignación creada');
			showModal = false;
			await loadAsignaciones();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}

	function confirmDelete(id: string) {
		deletingId = id;
		showDeleteModal = true;
	}

	async function handleDelete() {
		if (!deletingId) return;
		try {
			await repuestosPorEquipoApi.delete(deletingId);
			addToast('success', 'Asignación eliminada');
			showDeleteModal = false;
			deletingId = null;
			await loadAsignaciones();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}

	function applyFilter() {
		loadAsignaciones();
	}

	function clearFilters() {
		filterRepuestoId = '';
		filterEquipoId = '';
		loadAsignaciones();
	}
</script>

<div class="space-y-4 md:space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
		<h2 class="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100">Repuestos por Equipo</h2>
		<button onclick={openCreate} class="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap self-start">
			+ Asignar Repuesto
		</button>
	</div>

	<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
		<div class="flex flex-wrap items-end gap-3 mb-4">
			<div>
				<label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Filtrar por Repuesto</label>
				<select bind:value={filterRepuestoId} class="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm min-w-[180px]">
					<option value="">Todos</option>
					{#each repuestosGenerales as rg}
						<option value={rg.id}>{rg.codigo_repuesto} - {rg.nombre}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Filtrar por Equipo</label>
				<select bind:value={filterEquipoId} class="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm min-w-[180px]">
					<option value="">Todos</option>
					{#each equipos as eq}
						<option value={eq.id}>{eq.codigo_equipo} - {eq.nombre}</option>
					{/each}
				</select>
			</div>
			<button onclick={applyFilter} class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">Filtrar</button>
			<button onclick={clearFilters} class="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors">Limpiar</button>
		</div>

		<div class="overflow-x-auto">
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
				</div>
			{:else if asignaciones.length === 0}
				<p class="text-sm text-slate-400 text-center py-12">Sin asignaciones registradas</p>
			{:else}
				<table class="min-w-[600px] w-full divide-y divide-slate-200 dark:divide-slate-700">
					<thead class="bg-slate-50 dark:bg-slate-700">
						<tr>
							<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Repuesto</th>
							<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Equipo</th>
							<th class="hidden sm:table-cell px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Clasificación</th>
							<th class="hidden md:table-cell px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Observaciones</th>
							<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
						{#each asignaciones as a}
							<tr>
								<td class="px-3 py-3 text-sm">
									<span class="font-medium text-blue-600">{a.codigo_repuesto}</span>
									<span class="text-slate-500 ml-1">{a.nombre_repuesto}</span>
								</td>
								<td class="px-3 py-3 text-sm text-slate-800 dark:text-slate-100">
									<span class="font-medium">{a.codigo_equipo}</span>
									<span class="text-slate-500 ml-1">{a.nombre_equipo}</span>
								</td>
								<td class="hidden sm:table-cell px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{a.clasificacion || '—'}</td>
								<td class="hidden md:table-cell px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{a.observaciones || '—'}</td>
								<td class="px-3 py-3 text-sm">
									<button onclick={() => confirmDelete(a.id)} class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium">Eliminar</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>
</div>

<Modal bind:open={showModal} title="Asignar Repuesto a Equipo" onConfirm={handleSave} confirmText="Asignar">
	<div class="space-y-4">
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Repuesto General *</label>
			<select bind:value={formRepuestoId} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm">
				<option value="">Seleccionar...</option>
				{#each repuestosGenerales as rg}
					<option value={rg.id}>{rg.codigo_repuesto} - {rg.nombre}</option>
				{/each}
			</select>
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Equipo *</label>
			<select bind:value={formEquipoId} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm">
				<option value="">Seleccionar...</option>
				{#each equipos as eq}
					<option value={eq.id}>{eq.codigo_equipo} - {eq.nombre}</option>
				{/each}
			</select>
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Clasificación</label>
			<input type="text" bind:value={formClasificacion} placeholder="Ej: Crítico, Estándar, Emergencia..." class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observaciones</label>
			<textarea bind:value={formObservaciones} rows={2} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm"></textarea>
		</div>
	</div>
</Modal>

<Modal bind:open={showDeleteModal} title="Eliminar Asignación" onConfirm={handleDelete} confirmText="Eliminar">
	<p class="text-sm text-slate-600 dark:text-slate-300">¿Estás seguro de eliminar esta asignación?</p>
</Modal>
