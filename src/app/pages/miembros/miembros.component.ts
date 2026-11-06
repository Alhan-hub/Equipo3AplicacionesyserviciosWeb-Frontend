import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MiembroService } from '../../services/miembro.service';
import { Miembro, MiembroPayload } from '../../models/miembro.model';

@Component({
  selector: 'app-miembros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './miembros.component.html',
  styleUrl: './miembros.component.css'
})
export class MiembrosComponent implements OnInit {
  private readonly miembroService = inject(MiembroService);

  miembros: Miembro[] = [];
  filtroId = '';
  editandoId: string | null = null;

  formulario: MiembroPayload = {
    nombre: '',
    edad: 18,
    email: ''
  };

  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  ngOnInit(): void {
    this.cargarMiembros();
  }

  limpiarMensajes(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  // Operación 1: GET /miembros (Listar la colección desde el backend)
  cargarMiembros(): void {
    this.limpiarMensajes();
    this.cargando = true;
    this.miembroService.listar().subscribe({
      next: (respuesta) => {
        this.miembros = respuesta;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.miembros = [];
        this.manejarErrorHttp(err, 'No se pudo obtener la lista de miembros.');
      }
    });
  }

  // Operación 2: GET /miembros/{id} (Consultar uno por id en el backend)
  buscarPorId(): void {
    const idLimpio = this.filtroId.trim();
    if (!idLimpio) {
      this.cargarMiembros();
      return;
    }

    this.limpiarMensajes();
    this.cargando = true;
    this.miembroService.obtenerPorId(idLimpio).subscribe({
      next: (miembroEncontrado) => {
        this.miembros = [miembroEncontrado];
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.miembros = [];
        if (err.status === 404 || err.status === 422) {
          this.mensajeError = `No se encontró ningún miembro con el ID "${idLimpio}".`;
        } else {
          this.manejarErrorHttp(err, 'Error al consultar el miembro por ID.');
        }
      }
    });
  }

  limpiarFiltro(): void {
    this.filtroId = '';
    this.cargarMiembros();
  }

  // Operaciones 3 y 4: POST /miembros y PUT /miembros/{id}
  guardarMiembro(): void {
    this.limpiarMensajes();

    const payload: MiembroPayload = {
      nombre: this.formulario.nombre.trim(),
      edad: Number(this.formulario.edad),
      email: this.formulario.email.trim()
    };

    if (this.editandoId) {
      // PUT /miembros/{id}
      this.miembroService.actualizar(this.editandoId, payload).subscribe({
        next: () => {
          this.mensajeExito = 'Miembro actualizado correctamente en el backend.';
          this.cancelarEdicion();
          this.cargarMiembros();
        },
        error: (err: HttpErrorResponse) => {
          this.manejarErrorHttp(err, 'No se pudo actualizar el miembro.');
        }
      });
    } else {
      // POST /miembros
      this.miembroService.crear(payload).subscribe({
        next: () => {
          this.mensajeExito = 'Miembro creado correctamente en el backend.';
          this.cancelarEdicion();
          this.cargarMiembros();
        },
        error: (err: HttpErrorResponse) => {
          this.manejarErrorHttp(err, 'No se pudo crear el miembro.');
        }
      });
    }
  }

  seleccionarParaEditar(miembro: Miembro): void {
    this.limpiarMensajes();
    this.editandoId = miembro.id;
    this.formulario = {
      nombre: miembro.nombre,
      edad: miembro.edad,
      email: miembro.email
    };
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario = {
      nombre: '',
      edad: 18,
      email: ''
    };
  }

  // Operación 5: DELETE /miembros/{id}
  eliminarMiembro(id: string): void {
    this.limpiarMensajes();
    this.miembroService.eliminar(id).subscribe({
      next: () => {
        this.mensajeExito = 'Miembro eliminado correctamente del backend.';
        if (this.editandoId === id) {
          this.cancelarEdicion();
        }
        this.cargarMiembros();
      },
      error: (err: HttpErrorResponse) => {
        this.manejarErrorHttp(err, 'No se pudo eliminar el miembro.');
      }
    });
  }

  private manejarErrorHttp(err: HttpErrorResponse, mensajePorDefecto: string): void {
    if (err.status === 0) {
      this.mensajeError =
        'No hubo conexión con el backend (http://localhost:8000). Verifique que la API FastAPI esté encendida.';
      return;
    }
    if (err.error && typeof err.error.detail === 'string') {
      this.mensajeError = err.error.detail;
      return;
    }
    if (err.status === 422) {
      this.mensajeError =
        'Datos inválidos: verifique que el nombre tenga entre 2 y 120 caracteres, la edad entre 14 y 100, y el email entre 5 y 254 caracteres.';
      return;
    }
    this.mensajeError = mensajePorDefecto;
  }
}