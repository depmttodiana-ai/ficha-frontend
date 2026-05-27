<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Toast from '$lib/components/Toast.svelte';
	import { currentUser, isAuthenticated, setAuth, clearAuth } from '$lib/stores/auth';
	import { authApi } from '$lib/api/auth';
	import { onMount } from 'svelte';
	import Cookies from 'js-cookie';

	let { children } = $props();

	onMount(async () => {
		const token = Cookies.get('token');
		if (token) {
			try {
				const res = await authApi.me();
				setAuth(res.data, token);
			} catch {
				clearAuth();
			}
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toast />
{@render children()}
