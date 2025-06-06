import {Component, HostBinding} from '@angular/core';
import {TeacherService} from '../../../services/teacher.service';
import {ExamService} from '../../../services/exam.service';
import {ResultsService} from '../../../services/results.service';
import {StorageService} from '../../../services/storage.service';
import {SidebarService} from '../../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @HostBinding('class.open')
  isOpen = false;

  constructor(
    protected sidebarService: SidebarService,
    protected storage: StorageService,
    protected examService: ExamService,
    protected teacherService: TeacherService,
    protected resultsService: ResultsService) {
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
