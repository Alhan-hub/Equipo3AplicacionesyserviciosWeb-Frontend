import { Routes } from '@angular/router';
import { MiembrosComponent } from './pages/miembros/miembros.component';

export const routes: Routes = [
  { path: '', redirectTo: 'miembros', pathMatch: 'full' },
  { path: 'miembros', component: MiembrosComponent },
  { path: '**', redirectTo: 'miembros' }
];