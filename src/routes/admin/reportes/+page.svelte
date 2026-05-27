<script lang="ts">
	import { onMount } from 'svelte';
	import { equiposApi } from '$lib/api/equipos';
	import { areasApi } from '$lib/api/areas';
	import { clasificacionesApi } from '$lib/api/clasificaciones';
	import { addToast } from '$lib/stores/toast';
	import Modal from '$lib/components/Modal.svelte';
	import type { AreaList, ClasificacionList, EquipoList } from '$lib/types';

	let areas = $state<AreaList[]>([]);
	let clasificaciones = $state<ClasificacionList[]>([]);
	let equipos = $state<EquipoList[]>([]);

	let showEquiposModal = $state(false);
	let showMantenimientosModal = $state(false);
	let formatEquipos = $state<'excel' | 'pdf'>('excel');
	let formatMantenimientos = $state<'excel' | 'pdf'>('excel');

	let eqFilters = $state({ area_id: '', clasificacion_id: '', estado: '', nivel: '' });
	let mtFilters = $state({ equipo_id: '', fecha_desde: '', fecha_hasta: '' });

	let fichaEquipoId = $state('');

	onMount(async () => {
		try {
			const [ar, cl, eq] = await Promise.all([
				areasApi.list({ limit: 100 }),
				clasificacionesApi.list({ limit: 100 }),
				equiposApi.list({ limit: 100 }),
			]);
			areas = ar.data;
			clasificaciones = cl.data;
			equipos = eq.data;
		} catch {
			// silent
		}
	});

	function descargar(tipo: string, formato: string, params: Record<string, string>) {
		const qs = new URLSearchParams();
		for (const [k, v] of Object.entries(params)) {
			if (v) qs.set(k, v);
		}
		const url = `/api/${formato}/${tipo}${qs.toString() ? '?' + qs.toString() : ''}`;
		window.open(url, '_blank');
	}

	function descargarEquipos() {
		descargar('equipos', formatEquipos, eqFilters);
		showEquiposModal = false;
	}

	function descargarMantenimientos() {
		descargar('mantenimientos', formatMantenimientos, mtFilters);
		showMantenimientosModal = false;
	}

	function descargarRepuestos(formato: string) {
		window.open(`/api/${formato}/repuestos`, '_blank');
	}

	function descargarFicha(formato: string) {
		if (!fichaEquipoId) return;
		window.open(`/api/${formato}/${fichaEquipoId}`, '_blank');
	}

	function openEquiposModal(formato: 'excel' | 'pdf') {
		formatEquipos = formato;
		showEquiposModal = true;
	}

	function openMantenimientosModal(formato: 'excel' | 'pdf') {
		formatMantenimientos = formato;
		showMantenimientosModal = true;
	}

	const estados = ['OPERATIVO', 'PARADO', 'REPARACION', 'BAJA'];
</script>

<div class="space-y-4 md:space-y-6">
	<h2 class="text-lg md:text-xl font-semibold text-slate-800">Reportes</h2>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
		<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md transition-shadow">
			<div class="text-2xl md:text-3xl mb-1 md:mb-2">📊</div>
			<h3 class="font-semibold text-slate-800 text-sm md:text-base mb-1">Equipos</h3>
			<p class="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1 mb-3 md:mb-4">Listado completo de equipos</p>
			<div class="flex gap-2">
				<button onclick={() => openEquiposModal('excel')}
					class="flex-1 text-center px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">Excel</button>
				<button onclick={() => openEquiposModal('pdf')}
					class="flex-1 text-center px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors">PDF</button>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md transition-shadow">
			<div class="text-2xl md:text-3xl mb-1 md:mb-2">📋</div>
			<h3 class="font-semibold text-slate-800 text-sm md:text-base mb-1">Mantenimientos</h3>
			<p class="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1 mb-3 md:mb-4">Historial de mantenimientos</p>
			<div class="flex gap-2">
				<button onclick={() => openMantenimientosModal('excel')}
					class="flex-1 text-center px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">Excel</button>
				<button onclick={() => openMantenimientosModal('pdf')}
					class="flex-1 text-center px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors">PDF</button>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md transition-shadow">
			<div class="text-2xl md:text-3xl mb-1 md:mb-2">🔩</div>
			<h3 class="font-semibold text-slate-800 text-sm md:text-base mb-1">Repuestos</h3>
			<p class="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1 mb-3 md:mb-4">Catálogo de repuestos</p>
			<div class="flex gap-2">
				<button onclick={() => descargarRepuestos('excel')}
					class="flex-1 text-center px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">Excel</button>
				<button onclick={() => descargarRepuestos('pdf')}
					class="flex-1 text-center px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors">PDF</button>
			</div>
		</div>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md transition-shadow">
		<div class="text-2xl md:text-3xl mb-1 md:mb-2">📝</div>
		<h3 class="font-semibold text-slate-800 text-sm md:text-base mb-1">Fichas Técnicas</h3>
		<p class="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1 mb-3 md:mb-4">Ficha técnica individual por equipo</p>
		<div class="space-y-2 mb-3">
			<select bind:value={fichaEquipoId} class="w-full rounded-lg border border-slate-300 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm">
				<option value="">Seleccionar equipo</option>
				{#each equipos as eq}
					<option value={eq.id}>{eq.codigo_equipo} - {eq.nombre}</option>
				{/each}
			</select>
		</div>
		<div class="flex gap-2">
			<button onclick={() => descargarFicha('excel')} disabled={!fichaEquipoId}
				class="flex-1 text-center px-2 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors">Excel</button>
			<button onclick={() => descargarFicha('pdf')} disabled={!fichaEquipoId}
				class="flex-1 text-center px-2 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors">PDF</button>
		</div>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
			<h3 class="font-semibold text-slate-800 text-sm md:text-base">Códigos QR</h3>
			<button
				onclick={() => window.open('/admin/qr', '_self')}
				class="px-3 md:px-4 py-1.5 md:py-2 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
			>
				Ir a Códigos QR
			</button>
		</div>
		<p class="text-xs md:text-sm text-slate-500">Visualiza y descarga códigos QR por equipo</p>
	</div>
</div>

<Modal bind:open={showEquiposModal} title={'Exportar Equipos (' + formatEquipos.toUpperCase() + ')'} onConfirm={descargarEquipos} confirmText="Descargar">
	<div class="space-y-3 md:space-y-4">
		<p class="text-xs md:text-sm text-slate-500">Filtros opcionales para el reporte</p>
		<div>
			<label class="block text-xs md:text-sm font-medium text-slate-700 mb-1">Área</label>
			<select bind:value={eqFilters.area_id} class="w-full rounded-lg border border-slate-300 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm">
				<option value="">Todas</option>
				{#each areas as a}
					<option value={a.id}>{a.nombre}</option>
				{/each}
			</select>
		</div>
		<div>
			<label class="block text-xs md:text-sm font-medium text-slate-700 mb-1">Clasificación</label>
			<select bind:value={eqFilters.clasificacion_id} class="w-full rounded-lg border border-slate-300 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm">
				<option value="">Todas</option>
				{#each clasificaciones as c}
					<option value={c.id}>{c.nombre}</option>
				{/each}
			</select>
		</div>
		<div>
			<label class="block text-xs md:text-sm font-medium text-slate-700 mb-1">Estado</label>
			<select bind:value={eqFilters.estado} class="w-full rounded-lg border border-slate-300 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm">
				<option value="">Todos</option>
				{#each estados as e}
					<option value={e}>{e}</option>
				{/each}
			</select>
		</div>
	</div>
</Modal>

<Modal bind:open={showMantenimientosModal} title={'Exportar Mantenimientos (' + formatMantenimientos.toUpperCase() + ')'} onConfirm={descargarMantenimientos} confirmText="Descargar">
	<div class="space-y-3 md:space-y-4">
		<p class="text-xs md:text-sm text-slate-500">Filtros opcionales para el reporte</p>
		<div>
			<label class="block text-xs md:text-sm font-medium text-slate-700 mb-1">Equipo</label>
			<select bind:value={mtFilters.equipo_id} class="w-full rounded-lg border border-slate-300 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm">
				<option value="">Todos</option>
				{#each equipos as eq}
					<option value={eq.id}>{eq.codigo_equipo} - {eq.nombre}</option>
				{/each}
			</select>
		</div>
		<div>
			<label class="block text-xs md:text-sm font-medium text-slate-700 mb-1">Fecha desde</label>
			<input type="date" bind:value={mtFilters.fecha_desde} class="w-full rounded-lg border border-slate-300 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm" />
		</div>
		<div>
			<label class="block text-xs md:text-sm font-medium text-slate-700 mb-1">Fecha hasta</label>
			<input type="date" bind:value={mtFilters.fecha_hasta} class="w-full rounded-lg border border-slate-300 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm" />
		</div>
	</div>
</Modal>
