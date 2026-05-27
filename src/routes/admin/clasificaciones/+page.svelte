<script lang="ts">
	import { onMount } from 'svelte';
	import { clasificacionesApi } from '$lib/api/clasificaciones';
	import { addToast } from '$lib/stores/toast';
	import Modal from '$lib/components/Modal.svelte';
	import { getErrorDetail } from '$lib/api/client';
	import type { ClasificacionList, ClasificacionRead } from '$lib/types';

	let clasificaciones = $state<ClasificacionList[]>([]);
	let loading = $state(true);
	let showModal = $state(false);
	let editing = $state<ClasificacionRead | null>(null);
	let formNombre = $state('');
	let formDescripcion = $state('');

	onMount(() => loadData());

	async function loadData() {
		loading = true;
		try {
			const res = await clasificacionesApi.list({ limit: 100 });
			clasificaciones = res.data;
		} catch {
			addToast('error', 'Error al cargar clasificaciones');
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		editing = null;
		formNombre = '';
		formDescripcion = '';
		showModal = true;
	}

	async function openEdit(id: string) {
		try {
			const res = await clasificacionesApi.get(id);
			editing = res.data;
			formNombre = res.data.nombre;
			formDescripcion = res.data.descripcion || '';
			showModal = true;
		} catch {
			addToast('error', 'Error al cargar');
		}
	}

	async function handleSave() {
		try {
			if (editing) {
				await clasificacionesApi.update(editing.id, { nombre: formNombre, descripcion: formDescripcion || undefined });
				addToast('success', 'Clasificación actualizada');
			} else {
				await clasificacionesApi.create({ nombre: formNombre, descripcion: formDescripcion || undefined });
				addToast('success', 'Clasificación creada');
			}
			showModal = false;
			await loadData();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('¿Eliminar esta clasificación?')) return;
		try {
			await clasificacionesApi.delete(id);
			addToast('success', 'Clasificación eliminada');
			await loadData();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}
</script>

<div class="space-y-4 md:space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
		<h2 class="text-lg md:text-xl font-semibold text-slate-800">Clasificaciones</h2>
		<button onclick={openCreate} class="inline-block text-center px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
			+ Nueva
		</button>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="min-w-[400px] w-full divide-y divide-slate-200">
				<thead class="bg-slate-50">
					<tr>
						<th class="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th>
						<th class="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 uppercase">Descripción</th>
						<th class="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200">
					{#if loading}
						<tr><td colspan="3" class="px-2 md:px-4 py-8 md:py-12 text-center text-slate-500 text-sm">Cargando...</td></tr>
					{:else if clasificaciones.length === 0}
						<tr><td colspan="3" class="px-2 md:px-4 py-8 md:py-12 text-center text-slate-400 text-sm">Sin clasificaciones</td></tr>
					{:else}
						{#each clasificaciones as c}
							<tr class="hover:bg-slate-50">
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-slate-800">{c.nombre}</td>
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-600">{c.descripcion || '—'}</td>
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm whitespace-nowrap">
									<button onclick={() => openEdit(c.id)} class="text-blue-600 hover:underline mr-2 md:mr-3">Editar</button>
									<button onclick={() => handleDelete(c.id)} class="text-red-600 hover:underline">Eliminar</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<Modal bind:open={showModal} title={editing ? 'Editar Clasificación' : 'Nueva Clasificación'} onConfirm={handleSave}>
	<div class="space-y-4">
		<div>
			<label class="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
			<input type="text" bind:value={formNombre} required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
			<textarea bind:value={formDescripcion} rows={3} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"></textarea>
		</div>
	</div>
</Modal>
