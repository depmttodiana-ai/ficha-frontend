<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { equiposApi } from '$lib/api/equipos';
	import { mantenimientosApi } from '$lib/api/mantenimientos';
	import { historialApi } from '$lib/api/historial';
	import { reportesApi } from '$lib/api/reportes';
	import { addToast } from '$lib/stores/toast';
	import { currentUser } from '$lib/stores/auth';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { getErrorDetail } from '$lib/api/client';
	import type { EquipoRead, MantenimientoList, HistorialRead, EstadoEquipo, EquipoList } from '$lib/types';

	let equipo = $state<EquipoRead | null>(null);
	let mantenimientos = $state<MantenimientoList[]>([]);
	let historial = $state<HistorialRead[]>([]);
	let loading = $state(true);
	let tab = $state<'info' | 'mantenimientos' | 'historial' | 'fotos' | 'repuestos' | 'compatibilidad'>('info');

	let showEstadoModal = $state(false);
	let showDeleteModal = $state(false);
	let nuevoEstado = $state<EstadoEquipo>('OPERATIVO');
	let motivoEstado = $state('');

	let showEditModal = $state(false);
	let editFields = $state<Record<string, string>>({});

	let equiposDisponibles = $state<EquipoList[]>([]);
	let showCompatModal = $state(false);
	let compatEquipoDestinoId = $state('');
	let compatDescripcion = $state('');

	let id = $derived($page.params.id);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const [eqRes, mtRes, histRes, eqListRes] = await Promise.all([
				equiposApi.get(id),
				mantenimientosApi.byEquipo(id),
				historialApi.byEquipo(id),
				equiposApi.list({ nivel: 1 }),
			]);
			equipo = eqRes.data;
			mantenimientos = mtRes.data;
			historial = histRes.data;
			equiposDisponibles = eqListRes.data;
		} catch (err: any) {
			addToast('error', 'Error al cargar equipo');
			goto('/admin/equipos');
		} finally {
			loading = false;
		}
	}

	async function handleAddCompat() {
		if (!compatEquipoDestinoId) return;
		try {
			await equiposApi.compatibleCreate(id, {
				equipo_destino_id: compatEquipoDestinoId,
				descripcion: compatDescripcion || undefined,
			});
			addToast('success', 'Compatibilidad registrada');
			showCompatModal = false;
			compatEquipoDestinoId = '';
			compatDescripcion = '';
			await loadData();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}

	async function handleDeleteCompat(relacionId: string) {
		try {
			await equiposApi.compatibleDelete(id, relacionId);
			addToast('success', 'Compatibilidad eliminada');
			await loadData();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}

	async function handleEstadoChange() {
		try {
			await equiposApi.patchEstado(id, { estado: nuevoEstado, motivo_estado: motivoEstado || undefined });
			addToast('success', 'Estado actualizado');
			showEstadoModal = false;
			motivoEstado = '';
			await loadData();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}

	async function handleDelete() {
		try {
			await equiposApi.delete(id);
			addToast('success', 'Equipo eliminado');
			goto('/admin/equipos');
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
		showDeleteModal = false;
	}

	async function handleEdit() {
		try {
			await equiposApi.update(id, editFields);
			addToast('success', 'Equipo actualizado');
			showEditModal = false;
			await loadData();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}

	function openEdit() {
		if (!equipo) return;
		editFields = {
			nombre: equipo.nombre,
			descripcion: equipo.descripcion || '',
			marca: equipo.marca || '',
			modelo: equipo.modelo || '',
			numero_serie: equipo.numero_serie || '',
			potencia: equipo.potencia || '',
			voltaje: equipo.voltaje || '',
			rpm: equipo.rpm || '',
			capacidad: equipo.capacidad || '',
			proveedor: equipo.proveedor || '',
			observaciones: equipo.observaciones || '',
		};
		showEditModal = true;
	}
</script>

{#if loading}
	<div class="flex items-center justify-center py-20">
		<div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
	</div>
{:else if equipo}
	<div class="space-y-4 md:space-y-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
			<div class="min-w-0">
				<a href="/admin/equipos" class="text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:underline">← Volver a equipos</a>
				<h2 class="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 truncate">{equipo.codigo_equipo} - {equipo.nombre}</h2>
			</div>
			<div class="flex flex-wrap gap-1.5 md:gap-2">
				<button onclick={openEdit} class="px-2.5 md:px-4 py-1.5 md:py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs md:text-sm font-medium rounded-lg transition-colors">Editar</button>
				<button onclick={() => { nuevoEstado = equipo.estado; motivoEstado = ''; showEstadoModal = true; }} class="px-2.5 md:px-4 py-1.5 md:py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs md:text-sm font-medium rounded-lg transition-colors">Estado</button>
				<a href={reportesApi.equipoPdf(id)} target="_blank" class="px-2.5 md:px-4 py-1.5 md:py-2 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors">PDF</a>
				<a href={reportesApi.equipoQr(id)} target="_blank" class="px-2.5 md:px-4 py-1.5 md:py-2 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors">QR</a>
				<button onclick={() => (showDeleteModal = true)} class="px-2.5 md:px-4 py-1.5 md:py-2 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors">Eliminar</button>
			</div>
		</div>

		<StatusBadge status={equipo.estado} size="md" />

		<div class="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
			<nav class="flex gap-4 md:gap-6 min-w-max">
				<button onclick={() => (tab = 'info')} class="pb-2 md:pb-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap" 			class:border-blue-600={tab === 'info'} class:text-blue-600={tab === 'info'} class:border-transparent={tab !== 'info'} class:text-slate-500={tab !== 'info'} class:dark:text-slate-400={tab !== 'info'}>
					Información
				</button>
				<button onclick={() => (tab = 'mantenimientos')} class="pb-2 md:pb-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap" class:border-blue-600={tab === 'mantenimientos'} class:text-blue-600={tab === 'mantenimientos'} class:border-transparent={tab !== 'mantenimientos'} class:text-slate-500={tab !== 'mantenimientos'} class:dark:text-slate-400={tab !== 'mantenimientos'}>
					Mantenimientos ({mantenimientos.length})
				</button>
				<button onclick={() => (tab = 'fotos')} class="pb-2 md:pb-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap" class:border-blue-600={tab === 'fotos'} class:text-blue-600={tab === 'fotos'} class:border-transparent={tab !== 'fotos'} class:text-slate-500={tab !== 'fotos'} class:dark:text-slate-400={tab !== 'fotos'}>
					Fotos ({equipo.fotos.length})
				</button>
				<button onclick={() => (tab = 'repuestos')} class="pb-2 md:pb-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap" class:border-blue-600={tab === 'repuestos'} class:text-blue-600={tab === 'repuestos'} class:border-transparent={tab !== 'repuestos'} class:text-slate-500={tab !== 'repuestos'} class:dark:text-slate-400={tab !== 'repuestos'}>
					Repuestos
				</button>
				<button onclick={() => (tab = 'historial')} class="pb-2 md:pb-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap" class:border-blue-600={tab === 'historial'} class:text-blue-600={tab === 'historial'} class:border-transparent={tab !== 'historial'} class:text-slate-500={tab !== 'historial'} class:dark:text-slate-400={tab !== 'historial'}>
					Historial
				</button>
				<button onclick={() => (tab = 'compatibilidad')} class="pb-2 md:pb-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap" class:border-blue-600={tab === 'compatibilidad'} class:text-blue-600={tab === 'compatibilidad'} class:border-transparent={tab !== 'compatibilidad'} class:text-slate-500={tab !== 'compatibilidad'} class:dark:text-slate-400={tab !== 'compatibilidad'}>
					Compatibilidad
				</button>
			</nav>
		</div>

		{#if tab === 'info'}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
				<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
					<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3">Datos generales</h3>
					<dl class="space-y-2 md:space-y-3 text-sm">
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Código</dt><dd class="text-slate-800 dark:text-slate-100 font-medium text-right">{equipo.codigo_equipo}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Nombre</dt><dd class="text-slate-800 dark:text-slate-100 font-medium text-right">{equipo.nombre}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Descripción</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.descripcion || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Nivel</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.nivel}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Área</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.nombre_area || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Clasificación</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.nombre_clasificacion || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Estado</dt><dd><StatusBadge status={equipo.estado} /></dd></div>
						{#if equipo.motivo_estado}
							<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Motivo</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.motivo_estado}</dd></div>
						{/if}
					</dl>
				</div>

				<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
					<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3">Especificaciones</h3>
					<dl class="space-y-2 md:space-y-3 text-sm">
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Marca</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.marca || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Modelo</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.modelo || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">N° Serie</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.numero_serie || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Potencia</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.potencia || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Voltaje</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.voltaje || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">RPM</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.rpm || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Capacidad</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.capacidad || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Año fab.</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.anio_fabricacion ?? '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Proveedor</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.proveedor || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-slate-500 dark:text-slate-400 shrink-0">Fecha adq.</dt><dd class="text-slate-800 dark:text-slate-100 text-right">{equipo.fecha_adquisicion ? new Date(equipo.fecha_adquisicion).toLocaleDateString() : '—'}</dd></div>
					</dl>
				</div>

				<div class="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
					<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3">Observaciones</h3>
					<p class="text-sm text-slate-700 dark:text-slate-200">{equipo.observaciones || 'Sin observaciones'}</p>
				</div>
			</div>
		{:else if tab === 'mantenimientos'}
			<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
				<div class="flex items-center justify-between gap-2 mb-3 md:mb-4">
					<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base">Historial de Mantenimientos</h3>
					<a href="/admin/mantenimientos/crear?equipo_id={id}" class="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
						+ Nuevo
					</a>
				</div>
				{#if mantenimientos.length === 0}
					<p class="text-sm text-slate-400 text-center py-8">Sin mantenimientos registrados</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="min-w-[400px] w-full divide-y divide-slate-200 dark:divide-slate-700">
							<thead class="bg-slate-50 dark:bg-slate-700">
								<tr>
									<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Título</th>
									<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Tipo</th>
									<th class="hidden sm:table-cell px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Fecha</th>
									<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Estado</th>
									<th class="hidden md:table-cell px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Realizado por</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
								{#each mantenimientos as m}
									<tr>
										<td class="px-3 py-3 text-sm text-slate-800 dark:text-slate-100">{m.titulo}</td>
										<td class="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{m.tipo}</td>
										<td class="hidden sm:table-cell px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{new Date(m.fecha).toLocaleDateString()}</td>
										<td class="px-3 py-3"><StatusBadge status={m.estado} /></td>
										<td class="hidden md:table-cell px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{m.usuario_nombre}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{:else if tab === 'fotos'}
			<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
				<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3 md:mb-4">Fotos del equipo</h3>
				{#if equipo.fotos.length === 0}
					<p class="text-sm text-slate-400 text-center py-8">Sin fotos</p>
				{:else}
					<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
						{#each equipo.fotos as foto}
							<div>
								<img src={foto.url} alt={foto.tipo} class="w-full h-20 md:h-32 object-cover rounded-lg border" />
								<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center capitalize">{foto.tipo}</p>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{:else if tab === 'repuestos'}
			<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
				<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3 md:mb-4">Repuestos Necesarios</h3>
				{#if equipo.repuestos_necesarios.length === 0}
					<p class="text-sm text-slate-400 text-center py-8">Sin repuestos registrados</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="min-w-[400px] w-full divide-y divide-slate-200">
							<thead class="bg-slate-50">
								<tr>
									<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Código</th>
									<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Descripción</th>
									<th class="hidden sm:table-cell px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ubicación</th>
									<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Cant.</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-200">
								{#each equipo.repuestos_necesarios as r}
									<tr>
										<td class="px-3 py-3 text-sm font-medium text-blue-600">{r.codigo_repuesto}</td>
										<td class="px-3 py-3 text-sm text-slate-800">{r.descripcion}</td>
										<td class="hidden sm:table-cell px-3 py-3 text-sm text-slate-600">{r.ubicacion || '—'}</td>
										<td class="px-3 py-3 text-sm text-slate-600">{r.cantidad_necesaria ?? '—'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{:else if tab === 'historial'}
			<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
				<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3 md:mb-4">Historial de cambios</h3>
				{#if historial.length === 0}
					<p class="text-sm text-slate-400 text-center py-8">Sin cambios registrados</p>
				{:else}
					<div class="space-y-2 md:space-y-3">
						{#each historial as h}
							<div class="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-xs md:text-sm">
								<div class="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
								<div class="flex-1 min-w-0">
									<p class="text-slate-700 dark:text-slate-200">
										<span class="font-medium">{h.usuario_nombre}</span>
										cambió <span class="font-medium">{h.campo}</span>
									</p>
									<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
										{h.valor_anterior || '(vacío)'} → {h.valor_nuevo || '(vacío)'}
									</p>
									<p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{new Date(h.created_at).toLocaleString()}</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{:else if tab === 'compatibilidad'}
			<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
				<div class="flex items-center justify-between gap-2 mb-3 md:mb-4">
					<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base">Equipos donde puede funcionar</h3>
					<button onclick={() => { compatEquipoDestinoId = ''; compatDescripcion = ''; showCompatModal = true; }} class="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
						+ Agregar
					</button>
				</div>
				{#if (equipo.equipos_compatibles ?? []).length === 0}
					<p class="text-sm text-slate-400 text-center py-8">
						{equipo.nivel === 1 ? 'Los equipos principales no registran compatibilidad.' : 'Sin equipos compatibles registrados'}
					</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="min-w-[400px] w-full divide-y divide-slate-200 dark:divide-slate-700">
							<thead class="bg-slate-50 dark:bg-slate-700">
								<tr>
									<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Equipo</th>
									<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Código</th>
									<th class="hidden sm:table-cell px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Descripción</th>
									<th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Acciones</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
								{#each equipo.equipos_compatibles as c}
									<tr>
										<td class="px-3 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{c.nombre_equipo_destino}</td>
										<td class="px-3 py-3 text-sm text-blue-600">{c.codigo_equipo_destino}</td>
										<td class="hidden sm:table-cell px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{c.descripcion || '—'}</td>
										<td class="px-3 py-3 text-sm">
											<button onclick={() => handleDeleteCompat(c.id)} class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium">Eliminar</button>
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

	<Modal bind:open={showCompatModal} title="Agregar Equipo Compatible" onConfirm={handleAddCompat} confirmText="Agregar">
		<div class="space-y-4">
			<div>
				<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Equipo donde funciona *</label>
				<select bind:value={compatEquipoDestinoId} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm">
					<option value="">Seleccionar...</option>
					{#each equiposDisponibles as eq}
						<option value={eq.id}>{eq.codigo_equipo} - {eq.nombre}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
				<textarea bind:value={compatDescripcion} rows={2} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" placeholder="Ej: Puede servir como motor alternativo"></textarea>
			</div>
		</div>
	</Modal>

	<Modal bind:open={showEstadoModal} title="Cambiar Estado" onConfirm={handleEstadoChange} confirmText="Guardar">
		<div class="space-y-4">
			<div>
				<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nuevo estado</label>
				<select bind:value={nuevoEstado} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm">
					<option value="OPERATIVO">Operativo</option>
					<option value="PARADO">Parado</option>
					<option value="REPARACION">Reparación</option>
					<option value="BAJA">Baja</option>
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo</label>
				<textarea bind:value={motivoEstado} rows={3} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" placeholder="Opcional"></textarea>
			</div>
		</div>
	</Modal>

	<Modal bind:open={showDeleteModal} title="Eliminar Equipo" onConfirm={handleDelete} confirmText="Eliminar">
		<p class="text-sm text-slate-600 dark:text-slate-300">¿Estás seguro de eliminar este equipo? Esta acción no se puede deshacer.</p>
	</Modal>

	<Modal bind:open={showEditModal} title="Editar Equipo" onConfirm={handleEdit} confirmText="Guardar cambios">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
			{#each Object.entries(editFields) as [key, val]}
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
					<input type="text" bind:value={editFields[key]} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm" />
				</div>
			{/each}
		</div>
	</Modal>
{/if}
