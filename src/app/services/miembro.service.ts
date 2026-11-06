import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Miembro, MiembroPayload } from '../models/miembro.model';

@Injectable({
  providedIn: 'root'
})
export class MiembroService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${API_CONFIG.baseUrl}/miembros`;

  // 1. Listar la colección: GET /miembros
  listar(): Observable<Miembro[]> {
    return this.http.get<Miembro[]>(this.resourceUrl);
  }

  // 2. Consultar uno por id: GET /miembros/{id}
  obtenerPorId(id: string): Observable<Miembro> {
    return this.http.get<Miembro>(`${this.resourceUrl}/${id}`);
  }

  // 3. Crear: POST /miembros
  crear(datos: MiembroPayload): Observable<Miembro> {
    return this.http.post<Miembro>(this.resourceUrl, datos);
  }

  // 4. Editar: PUT /miembros/{id}
  actualizar(id: string, datos: MiembroPayload): Observable<Miembro> {
    return this.http.put<Miembro>(`${this.resourceUrl}/${id}`, datos);
  }

  // 5. Eliminar: DELETE /miembros/{id}
  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}