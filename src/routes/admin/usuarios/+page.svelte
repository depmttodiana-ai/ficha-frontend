<script lang="ts">
	import { onMount } from 'svelte';
	import { usuariosApi } from '$lib/api/usuarios';
	import { addToast } from '$lib/stores/toast';
	import { currentUser } from '$lib/stores/auth';
	import Modal from '$lib/components/Modal.svelte';
	import { getErrorDetail } from '$lib/api/client';
	import type { UsuarioList, UsuarioRead, Rol } from '$lib/types';

	let usuarios = $state<UsuarioList[]>([]);
	let loading = $state(true);
	let showModal = $state(false);
	let editing = $state<UsuarioRead | null>(null);
	let formNombre = $state('');
	let formEmail = $state('');
	let formPassword = $state('');
	let formRol = $state<Rol>('USUARIO');
	let formActivo = $state(true);

	onMount(() => loadUsuarios());

	async function loadUsuarios() {
		loading = true;
		try {
			const res = await usuariosApi.list({ limit: 100 });
			usuarios = res.data;
		} catch {
			addToast('error', 'Error al cargar usuarios');
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		editing = null;
		formNombre = '';
		formEmail = '';
		formPassword = '';
		formRol = 'USUARIO';
		formActivo = true;
		showModal = true;
	}

	async function openEdit(id: string) {
		try {
			const res = await usuariosApi.get(id);
			editing = res.data;
			formNombre = res.data.nombre;
			formEmail = res.data.email;
			formPassword = '';
			formRol = res.data.rol;
			formActivo = res.data.activo;
			showModal = true;
		} catch {
			addToast('error', 'Error al cargar usuario');
		}
	}

	async function handleSave() {
		try {
			if (editing) {
				await usuariosApi.update(editing.id, {
					nombre: formNombre,
					email: formEmail,
					password: formPassword || undefined,
					rol: formRol,
					activo: formActivo,
				});
				addToast('success', 'Usuario actualizado');
			} else {
				await usuariosApi.create({ nombre: formNombre, email: formEmail, password: formPassword, rol: formRol });
				addToast('success', 'Usuario creado');
			}
			showModal = false;
			await loadUsuarios();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('¿Eliminar este usuario?')) return;
		try {
			await usuariosApi.delete(id);
			addToast('success', 'Usuario eliminado');
			await loadUsuarios();
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		}
	}
</script>

<div class="space-y-4 md:space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
		<h2 class="text-lg md:text-xl font-semibold text-slate-800">Usuarios</h2>
		<button onclick={openCreate} class="inline-block text-center px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
			+ Nuevo
		</button>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="min-w-[500px] w-full divide-y divide-slate-200">
				<thead class="bg-slate-50">
					<tr>
						<th class="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th>
						<th class="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
						<th class="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rol</th>
						<th class="hidden sm:table-cell px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 uppercase">Activo</th>
						<th class="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200">
					{#if loading}
						<tr><td colspan="5" class="px-2 md:px-4 py-8 md:py-12 text-center text-slate-500 text-sm">Cargando...</td></tr>
					{:else if usuarios.length === 0}
						<tr><td colspan="5" class="px-2 md:px-4 py-8 md:py-12 text-center text-slate-400 text-sm">Sin usuarios</td></tr>
					{:else}
						{#each usuarios as u}
							<tr class="hover:bg-slate-50">
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-slate-800">{u.nombre}</td>
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-600">{u.email}</td>
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
									<span class="px-1.5 md:px-2 py-0.5 rounded-full text-xs font-medium
										{u.rol === 'COORDINADOR' ? 'bg-purple-100 text-purple-800' : ''}
										{u.rol === 'SUPERVISOR' ? 'bg-blue-100 text-blue-800' : ''}
										{u.rol === 'USUARIO' ? 'bg-slate-100 text-slate-600' : ''}
									">{u.rol}</span>
								</td>
								<td class="hidden sm:table-cell px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
									<span class="{u.activo ? 'text-green-600' : 'text-red-600'}">{u.activo ? 'Sí' : 'No'}</span>
								</td>
								<td class="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm whitespace-nowrap">
									<button onclick={() => openEdit(u.id)} class="text-blue-600 hover:underline mr-2 md:mr-3">Editar</button>
									<button onclick={() => handleDelete(u.id)} class="text-red-600 hover:underline">Eliminar</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<Modal bind:open={showModal} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'} onConfirm={handleSave}>
	<div class="space-y-4">
		<div>
			<label class="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
			<input type="text" bind:value={formNombre} required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 mb-1">Email *</label>
			<input type="email" bind:value={formEmail} required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 mb-1">{editing ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
			<input type="password" bind:value={formPassword} required={!editing} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-700 mb-1">Rol</label>
			<select bind:value={formRol} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
				<option value="COORDINADOR">Coordinador</option>
				<option value="SUPERVISOR">Supervisor</option>
				<option value="USUARIO">Usuario</option>
			</select>
		</div>
		{#if editing}
			<div class="flex items-center gap-2">
				<input type="checkbox" bind:checked={formActivo} id="activo" class="rounded border-slate-300" />
				<label for="activo" class="text-sm text-slate-700">Activo</label>
			</div>
		{/if}
	</div>
</Modal>
