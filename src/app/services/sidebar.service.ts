import { Injectable } from '@angular/core';
import {ExamService} from './exam.service';
import {StorageService} from './storage.service';
import {ResultsService} from './results.service';
import {TeacherService} from './teacher.service';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  sidebarMode: 'empty' | 'exam' | 'results' = 'empty';

  constructor(
    private examService: ExamService,
    private teacherService: TeacherService,
    private resultsService: ResultsService,
    private storage: StorageService
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
    logout: () => this.teacherService.logout().subscribe()
  }
}
