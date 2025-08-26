import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TeacherService} from '../../../services/teacher.service';
import {ExamSettingsComponent} from '../../../components/admin/exam-settings/exam-settings.component';
import {UsageChartComponent} from '../../../components/admin/usage-chart/usage-chart.component';
import {Card} from 'primeng/card';
import {SelectButton, SelectButtonChangeEvent} from 'primeng/selectbutton';
import {FormsModule} from '@angular/forms';
import {Badge} from 'primeng/badge';
import {TableModule} from 'primeng/table';
import {Button} from 'primeng/button';
import {ProgressSpinner} from 'primeng/progressspinner';
import {Message} from 'primeng/message';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-exam',
  imports: [
    ExamSettingsComponent,
    UsageChartComponent,
    Card,
    SelectButton,
    FormsModule,
    Badge,
    TableModule,
    Button,
    ProgressSpinner,
    Message,
    ConfirmDialog,
    DatePipe
  ],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.scss'
})
export class ExamComponent implements OnInit {
  @Input() examId!: number;
  loading = true;
  examConfig: any;

  responsesMode: 'normal' | 'trash' = 'normal';
  responsesCounts = {
    normal: 0,
    trash: 0
  }
  responsesData: any[] = [
    {
      loading: true,
      empty: false,
    }
  ]

  constructor(private router: Router, private teacherService: TeacherService, private confirmService: ConfirmationService) {}

  getExam() {
    this.teacherService.getExam(this.examId).subscribe({
      next: data => {
        const startDate = new Date(data.start_time);
        const endDate = data.end_time ? new Date(data.end_time) : '';
        this.examConfig = {
          name: data.name,
          accessCode: data.access_code,
          startDate: startDate,
          startTime: startDate,
          endDate: endDate,
          endTime: endDate,
          duration: data.duration,
          questionNumber: data.question_number,
          passingScore: data.passing_score,
          canGoBack: data.can_go_back,
          isGlobalDuration: data.is_global_duration,
          showResults: data.show_results,
        };
        this.responsesCounts.normal = data.responses;
        this.responsesCounts.trash = data.trashed_responses;
        this.loading = false;
      },
      error: () => {
        this.router.navigate(['/wykladowca/egzaminy']);
      }
    })
  }

  ngOnInit() {
    this.getExam();
    this.getResponses();
  }

  changeResponsesMode(event: SelectButtonChangeEvent) {
    this.responsesMode = event.value;
    this.getResponses();
  }
  responsesPage = 0;
  getResponses() {
    this.responsesData = [
      {
        loading: true,
        empty: false,
      }
    ]
    this.responsesPage = 0
    this.teacherService.getResponses(this.examId, this.responsesMode === 'trash').subscribe({
      next: data => {
        if (data.length === 0) {
          this.responsesData = [{
            loading: false,
            empty: true,
          }]
          return
        }
        this.responsesData = data;
      },
      error: () => {
        this.router.navigate(['/wykladowca/egzaminy']);
      }
    })
  }
  getRemovalText(date: string | Date) {
    date = new Date(date);
    date = new Date(date.getTime() + 15552000000);
    const diffInTime = date.getTime() - Date.now();
    const diffInDays = Math.round(diffInTime / 86400000);
    if (diffInDays == 1) {
      return diffInDays + ' dzień';
    }
    return diffInDays + ' dni';
  }

  showResponse(uuid: string) {
    this.router.navigate([`/wykladowca/egzamin/${this.examId}/wyniki/${uuid}`]);
  }

  deleteResponse(uuid: string) {
    this.confirmService.confirm({
      key: 'confirmDialog',
      header: this.responsesMode == 'normal' ? 'Usuwanie odpowiedzi' : 'Trwałe usuwanie odpowiedzi',
      message: this.responsesMode == 'normal' ? 'Czy na pewno chcesz usunąć odpowiedź?' : 'Czy na pewno chcesz usunąć odpowiedź?<br />Nie będzie można jej przywrócić.',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.teacherService.removeResponse(this.examId, uuid).subscribe({
          next: () => {
            if (this.responsesMode === 'trash') {
              this.responsesCounts.trash--
            }
            else {
              this.responsesCounts.normal--
              this.responsesCounts.trash++
            }
            this.getResponses();
          },
        })
      },
      rejectButtonProps: {
        label: 'Anuluj',
        icon: 'pi pi-times',
        outlined: true,
        size: 'small',
        severity: 'secondary'
      },
      acceptButtonProps: {
        label: 'Usuń',
        icon: 'pi pi-trash',
        size: 'small',
        severity: 'danger'
      },
    })

  }
  restoreResponse(uuid: string) {
    this.teacherService.restoreResponse(this.examId, uuid).subscribe({
      next: () => {
        this.responsesCounts.trash--
        this.responsesCounts.normal++
        this.getResponses();
      }
    })
  }
}


