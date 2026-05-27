import { writable } from 'svelte/store';

export interface ToastMessage {
	id: number;
	type: 'success' | 'error' | 'warning' | 'info';
	message: string;
}

let _id = 0;

export const toasts = writable<ToastMessage[]>([]);

export function addToast(type: ToastMessage['type'], message: string, duration = 4000) {
	const id = ++_id;
	toasts.update((t) => [...t, { id, type, message }]);
	setTimeout(() => {
		toasts.update((t) => t.filter((x) => x.id !== id));
	}, duration);
}
