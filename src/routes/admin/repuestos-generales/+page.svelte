<script lang="ts">
	import { onMount } from 'svelte';
	import { repuestosGeneralesApi } from '$lib/api/repuestos_generales';
	import { addToast } from '$lib/stores/toast';
	import { currentUser } from '$lib/stores/auth';
	import Modal from '$lib/components/Modal.svelte';
	import { getErrorDetail } from '$lib/api/client';
	import type { RepuestoGeneralList, RepuestoGeneralCreate, RepuestoGeneralUpdate } from '$lib/types';

	let items = $state<RepuestoGeneralList[]>([]);
	let loading = $state(true);
	let searchTerm = $state('');

	let showModal = $state(false);
	let editingId = $state<string | null>(null);
	let form = $state<RepuestoGeneralCreate>({
		codigo_repuesto: '',
		nombre: '',
		cantidad_stock: 0,
	});
	let showDeleteModal = $state(false);
	let deletingId = $state<string | null>(null);

	$effect(() => {
		if (showModal === false && editingId !== null) {
			editingId = null;
		}
	});

	onMount(load);

	async function load() {
		loading = true;
		try {
			const res = await repuestosGeneralesApi.list();
			items = res.data;
		} catch (err: any) {
			addToast('error', 'Error al cargar repuestos generales');
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		form = { codigo_repuesto: '', nombre: '', cantidad_stock: 0 };
		editingId = null;
		showModal = true;
	}

	async function openEdit(id: string) {
		try {
			const res = await repuestosGeneralesApi.get(id);
			const d = res.data;
			form = {
				codigo_repuesto: d.codigo_repuesto,
				nombre: d.nombre,
				descripcion: d.descripcion || '',
				marca: d.marca || '',
				modelo: d.modelo || '',
				numero_serie: d.numero_serie || '',
				cantidad_stock: d.cantidad_stock,
				ubicacion_almacen: d.ubicacion_almacen || '',
				observaciones: d.observaciones || '',
			};
			editingId = id;
			showModal = true;
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}

	async function handleSave() {
		try {
			if (editingId) {
				const update: RepuestoGeneralUpdate = {};
				for (const [k, v] of Object.entries(form)) {
					if (v !== undefined && v !== null) (update as any)[k] = v;
				}
				await repuestosGeneralesApi.update(editingId, update);
				addToast('success', 'Repuesto general actualizado');
			} else {
				await repuestosGeneralesApi.create(form);
				addToast('success', 'Repuesto general creado');
			}
			showModal = false;
			await load();
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
			await repuestosGeneralesApi.delete(deletingId);
			addToast('success', 'Repuesto general eliminado');
			showDeleteModal = false;
			deletingId = null;
			await load();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}

	let filtered = $derived(
		searchTerm
			? items.filter(
					(i) =>
						i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
						i.codigo_repuesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
						(i.marca || '').toLowerCase().includes(searchTerm.toLowerCase()),
				)
			: items,
	);
</script>

<div class="space-y-4 md:space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
		<h2 class="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100">Repuestos Generales</h2>
		<button onclick={openCreate} class="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap self-start">
			+ Nuevo Repuesto
		</button>
	</div>

	<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
		<div class="mb-4">
			<input
				type="text"
				bind:value={searchTerm}
				placeholder="Buscar por nombre, código o marca..."
				class="w-full md:w-72 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
			/>
		</div>

		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else if filtered.length === 0}
			<p class="text-sm text-slate-400 text-center py-12">Sin repuestos generales registrados</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-[600px] w-full divide-y divide-slate-200 dark:divide-slate-700">
					<thead class="bg-slate-50 dark:bg-slate-700">
						<tr>
							<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Código</th>
							<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Nombre</th>
							<th class="hidden sm:table-cell px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Marca</th>
							<th class="hidden sm:table-cell px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Modelo</th>
							<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Stock</th>
							<th class="hidden md:table-cell px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Ubicación</th>
							<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
						{#each filtered as item}
							<tr>
								<td class="px-3 py-3 text-sm font-medium text-blue-600">{item.codigo_repuesto}</td>
								<td class="px-3 py-3 text-sm text-slate-800 dark:text-slate-100">{item.nombre}</td>
								<td class="hidden sm:table-cell px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{item.marca || '—'}</td>
								<td class="hidden sm:table-cell px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{item.modelo || '—'}</td>
								<td class="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{item.cantidad_stock}</td>
								<td class="hidden md:table-cell px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{item.ubicacion_almacen || '—'}</td>
								<td class="px-3 py-3 text-sm">
									<div class="flex gap-2">
										<button onclick={() => openEdit(item.id)} class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium">Editar</button>
										<button onclick={() => confirmDelete(item.id)} class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium">Eliminar</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<Modal bind:open={showModal} title={editingId ? 'Editar Repuesto General' : 'Nuevo Repuesto General'} onConfirm={handleSave} confirmText={editingId ? 'Guardar cambios' : 'Crear'}>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código *</label>
			<input type="text" bind:value={form.codigo_repuesto} required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
			<input type="text" bind:value={form.nombre} required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Marca</label>
			<input type="text" bind:value={form.marca} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Modelo</label>
			<input type="text" bind:value={form.modelo} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">N° Serie</label>
			<input type="text" bind:value={form.numero_serie} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock *</label>
			<input type="number" bind:value={form.cantidad_stock} min="0" step="0.01" required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación</label>
			<input type="text" bind:value={form.ubicacion_almacen} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
			<input type="text" bind:value={form.descripcion} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm" />
		</div>
		<div class="md:col-span-2">
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observaciones</label>
			<textarea bind:value={form.observaciones} rows={2} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"></textarea>
		</div>
	</div>
</Modal>

<Modal bind:open={showDeleteModal} title="Eliminar Repuesto General" onConfirm={handleDelete} confirmText="Eliminar">
	<p class="text-sm text-slate-600 dark:text-slate-300">¿Estás seguro de eliminar este repuesto general? Esta acción no se puede deshacer.</p>
</Modal>
