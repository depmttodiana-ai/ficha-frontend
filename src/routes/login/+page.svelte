<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authApi } from '$lib/api/auth';
	import { setAuth, isAuthenticated, currentUser } from '$lib/stores/auth';
	import { addToast } from '$lib/stores/toast';
	import { getErrorDetail } from '$lib/api/client';

	let email = $state('');
	let password = $state('');
	let nombre = $state('');
	let loading = $state(false);
	let isRegister = $state(false);

	onMount(() => {
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('currentUser');
		if (token && userData) {
			try {
				const user = JSON.parse(userData);
				currentUser.set(user);
				isAuthenticated.set(true);
				goto('/admin');
			} catch {
				localStorage.removeItem('token');
				localStorage.removeItem('currentUser');
			}
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		try {
			if (isRegister) {
				await authApi.register({ nombre, email, password });
				addToast('success', 'Registro exitoso. Inicia sesión.');
				isRegister = false;
				password = '';
			} else {
				const res = await authApi.login({ email, password });
				setAuth(res.data.usuario, res.data.access_token);
				addToast('success', `Bienvenido, ${res.data.usuario.nombre}`);
				goto('/admin');
			}
		} catch (err: any) {
			addToast('error', getErrorDetail(err));
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
	<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Ficha Técnica</h1>
			<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-5">
			{#if isRegister}
				<div>
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
					<input
						type="text"
						bind:value={nombre}
						required
						class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			{/if}

			<div>
				<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
				<input
					type="email"
					bind:value={email}
					required
					class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
				<input
					type="password"
					bind:value={password}
					required
					class="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm"
			>
				{loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Iniciar sesión'}
			</button>
		</form>

		<div class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
			{isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
			<button
				onclick={() => { isRegister = !isRegister; password = ''; }}
				class="text-blue-600 dark:text-blue-400 hover:underline ml-1 font-medium"
			>
				{isRegister ? 'Inicia sesión' : 'Regístrate'}
			</button>
		</div>
	</div>
</div>
