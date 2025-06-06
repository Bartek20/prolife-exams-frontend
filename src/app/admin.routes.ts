import {Routes} from '@angular/router';
import {AuthorizeComponent} from './views/admin/authorize/authorize.component';
import {ExamsComponent} from './views/admin/exams/exams.component';
import {CreateExamComponent} from './views/admin/create-exam/create-exam.component';
import {ExamComponent} from './views/admin/exam/exam.component';
import {ResponseComponent} from './views/admin/response/response.component';
import {DashboardComponent} from './views/admin/dashboard/dashboard.component';
import {ResultsComponent} from './views/results/results.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'logowanie',
    component: AuthorizeComponent
  },
  {
    path: 'egzaminy',
    component: ExamsComponent
  },
  {
    path: 'egzamin/utworz',
    component: CreateExamComponent,
  },
  {
    path: 'egzamin/:examId',
    component: ExamComponent
  },
  {
    path: 'egzamin/:examId/wyniki',
    component: ResultsComponent,
    data: {
      mode: 'teacher'
    }
  },
  {
    path: 'egzamin/:examId/wyniki/:uuid',
    component: ResultsComponent,
    data: {
      mode: 'teacher'
    }
  }
]
