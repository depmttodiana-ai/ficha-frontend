import { writable } from 'svelte/store';

function getInitialTheme(): boolean {
	if (typeof window === 'undefined') return false;
	const stored = localStorage.getItem('theme');
	if (stored) return stored === 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const isDark = writable<boolean>(getInitialTheme());

isDark.subscribe((val) => {
	if (typeof window === 'undefined') return;
	if (val) {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
	localStorage.setItem('theme', val ? 'dark' : 'light');
});

export function toggleTheme() {
	isDark.update((v) => !v);
}
