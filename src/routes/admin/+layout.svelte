<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated, currentUser } from '$lib/stores/auth';

	let { children } = $props();

	onMount(() => {
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('currentUser');
		if (token && userData) {
			try {
				const user = JSON.parse(userData);
				currentUser.set(user);
				isAuthenticated.set(true);
			} catch {
				localStorage.removeItem('token');
				localStorage.removeItem('currentUser');
			}
		}
		if (!$isAuthenticated) {
			goto('/login');
		}
	});
</script>

<div class="flex h-screen bg-slate-100 dark:bg-slate-900">
	<Sidebar />
	<div class="flex-1 flex flex-col overflow-hidden md:ml-0">
		<Header />
		<main class="flex-1 overflow-y-auto p-3 md:p-6 pt-14 md:pt-6">
			{@render children()}
		</main>
	</div>
</div>
