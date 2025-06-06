import {Component, OnInit} from '@angular/core';
import {TeacherService} from '../../../services/teacher.service';
import {Router, RouterLink} from '@angular/router';
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {Message} from 'primeng/message';
import {ProgressSpinner} from 'primeng/progressspinner';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-exams',
  imports: [
    RouterLink,
    Card,
    Button,
    TableModule,
    Message,
    ProgressSpinner
  ],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.scss'
})
export class ExamsComponent implements OnInit {
  constructor(private teacherService: TeacherService, private router: Router) {
  }

  exams: any[] = [{
    loading: true,
  }]

  parseTime(time: string) {
    const date = new Date(time);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replaceAll('.', '/');
  }

  parseStatus(state: 'upcoming' | 'ongoing' | 'finished') {
    if (state === 'upcoming') return 'Oczekujący';
    if (state === 'ongoing') return 'W trakcie';
    return 'Zakończony';
  }

  ngOnInit() {
    this.teacherService.getExams().subscribe({
      next: data => {
        if (data.length === 0) {
          this.exams = [{
            loading: false,
            empty: true
          }]
          return
        }
        this.exams = data
      }
    })
  }

  openExam(exam: number) {
    this.router.navigate([`/wykladowca/egzamin/${exam}`]);
  }

  createExam() {
    this.router.navigate([`/wykladowca/egzamin/utworz`]);
  }
}
