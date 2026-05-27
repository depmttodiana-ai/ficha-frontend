<script lang="ts">
	import { onMount } from 'svelte';
	import { areasApi } from '$lib/api/areas';
	import { addToast } from '$lib/stores/toast';
	import { currentUser } from '$lib/stores/auth';
	import Modal from '$lib/components/Modal.svelte';
	import { getErrorDetail } from '$lib/api/client';
	import type { AreaList, AreaRead } from '$lib/types';

	let areas = $state<AreaList[]>([]);
	let loading = $state(true);
	let showModal = $state(false);
	let editing = $state<AreaRead | null>(null);
	let formNombre = $state('');
	let formCodigo = $state('');
	let formDescripcion = $state('');

	onMount(() => loadAreas());

	async function loadAreas() {
		loading = true;
		try {
			const res = await areasApi.list({ limit: 100 });
			areas = res.data;
		} catch {
			addToast('error', 'Error al cargar áreas');
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		editing = null;
		formNombre = '';
		formCodigo = '';
		formDescripcion = '';
		showModal = true;
	}

	async function openEdit(id: string) {
		try {
			const res = await areasApi.get(id);
			editing = res.data;
			formNombre = res.data.nombre;
			formCodigo = res.data.codigo || '';
			formDescripcion = res.data.descripcion || '';
			showModal = true;
		} catch {
			addToast('error', 'Error al cargar área');
		}
	}

	async function handleSave() {
		try {
			if (editing) {
				await areasApi.update(editing.id, { nombre: formNombre, codigo: formCodigo || undefined, descripcion: formDescripcion || undefined });
				addToast('success', 'Área actualizada');
			} else {
				await areasApi.create({ nombre: formNombre, codigo: formCodigo || undefined, descripcion: formDescripcion || undefined });
				addToast('success', 'Área creada');
			}
			showModal = false;
			await loadAreas();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('¿Eliminar esta área?')) return;
		try {
			await areasApi.delete(id);
			addToast('success', 'Área eliminada');
			await loadAreas();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}
</script>

<div class="space-y-4 md:space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
		<h2 class="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Áreas</h2>
		<button onclick={openCreate} class="inline-block text-center px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
			+ Nueva
		</button>
	</div>

	<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="min-w-[400px] w-full divide-y divide-slate-200 dark:divide-slate-700">
				<thead class="bg-slate-50 dark:bg-slate-700">
					<tr>
						<th class="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Nombre</th>
						<th class="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Código</th>
						<th class="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
					{#if loading}
						<tr><td colspan="3" class="px-2 md:px-4 py-8 md:py-12 text-center text-slate-500 dark:text-slate-400 text-sm">Cargando...</td></tr>
					{:else if areas.length === 0}
						<tr><td colspan="3" class="px-2 md:px-4 py-8 md:py-12 text-center text-slate-400 dark:text-slate-500 text-sm">Sin áreas registradas</td></tr>
					{:else}
						{#each areas as a}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-700">
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-slate-800 dark:text-slate-100">{a.nombre}</td>
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-600 dark:text-slate-300">{a.codigo || '—'}</td>
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm whitespace-nowrap">
									<button onclick={() => openEdit(a.id)} class="text-blue-600 dark:text-blue-400 hover:underline mr-2 md:mr-3">Editar</button>
									<button onclick={() => handleDelete(a.id)} class="text-red-600 dark:text-red-400 hover:underline">Eliminar</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<Modal bind:open={showModal} title={editing ? 'Editar Área' : 'Nueva Área'} onConfirm={handleSave}>
	<div class="space-y-4">
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
			<input type="text" bind:value={formNombre} required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código</label>
			<input type="text" bind:value={formCodigo} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
			<textarea bind:value={formDescripcion} rows={3} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"></textarea>
		</div>
	</div>
</Modal>
