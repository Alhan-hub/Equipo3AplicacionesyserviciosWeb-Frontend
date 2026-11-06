export interface Miembro {
  id: string; // UUID
  nombre: string;
  edad: number;
  email: string;
}

export interface MiembroPayload {
  nombre: string;
  edad: number;
  email: string;
}