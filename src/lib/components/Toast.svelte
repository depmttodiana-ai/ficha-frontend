<script lang="ts">
	import { toasts } from '$lib/stores/toast';
	import { fade, slide } from 'svelte/transition';
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
	{#each $toasts as toast (toast.id)}
		<div
			in:slide={{ duration: 200 }}
			out:fade={{ duration: 200 }}
			class="px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium
				{toast.type === 'success' && 'bg-green-600'}
				{toast.type === 'error' && 'bg-red-600'}
				{toast.type === 'warning' && 'bg-yellow-500 text-black'}
				{toast.type === 'info' && 'bg-blue-600'}"
		>
			{toast.message}
		</div>
	{/each}
</div>
