<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { mantenimientosApi } from '$lib/api/mantenimientos';
	import { equiposApi } from '$lib/api/equipos';
	import { repuestosApi } from '$lib/api/repuestos';
	import { addToast } from '$lib/stores/toast';
	import { getErrorDetail } from '$lib/api/client';
	import type { EquipoList, RepuestoNecesario } from '$lib/types';

	let equipos = $state<EquipoList[]>([]);
	let repuestos = $state<RepuestoNecesario[]>([]);
	let todosRepuestos = $state<RepuestoNecesario[]>([]);
	let loading = $state(false);
	let showRepuestos = $state(false);

	let form = $state({
		equipo_id: $page.url.searchParams.get('equipo_id') || '',
		tipo: 'CORRECTIVO',
		titulo: '',
		descripcion: '',
		trabajo_realizado: '',
		realizado_por: '',
		estado: 'REALIZADO',
		fecha: new Date().toISOString().split('T')[0],
	});

	let repuestosUsados = $state<{ repuesto_id: string; cantidad_usada: number; observacion: string }[]>([]);

	onMount(async () => {
		try {
			const res = await equiposApi.list({ limit: 100 });
			equipos = res.data;
		} catch {
			// silent
		}
		try {
			const res = await repuestosApi.list();
			todosRepuestos = res.data;
		} catch {
			// silent
		}
		if (form.equipo_id) {
			await equipoChange();
		}
	});

	async function equipoChange() {
		if (!form.equipo_id) { repuestos = []; return; }
		try {
			const res = await mantenimientosApi.repuestosNecesarios(form.equipo_id);
			repuestos = res.data.repuestos_necesarios ?? [];
		} catch {
			repuestos = [];
		}
	}

	function addRepuesto() {
		repuestosUsados = [...repuestosUsados, { repuesto_id: '', cantidad_usada: 1, observacion: '' }];
	}

	function removeRepuesto(i: number) {
		repuestosUsados = repuestosUsados.filter((_, idx) => idx !== i);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		try {
			await mantenimientosApi.create({
				equipo_id: form.equipo_id,
				tipo: form.tipo as any,
				titulo: form.titulo,
				descripcion: form.descripcion || undefined,
				trabajo_realizado: form.trabajo_realizado || undefined,
				realizado_por: form.realizado_por || undefined,
				estado: form.estado as any,
				fecha: form.fecha,
				repuestos_usados: repuestosUsados.filter((r) => r.repuesto_id !== '').map((r) => ({
					repuesto_id: r.repuesto_id,
					cantidad_usada: r.cantidad_usada,
					observacion: r.observacion || undefined,
				})),
			});
			addToast('success', 'Mantenimiento registrado');
			goto('/admin/mantenimientos');
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-3xl mx-auto">
	<div class="flex items-center justify-between gap-2 mb-4 md:mb-6">
		<h2 class="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Nuevo Mantenimiento</h2>
		<a href="/admin/mantenimientos" class="text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">← Volver</a>
	</div>

	<form onsubmit={handleSubmit} class="space-y-4 md:space-y-6">
		<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
			<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3 md:mb-4">Datos del mantenimiento</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
				<div class="md:col-span-2">
					<label class="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Equipo *</label>
					<select bind:value={form.equipo_id} onchange={equipoChange} required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm">
						<option value="">Seleccionar equipo</option>
						{#each equipos as eq}
							<option value={eq.id}>{eq.codigo_equipo} - {eq.nombre}</option>
						{/each}
					</select>
				</div>
				<div class="md:col-span-2">
					<label class="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título *</label>
					<input type="text" bind:value={form.titulo} required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm" />
				</div>
				<div>
					<label class="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
					<select bind:value={form.tipo} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm">
						<option value="CORRECTIVO">Correctivo</option>
						<option value="PREVENTIVO">Preventivo</option>
						<option value="EMERGENCIA">Emergencia</option>
					</select>
				</div>
				<div>
					<label class="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
					<select bind:value={form.estado} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm">
						<option value="PENDIENTE">Pendiente</option>
						<option value="REALIZADO">Realizado</option>
					</select>
				</div>
				<div>
					<label class="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
					<input type="date" bind:value={form.fecha} required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm" />
				</div>
				<div>
					<label class="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Realizado por</label>
					<input type="text" bind:value={form.realizado_por} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm" placeholder="Nombre de quien realizó" />
				</div>
				<div class="md:col-span-2">
					<label class="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
					<textarea bind:value={form.descripcion} rows={3} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm"></textarea>
				</div>
				<div class="md:col-span-2">
					<label class="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Trabajo realizado</label>
					<textarea bind:value={form.trabajo_realizado} rows={3} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm"></textarea>
				</div>
			</div>
		</div>

		<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
			<div class="flex items-center justify-between gap-2 mb-3 md:mb-4">
				<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base">Repuestos utilizados</h3>
				{#if form.equipo_id}
					<button type="button" onclick={addRepuesto} class="text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">+ Agregar</button>
				{/if}
			</div>
			{#if repuestos.length > 0}
				<div class="text-xs md:text-sm text-green-600 dark:text-green-400 mb-3 bg-green-50 dark:bg-green-900/20 p-2 md:p-3 rounded-lg">
					Hay {repuestos.length} repuestos necesarios para este equipo
				</div>
			{/if}
			{#each repuestosUsados as ru, i}
				<div class="flex gap-2 md:gap-3 items-end mb-2 md:mb-3">
					<div class="flex-1 min-w-0">
						<select bind:value={ru.repuesto_id} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm">
							<option value="">Seleccionar</option>
							{#each todosRepuestos as r}
								<option value={r.id}>{r.codigo_repuesto} - {r.descripcion}</option>
							{/each}
						</select>
						{#if ru.repuesto_id}
							{@const selected = todosRepuestos.find(r => r.id === ru.repuesto_id)}
							{#if selected}
								<p class="text-xs text-blue-600 dark:text-blue-400 mt-1">{selected.codigo_repuesto} - {selected.descripcion}</p>
							{/if}
						{/if}
					</div>
					<div class="w-20 md:w-24 shrink-0">
						<input type="number" bind:value={ru.cantidad_usada} min="1" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm" placeholder="Cant." />
					</div>
					<button type="button" onclick={() => removeRepuesto(i)} class="text-red-500 hover:text-red-700 text-lg leading-none shrink-0">&times;</button>
				</div>
			{/each}
			{#if repuestosUsados.length === 0}
				<p class="text-xs md:text-sm text-slate-400 dark:text-slate-500">No se registraron repuestos</p>
			{/if}
		</div>

		<div class="flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3">
			<a href="/admin/mantenimientos" class="text-center px-4 md:px-6 py-2 md:py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs md:text-sm font-medium rounded-lg">Cancelar</a>
			<button type="submit" disabled={loading} class="px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs md:text-sm font-medium rounded-lg">
				{loading ? 'Guardando...' : 'Registrar Mantenimiento'}
			</button>
		</div>
	</form>
</div>
