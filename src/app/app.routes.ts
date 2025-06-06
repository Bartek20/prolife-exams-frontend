import {Routes} from '@angular/router';

import {ExamGuard} from './services/exam.guard';
import {TeacherGuard} from './services/teacher.guard';

import {AccessCodeComponent} from './views/student/access-code/access-code.component';

import {TemperErrorComponent} from './views/temper-error/temper-error.component';
import {MaintenanceComponent} from './views/maintenance/maintenance.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/kod-dostepu',
    pathMatch: 'full',
  },
  {
    path: 'kod-dostepu',
    component: AccessCodeComponent,
    canActivate: [ExamGuard],
  },
  {
    path: 'kod-dostepu/:access_code',
    component: AccessCodeComponent,
    canActivate: [ExamGuard],
  },
  {
    'path': 'egzamin',
    loadChildren: () => import('./exam.routes').then(m => m.routes),
    canActivate: [ExamGuard],
  },
  {
    path: 'wykladowca',
    loadChildren: () => import('./admin.routes').then(m => m.routes),
    canActivate: [TeacherGuard],
  },
  {
    path: 'niekompatybilna-przegladarka',
    component: TemperErrorComponent,
  },
  {
    path: 'serwis-niedostepny',
    component: MaintenanceComponent
  },
  {
    path: '**',
    redirectTo: '/kod-dostepu',
    pathMatch: "full"
  }
];
