import {Routes} from '@angular/router';
import {ExamInfoComponent} from './views/student/exam-info/exam-info.component';
import {StudentDataComponent} from './views/student/student-data/student-data.component';
import {QuestionsComponent} from './views/student/questions/questions.component';

export const routes: Routes = [
  {
    path: 'informacje',
    component: ExamInfoComponent,
  },
  {
    path: 'dane-osobowe',
    component: StudentDataComponent,
  },
  {
    path: 'pytania',
    component: QuestionsComponent,
  },
  {
    path: 'wyniki/:uuid',
    loadComponent: () => import('./views/results/results.component').then(m => m.ResultsComponent),
    data: {
      mode: 'student'
    }
  }
]
