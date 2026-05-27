<script lang="ts">
	import { onMount } from 'svelte';
	import { equiposApi } from '$lib/api/equipos';
	import { addToast } from '$lib/stores/toast';
	import { getErrorDetail } from '$lib/api/client';
	import type { EquipoList, RepuestoNecesario } from '$lib/types';

	let equipos = $state<EquipoList[]>([]);
	let equipoId = $state('');
	let repuestos = $state<RepuestoNecesario[]>([]);
	let loading = $state(false);
	let loadingRepuestos = $state(false);

	let showModal = $state(false);
	let formCodigo = $state('');
	let formDescripcion = $state('');
	let formParaQue = $state('');
	let formUbicacion = $state('');
	let formCantidad = $state(1);
	let formObservaciones = $state('');
	let editingRepuestoId = $state<string | null>(null);

	onMount(async () => {
		try {
			const res = await equiposApi.list({ limit: 100 });
			equipos = res.data;
		} catch {
			addToast('error', 'Error al cargar equipos');
		}
	});

	async function loadRepuestos() {
		if (!equipoId) { repuestos = []; return; }
		loadingRepuestos = true;
		try {
			const res = await equiposApi.repuestosList(equipoId);
			repuestos = res.data;
		} catch {
			addToast('error', 'Error al cargar repuestos');
		} finally {
			loadingRepuestos = false;
		}
	}

	function openCreate() {
		editingRepuestoId = null;
		formCodigo = '';
		formDescripcion = '';
		formParaQue = '';
		formUbicacion = '';
		formCantidad = 1;
		formObservaciones = '';
		showModal = true;
	}

	async function handleSave() {
		if (!equipoId) return;
		loading = true;
		try {
			await equiposApi.repuestosCreate(equipoId, {
				codigo_repuesto: formCodigo,
				descripcion: formDescripcion,
				para_que: formParaQue || null,
				ubicacion: formUbicacion || null,
				cantidad_necesaria: formCantidad,
				observaciones: formObservaciones || null,
			} as any);
			addToast('success', 'Repuesto agregado');
			showModal = false;
			await loadRepuestos();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		} finally {
			loading = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('¿Eliminar este repuesto?')) return;
		try {
			await equiposApi.repuestosDelete(equipoId, id);
			addToast('success', 'Repuesto eliminado');
			await loadRepuestos();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">Repuestos por Equipo</h2>
		<p class="text-sm text-slate-500 dark:text-slate-400">Gestiona los repuestos necesarios para cada equipo</p>
	</div>

	<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
		<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Seleccionar equipo</label>
		<div class="flex flex-col sm:flex-row gap-3">
			<select
				bind:value={equipoId}
				onchange={loadRepuestos}
				class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm"
			>
				<option value="">— Seleccione un equipo —</option>
				{#each equipos as eq}
					<option value={eq.id}>{eq.codigo_equipo} - {eq.nombre}</option>
				{/each}
			</select>
			{#if equipoId}
				<button
					onclick={openCreate}
					class="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
				>
					+ Agregar Repuesto
				</button>
			{/if}
		</div>
	</div>

	{#if equipoId}
		<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
			{#if loadingRepuestos}
				<div class="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">Cargando repuestos...</div>
			{:else if repuestos.length === 0}
				<div class="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
					Este equipo no tiene repuestos registrados
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
						<thead class="bg-slate-50 dark:bg-slate-700">
							<tr>
								<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Código</th>
								<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Descripción</th>
								<th class="hidden sm:table-cell px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Para qué</th>
								<th class="hidden sm:table-cell px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Ubicación</th>
								<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Cant.</th>
								<th class="px-3 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Acción</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
							{#each repuestos as r}
								<tr class="hover:bg-slate-50 dark:hover:bg-slate-700">
									<td class="px-3 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">{r.codigo_repuesto}</td>
									<td class="px-3 py-3 text-sm text-slate-700 dark:text-slate-200">{r.descripcion}</td>
									<td class="hidden sm:table-cell px-3 py-3 text-sm text-slate-500 dark:text-slate-400">{r.para_que || '—'}</td>
									<td class="hidden sm:table-cell px-3 py-3 text-sm text-slate-500 dark:text-slate-400">{r.ubicacion || '—'}</td>
									<td class="px-3 py-3 text-sm text-slate-700 dark:text-slate-200">{r.cantidad_necesaria ?? '—'}</td>
									<td class="px-3 py-3 text-right">
										<button
											onclick={() => handleDelete(r.id)}
											class="text-red-600 dark:text-red-400 hover:text-red-800 text-sm font-medium"
										>
											Eliminar
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if showModal}
	<div class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
		<div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
			<div class="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
				<h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Nuevo Repuesto</h2>
				<button onclick={() => (showModal = false)} class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xl">&times;</button>
			</div>
			<div class="px-5 py-4 space-y-4">
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código *</label>
					<input type="text" bind:value={formCodigo} required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" />
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción *</label>
					<input type="text" bind:value={formDescripcion} required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" />
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Para qué</label>
					<input type="text" bind:value={formParaQue} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" placeholder="Ej: Cambio de rodamientos" />
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación</label>
					<input type="text" bind:value={formUbicacion} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" placeholder="Ej: Almacén A, estante 3" />
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cantidad necesaria</label>
					<input type="number" bind:value={formCantidad} min="1" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" />
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observaciones</label>
					<textarea bind:value={formObservaciones} rows={2} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm"></textarea>
				</div>
			</div>
			<div class="flex flex-col sm:flex-row justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
				<button
					onclick={() => (showModal = false)}
					class="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
				>
					Cancelar
				</button>
				<button
					onclick={handleSave}
					disabled={loading || !formCodigo || !formDescripcion}
					class="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
				>
					{loading ? 'Guardando...' : 'Guardar'}
				</button>
			</div>
		</div>
	</div>
{/if}
