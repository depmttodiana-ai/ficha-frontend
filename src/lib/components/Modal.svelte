<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let {
		open = $bindable(false),
		title = '',
		showFooter = true,
		onConfirm,
		confirmText = 'Guardar',
		cancelText = 'Cancelar',
		confirmDisabled = false,
		children,
	}: {
		open: boolean;
		title?: string;
		showFooter?: boolean;
		onConfirm?: () => void;
		confirmText?: string;
		cancelText?: string;
		confirmDisabled?: boolean;
		children?: import('svelte').Snippet;
	} = $props();
</script>

{#if open}
	<div
		class="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
		onclick={() => (open = false)}
		role="presentation"
	>
		<div
			in:scale={{ duration: 150 }}
			out:fade={{ duration: 100 }}
			class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
			onclick={(e: MouseEvent) => e.stopPropagation()}
			role="dialog"
		>
			{#if title}
				<div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
					<h2 class="text-lg font-semibold text-slate-800">{title}</h2>
					<button onclick={() => (open = false)} class="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
				</div>
			{/if}

			<div class="px-6 py-4">
				{@render children?.()}
			</div>

			{#if showFooter}
				<div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
					<button
						onclick={() => (open = false)}
						class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
					>
						{cancelText}
					</button>
					<button
						onclick={onConfirm}
						disabled={confirmDisabled}
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
					>
						{confirmText}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
