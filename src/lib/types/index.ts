// === Auth ===
export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	nombre: string;
	email: string;
	password: string;
}

export interface TokenResponse {
	access_token: string;
	token_type: string;
	usuario: UsuarioRead;
}

// === Usuarios ===
export type Rol = 'COORDINADOR' | 'SUPERVISOR' | 'USUARIO';

export interface UsuarioRead {
	id: string;
	nombre: string;
	email: string;
	rol: Rol;
	activo: boolean;
	created_at: string;
}

export interface UsuarioList {
	id: string;
	nombre: string;
	email: string;
	rol: Rol;
	activo: boolean;
}

export interface UsuarioCreate {
	nombre: string;
	email: string;
	password: string;
	rol: Rol;
}

export interface UsuarioUpdate {
	nombre?: string;
	email?: string;
	password?: string;
	rol?: Rol;
	activo?: boolean;
}

// === Áreas ===
export interface AreaCreate {
	nombre: string;
	codigo?: string;
	descripcion?: string;
}

export interface AreaUpdate {
	nombre?: string;
	codigo?: string;
	descripcion?: string;
}

export interface AreaList {
	id: string;
	nombre: string;
	codigo: string | null;
}

export interface AreaRead extends AreaList {
	descripcion: string | null;
	created_at: string;
	updated_at: string;
}

// === Clasificaciones ===
export interface ClasificacionCreate {
	nombre: string;
	descripcion?: string;
}

export interface ClasificacionUpdate {
	nombre?: string;
	descripcion?: string;
}

export interface ClasificacionList {
	id: string;
	nombre: string;
}

export interface ClasificacionRead extends ClasificacionList {
	descripcion: string | null;
	created_at: string;
	updated_at: string;
}

// === Equipos ===
export type EstadoEquipo = 'OPERATIVO' | 'PARADO' | 'REPARACION' | 'BAJA';
export type TipoFoto = 'PLACA' | 'GENERAL' | 'FALLA' | 'DETALLE';

export interface RepuestoNecesario {
	id: string;
	codigo_repuesto: string;
	descripcion: string;
	para_que: string | null;
	ubicacion: string | null;
	cantidad_necesaria: number | null;
	observaciones: string | null;
}

export interface FotoEquipo {
	id: string;
	url: string;
	tipo: TipoFoto;
	equipo_id: string;
}

export interface EquipoList {
	id: string;
	codigo_equipo: string;
	nombre: string;
	marca: string | null;
	modelo: string | null;
	numero_serie: string | null;
	nombre_area: string | null;
	nombre_clasificacion: string | null;
	estado: EstadoEquipo;
	nivel: number;
	created_at: string;
}

export interface EquipoRead {
	id: string;
	codigo_equipo: string;
	nombre: string;
	descripcion: string | null;
	nivel: number;
	equipo_padre_id: string | null;
	area_id: string | null;
	nombre_area: string | null;
	clasificacion_id: string | null;
	nombre_clasificacion: string | null;
	marca: string | null;
	modelo: string | null;
	numero_serie: string | null;
	potencia: string | null;
	voltaje: string | null;
	rpm: string | null;
	capacidad: string | null;
	anio_fabricacion: number | null;
	proveedor: string | null;
	fecha_adquisicion: string | null;
	estado: EstadoEquipo;
	motivo_estado: string | null;
	observaciones: string | null;
	created_at: string;
	updated_at: string;
	sub_equipos: EquipoList[];
	fotos: FotoEquipo[];
	repuestos_necesarios: RepuestoNecesario[];
}

export interface EquipoArbolRead extends EquipoRead {
	hijos: EquipoArbolRead[];
}

export interface EquipoCreateForm {
	codigo_equipo: string;
	nombre: string;
	descripcion?: string;
	clasificacion_id?: string;
	equipo_padre_id?: string;
	area_id?: string;
	marca?: string;
	modelo?: string;
	numero_serie?: string;
	potencia?: string;
	voltaje?: string;
	rpm?: string;
	capacidad?: string;
	anio_fabricacion?: number;
	proveedor?: string;
	fecha_adquisicion?: string;
	estado?: EstadoEquipo;
	motivo_estado?: string;
	observaciones?: string;
	repuestos_necesarios?: string;
}

export interface EstadoUpdate {
	estado: EstadoEquipo;
	motivo_estado?: string;
}

// === Mantenimientos ===
export type TipoMantenimiento = 'CORRECTIVO' | 'PREVENTIVO' | 'EMERGENCIA';
export type EstadoMantenimiento = 'PENDIENTE' | 'REALIZADO';

export interface RepuestoUsado {
	repuesto_id: string;
	cantidad_usada: number;
	observacion?: string;
}

export interface MantenimientoCreate {
	equipo_id: string;
	tipo: TipoMantenimiento;
	titulo: string;
	descripcion?: string;
	trabajo_realizado?: string;
	estado?: EstadoMantenimiento;
	fecha: string;
	repuestos_usados?: RepuestoUsado[];
}

export interface MantenimientoRead {
	id: string;
	equipo_id: string;
	equipo_nombre: string;
	tipo: TipoMantenimiento;
	titulo: string;
	descripcion: string | null;
	trabajo_realizado: string | null;
	estado: EstadoMantenimiento;
	fecha: string;
	usuario_id: string;
	usuario_nombre: string;
	created_at: string;
	updated_at: string;
	repuestos_usados: RepuestoUsado[];
}

export interface MantenimientoList {
	id: string;
	equipo_id: string;
	equipo_nombre: string;
	tipo: TipoMantenimiento;
	titulo: string;
	estado: EstadoMantenimiento;
	fecha: string;
	usuario_nombre: string;
}

export interface MantenimientoUpdate {
	tipo?: TipoMantenimiento;
	titulo?: string;
	descripcion?: string;
	trabajo_realizado?: string;
	estado?: EstadoMantenimiento;
	fecha?: string;
	repuestos_usados?: RepuestoUsado[];
}

// === Historial ===
export interface HistorialRead {
	id: string;
	equipo_id: string;
	campo: string;
	valor_anterior: string | null;
	valor_nuevo: string | null;
	usuario_nombre: string;
	created_at: string;
}

// === Pagination ===
export interface PaginationQuery {
	skip?: number;
	limit?: number;
}
