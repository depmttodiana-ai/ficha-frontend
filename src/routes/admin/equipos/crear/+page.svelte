<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { equiposApi } from '$lib/api/equipos';
	import { areasApi } from '$lib/api/areas';
	import { clasificacionesApi } from '$lib/api/clasificaciones';
	import { addToast } from '$lib/stores/toast';
	import type { AreaList, ClasificacionList, EquipoList } from '$lib/types';

	let areas = $state<AreaList[]>([]);
	let clasificaciones = $state<ClasificacionList[]>([]);
	let equiposPadre = $state<EquipoList[]>([]);
	let loading = $state(false);
	let fotoPreviews = $state<string[]>([]);

	let form = $state({
		codigo_equipo: '',
		nombre: '',
		descripcion: '',
		clasificacion_id: '',
		equipo_padre_id: '',
		area_id: '',
		marca: '',
		modelo: '',
		numero_serie: '',
		potencia: '',
		voltaje: '',
		rpm: '',
		capacidad: '',
		anio_fabricacion: '',
		proveedor: '',
		fecha_adquisicion: '',
		estado: 'OPERATIVO',
		motivo_estado: '',
		observaciones: '',
	});

	let fotos: File[] = $state([]);
	let tiposFoto: string[] = $state([]);

	onMount(async () => {
		try {
			const [areaRes, clasifRes, padresRes] = await Promise.all([
				areasApi.list({ limit: 100 }),
				clasificacionesApi.list({ limit: 100 }),
				equiposApi.raices(),
			]);
			areas = areaRes.data;
			clasificaciones = clasifRes.data;
			equiposPadre = padresRes.data;
		} catch {
			// silent
		}
	});

	function handleFotoChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files) return;
		const remaining = 5 - fotos.length;
		const newFotos = Array.from(input.files).slice(0, remaining);
		if (newFotos.length === 0) return;
		fotos = [...fotos, ...newFotos];
		tiposFoto = [...tiposFoto, ...newFotos.map(() => 'GENERAL')];
		fotoPreviews = [...fotoPreviews, ...newFotos.map((f) => URL.createObjectURL(f))];
	}

	function removeFoto(i: number) {
		fotos = fotos.filter((_, idx) => idx !== i);
		tiposFoto = tiposFoto.filter((_, idx) => idx !== i);
		fotoPreviews = fotoPreviews.filter((_, idx) => idx !== i);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		try {
			const fd = new FormData();
			fd.append('codigo_equipo', form.codigo_equipo);
			fd.append('nombre', form.nombre);
			if (form.descripcion) fd.append('descripcion', form.descripcion);
			if (form.clasificacion_id) fd.append('clasificacion_id', form.clasificacion_id);
			if (form.equipo_padre_id) fd.append('equipo_padre_id', form.equipo_padre_id);
			if (form.area_id) fd.append('area_id', form.area_id);
			if (form.marca) fd.append('marca', form.marca);
			if (form.modelo) fd.append('modelo', form.modelo);
			if (form.numero_serie) fd.append('numero_serie', form.numero_serie);
			if (form.potencia) fd.append('potencia', form.potencia);
			if (form.voltaje) fd.append('voltaje', form.voltaje);
			if (form.rpm) fd.append('rpm', form.rpm);
			if (form.capacidad) fd.append('capacidad', form.capacidad);
			if (form.anio_fabricacion) fd.append('anio_fabricacion', form.anio_fabricacion);
			if (form.proveedor) fd.append('proveedor', form.proveedor);
			if (form.fecha_adquisicion) fd.append('fecha_adquisicion', form.fecha_adquisicion);
			fd.append('estado', form.estado);
			if (form.motivo_estado) fd.append('motivo_estado', form.motivo_estado);
			if (form.observaciones) fd.append('observaciones', form.observaciones);

			fotos.forEach((f, i) => {
				fd.append(`foto${i + 1}`, f);
				fd.append(`tipo_foto${i + 1}`, tiposFoto[i]);
			});

			const res = await equiposApi.create(fd);
			addToast('success', 'Equipo creado exitosamente');
			goto(`/admin/equipos/${res.data.id}`);
		} catch (err: any) {
			const detail = err.response?.data?.detail;
			let msg = 'Error al crear equipo';
			if (Array.isArray(detail)) {
				msg = detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join(', ');
			} else if (typeof detail === 'string') {
				msg = detail;
			}
			addToast('error', msg);
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-4xl mx-auto">
	<div class="flex items-center justify-between mb-4 md:mb-6">
		<h2 class="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Nuevo Equipo</h2>
		<a href="/admin/equipos" class="text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:underline">← Volver</a>
	</div>

	<form onsubmit={handleSubmit} class="space-y-4 md:space-y-6">
		<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
			<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3 md:mb-4">Información básica</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código *</label>
					<input type="text" bind:value={form.codigo_equipo} required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" />
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
					<input type="text" bind:value={form.nombre} required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" />
				</div>
				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
					<textarea bind:value={form.descripcion} rows={2} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm"></textarea>
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Área</label>
					<select bind:value={form.area_id} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm">
						<option value="">Sin área</option>
						{#each areas as a}
							<option value={a.id}>{a.nombre}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Clasificación</label>
					<select bind:value={form.clasificacion_id} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm">
						<option value="">Sin clasificación</option>
						{#each clasificaciones as c}
							<option value={c.id}>{c.nombre}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Equipo padre</label>
					<select bind:value={form.equipo_padre_id} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm">
						<option value="">Sin padre (nivel 1)</option>
						{#each equiposPadre as ep}
							<option value={ep.id}>{ep.codigo_equipo} - {ep.nombre}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
					<select bind:value={form.estado} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm">
						<option value="OPERATIVO">Operativo</option>
						<option value="PARADO">Parado</option>
						<option value="REPARACION">Reparación</option>
						<option value="BAJA">Baja</option>
					</select>
				</div>
			</div>
		</div>

		<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
			<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3 md:mb-4">Especificaciones técnicas</h3>
			<div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
				<div class="col-span-2 md:col-span-1"><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Marca</label><input type="text" bind:value={form.marca} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" /></div>
				<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Modelo</label><input type="text" bind:value={form.modelo} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" /></div>
				<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">N° Serie</label><input type="text" bind:value={form.numero_serie} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" /></div>
				<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Potencia</label><input type="text" bind:value={form.potencia} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" /></div>
				<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Voltaje</label><input type="text" bind:value={form.voltaje} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" /></div>
				<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">RPM</label><input type="text" bind:value={form.rpm} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" /></div>
				<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacidad</label><input type="text" bind:value={form.capacidad} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" /></div>
				<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Año</label><input type="number" bind:value={form.anio_fabricacion} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" /></div>
				<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proveedor</label><input type="text" bind:value={form.proveedor} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" /></div>
				<div class="col-span-2 md:col-span-1"><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha adq.</label><input type="date" bind:value={form.fecha_adquisicion} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm" /></div>
			</div>
		</div>

		<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
			<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3 md:mb-4">Fotos (máx 5)</h3>
			<input type="file" accept="image/*" multiple onchange={handleFotoChange} class="text-sm w-full dark:text-slate-300" />
			{#if fotoPreviews.length > 0}
				<div class="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 mt-3">
					{#each fotoPreviews as preview, i}
						<div class="relative">
							<img src={preview} alt="Foto" class="w-full h-16 md:h-24 object-cover rounded-lg border dark:border-slate-600" />
							<select bind:value={tiposFoto[i]} class="w-full mt-1 text-xs rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-1 py-1">
								<option value="GENERAL">General</option>
								<option value="PLACA">Placa</option>
								<option value="FALLA">Falla</option>
								<option value="DETALLE">Detalle</option>
							</select>
							<button type="button" onclick={() => removeFoto(i)} class="absolute -top-1.5 -right-1.5 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">&times;</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
			<h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-3 md:mb-4">Observaciones</h3>
			<textarea bind:value={form.observaciones} rows={3} class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2.5 text-sm"></textarea>
		</div>

		<div class="flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
			<a href="/admin/equipos" class="w-full sm:w-auto text-center px-6 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors">Cancelar</a>
			<button type="submit" disabled={loading} class="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
				{loading ? 'Guardando...' : 'Crear Equipo'}
			</button>
		</div>
	</form>
</div>
