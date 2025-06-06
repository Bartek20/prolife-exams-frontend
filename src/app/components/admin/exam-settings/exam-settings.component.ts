import {Component, Input, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Card} from 'primeng/card';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {Button} from 'primeng/button';
import {DatePicker} from 'primeng/datepicker';
import {InputMask} from 'primeng/inputmask';
import {InputNumber} from 'primeng/inputnumber';
import {ToggleButton} from 'primeng/togglebutton';
import {SelectButton} from 'primeng/selectbutton';
import {copyToClipboard} from '../../../utils/clipboard';
import {Router} from '@angular/router';
import {Message} from 'primeng/message';
import {TeacherService} from '../../../services/teacher.service';

@Component({
  selector: 'app-exam-settings',
  imports: [
    FormsModule,
    Card,
    FloatLabel,
    InputText,
    InputGroup,
    InputGroupAddon,
    Button,
    DatePicker,
    InputMask,
    InputNumber,
    SelectButton,
    Message
  ],
  templateUrl: './exam-settings.component.html',
  styleUrl: './exam-settings.component.scss'
})
export class ExamSettingsComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() examId: number = 0;

  @Input() settings!: {
    name: string,
    accessCode: string,
    startDate: Date,
    startTime: Date,
    endDate: Date,
    endTime: Date,
    duration: string,
    questionNumber: number,
    passingScore: number,
    canGoBack: boolean,
    isGlobalDuration: boolean,
    showResults: boolean
  }

  constructor(private router: Router, private teacherService: TeacherService) {}

  generateAccessCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 16; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    this.settings.accessCode = result
  }

  ngOnInit() {
    if (this.mode === 'create') {
      this.generateAccessCode();
      const startDate = new Date();
      startDate.setMinutes(startDate.getMinutes() + 15);
      const endDate = new Date();
      endDate.setHours(endDate.getHours() + 1);
      endDate.setMinutes(endDate.getMinutes() + 15);
      this.settings.startDate = startDate;
      this.settings.startTime = startDate;
      this.settings.endDate = endDate;
      this.settings.endTime = endDate;
    }
  }

  copyAccessCode() {
    copyToClipboard(this.settings.accessCode)
  }

  cancelExam() {
    this.router.navigate(['/wykladowca/egzaminy']);
  }

  transformDate(date: Date, time: Date) {
    if (!date || !time) return '';
    const dateString = date.toISOString().split('T')[0];
    const timeString = time.toISOString().split('T')[1].split('.')[0];
    return dateString + 'T' + timeString;
  }

  startDate = '';
  endDate = '';
  errors: string[] = [];
  runChecks() {
    this.errors = []

    this.startDate = this.transformDate(this.settings.startDate, this.settings.startTime);
    this.endDate = this.transformDate(this.settings.endDate, this.settings.endTime);

    const startDate = new Date(this.startDate);
    const endDate = this.endDate == '' ? undefined : new Date(this.endDate);

    if (!this.settings.name.trim()) {
      this.errors.push('Nazwa egzaminu nie może być pusta.');
    }
    if (!this.settings.accessCode.trim()) {
      this.errors.push('Kod dostępu nie może być pusty.');
    }
    if (this.mode == 'create' && this.settings.accessCode.length < 12) {
      this.errors.push('Kod dostępu musi mieć co najmniej 12 znaków.');
    }

    if (endDate && startDate.getTime() > endDate.getTime()) {
      this.errors.push('Data rozpoczęcia egzaminu nie może być późniejsza niż data zakończenia egzaminu.');
    }
    let passedDuration = true
    let durationParts: any[] = this.settings.duration.split(':');
    if (durationParts.length !== 3) {
      this.errors.push('Czas trwania egzaminu musi być w formacie HH:MM:SS.');
      passedDuration = false
    }
    durationParts = durationParts.map(num =>parseInt(num, 10));
    const hours = durationParts[0];
    const minutes = durationParts[1];
    const seconds = durationParts[2];
    if (passedDuration && (isNaN(hours) || isNaN(minutes) || isNaN(seconds))) {
      this.errors.push('Czas trwania egzaminu musi być w formacie HH:MM:SS.');
      passedDuration = false
    }
    if (passedDuration && (hours < 0 || minutes < 0 || seconds < 0)) {
      this.errors.push('Czas trwania egzaminu musi być w formacie HH:MM:SS.');
      passedDuration = false
    }
    if (passedDuration && (hours > 23 || minutes > 59 || seconds > 59)) {
      this.errors.push('Czas trwania egzaminu musi być w formacie HH:MM:SS.');
      passedDuration = false
    }
    if (passedDuration && (hours == 0 && minutes == 0 && seconds == 0)) {
      this.errors.push('Czas trwania egzaminu musi być większy od 0.');
      passedDuration = false
    }
    if (endDate && passedDuration && (endDate.getTime() - startDate.getTime() < ((hours * 60 + minutes) * 60 + seconds) * 1000)) {
      this.errors.push('Czas trwania egzaminu nie może być dłuższy niż czas pomiędzy rozpoczęciem a zakończeniem egzaminu.');
    }

    if (this.settings.questionNumber < 1) {
      this.errors.push('Liczba pytań musi być większa od 0.');
    }
    if (this.settings.passingScore > this.settings.questionNumber) {
      this.errors.push('Liczba punktów do zaliczenia nie może być większa od liczby pytań.');
    }

    return this.errors.length == 0;
  }
  parseData() {
    return {
      name: this.settings.name.trim(),
      access_code: this.settings.accessCode.trim(),
      start_time: this.startDate,
      end_time: this.endDate == '' ? null : this.endDate,
      duration: this.settings.duration,
      questions: this.settings.questionNumber,
      passing_score: this.settings.passingScore,
      can_go_back: this.settings.canGoBack,
      is_global_duration: this.settings.isGlobalDuration,
      show_results: this.settings.showResults
    }
  }

  createExam() {
    console.log('Creating exam...');
    if (!this.runChecks()) return;
    const data = this.parseData()
    this.teacherService.createExam(data).subscribe({
      next: (examId) => {
        this.router.navigate([`/wykladowca/egzamin/${examId}`]);
      },
      error: (err) => {
        console.error(err);
        this.errors.push('Wystąpił błąd podczas tworzenia egzaminu.');
      }
    })
  }
  updateExam() {
    if (!this.runChecks()) return;
    const data = this.parseData()
    this.teacherService.modifyExam(this.examId, data).subscribe({
      next: () => {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/wykladowca/egzaminy', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    })
  }

  handleGlobalTime() {
    if (!this.settings.isGlobalDuration) {
      this.settings.canGoBack = false
    }
  }
}
