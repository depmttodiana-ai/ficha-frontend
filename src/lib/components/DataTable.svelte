<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		columns = [],
		data = [],
		loading = false,
		onRowClick,
		emptyMessage = 'No hay registros',
	}: {
		columns: { key: string; label: string; render?: (item: any) => string }[];
		data: any[];
		loading?: boolean;
		onRowClick?: (item: any) => void;
		emptyMessage?: string;
	} = $props();
</script>

<div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
	<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
		<thead class="bg-slate-50 dark:bg-slate-700">
			<tr>
				{#each columns as col}
					<th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
						{col.label}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
			{#if loading}
				<tr>
					<td colspan={columns.length} class="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
						<div class="flex items-center justify-center gap-2">
							<div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
							Cargando...
						</div>
					</td>
				</tr>
			{:else if data.length === 0}
				<tr>
					<td colspan={columns.length} class="px-4 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
						{emptyMessage}
					</td>
				</tr>
			{:else}
				{#each data as item, i}
					<tr
						in:fade={{ duration: 150, delay: i * 30 }}
						onclick={() => onRowClick?.(item)}
						class="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors {onRowClick ? 'cursor-pointer' : ''}"
					>
						{#each columns as col}
							<td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">
								{col.render ? col.render(item) : item[col.key] ?? '—'}
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
