<script lang="ts">
	let { status = '', size = 'sm' as 'sm' | 'md' | 'lg' } = $props();

	const sizeClasses = { sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm', lg: 'px-4 py-1.5 text-base' };

	function color(): string {
		const s = status.toUpperCase();
		if (['OPERATIVO', 'REALIZADO'].includes(s)) return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
		if (['PARADO', 'PENDIENTE'].includes(s)) return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300';
		if (['REPARACION'].includes(s)) return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';
		if (['BAJA'].includes(s)) return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300';
		return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
	}

	function display(): string {
		return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
	}
</script>

<span class="inline-flex items-center rounded-full font-medium {sizeClasses[size]} {color()}">{display()}</span>
