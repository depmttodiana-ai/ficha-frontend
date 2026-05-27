import { writable } from 'svelte/store';
import Cookies from 'js-cookie';
import type { UsuarioRead } from '$lib/types';

export const currentUser = writable<UsuarioRead | null>(null);
export const isAuthenticated = writable<boolean>(false);

const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';

function saveToken(token: string) {
	localStorage.setItem(TOKEN_KEY, token);
	Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
}

function removeToken() {
	localStorage.removeItem(TOKEN_KEY);
	Cookies.remove(TOKEN_KEY);
}

export function setAuth(user: UsuarioRead, token: string) {
	saveToken(token);
	localStorage.setItem(USER_KEY, JSON.stringify(user));
	currentUser.set(user);
	isAuthenticated.set(true);
}

export function clearAuth() {
	removeToken();
	localStorage.removeItem(USER_KEY);
	currentUser.set(null);
	isAuthenticated.set(false);
}

export function getToken(): string | null {
	if (typeof window === 'undefined') return null;
	const token = localStorage.getItem(TOKEN_KEY);
	if (token) return token;
	return Cookies.get(TOKEN_KEY) ?? null;
}
