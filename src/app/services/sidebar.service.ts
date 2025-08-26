import { Injectable } from '@angular/core';
import {ExamService} from './exam.service';
import {TeacherService} from './teacher.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  sidebarMode: 'empty' | 'exam' | 'results' | 'teacher.home' | 'teacher.exam' | 'teacher.results' = 'empty';

  constructor(
    private router: Router,
    private examService: ExamService,
    private teacherService: TeacherService,
  ) {}

  empty = {}
  exam = {
    changeQuestion: (idx: number) => this.examService.changeQuestion.emit(idx)
  }
  results = {
    scrollTo(target: 'result' | number) {
      const element = target === 'result' ?
        document.querySelector('app-results app-result p-card > div') :
        document.querySelector(`app-question:nth-of-type(${target + 1}) p-panel > div`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }
  teacher = {
    exams: () => this.router.navigate(['/wykladowca/egzaminy']),
    certificates: () => this.router.navigate(['/wykladowca/certyfikacja']),
    exam: {
      settings: () => {
        const element = document.querySelector('app-exam-settings p-card > div');
        element?.scrollIntoView({ behavior: 'smooth' });
      },
      stats: () => {
        const element = document.querySelector('app-usage-chart p-card > div');
        element?.scrollIntoView({ behavior: 'smooth' });
      },
      responses: () => {
        const element = document.querySelector('app-usage-chart + p-card > div');
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    logout: () => this.teacherService.logout().subscribe()
  }
}
