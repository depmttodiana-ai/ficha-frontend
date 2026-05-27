import api from './client';
import type { RepuestoNecesario } from '$lib/types';

export const repuestosApi = {
	list: () => api.get<RepuestoNecesario[]>('/repuestos/'),
};
