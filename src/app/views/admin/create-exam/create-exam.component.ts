import {Component} from '@angular/core';
import {ExamSettingsComponent} from '../../../components/admin/exam-settings/exam-settings.component';

@Component({
  selector: 'app-create-exam',
  imports: [
    ExamSettingsComponent
  ],
  templateUrl: './create-exam.component.html',
  styleUrl: './create-exam.component.scss'
})
export class CreateExamComponent {
  settings: any = {
    name: '',
    accessCode: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    duration: '00:30:00',
    questionNumber: 30,
    passingScore: 27,
    canGoBack: true,
    isGlobalDuration: true,
    showResults: false,
  }
}
