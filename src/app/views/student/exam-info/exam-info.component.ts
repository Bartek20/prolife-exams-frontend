import {Component, OnInit} from '@angular/core';
import {ExamService} from '../../../services/exam.service';
import {Router} from '@angular/router';
import {ButtonComponent} from '../../../components/button/button.component';
import {StorageService} from '../../../services/storage.service';
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {Message} from 'primeng/message';

@Component({
  selector: 'app-exam-info',
  imports: [
    Card,
    Button,
    Message
  ],
  templateUrl: './exam-info.component.html',
  styleUrl: './exam-info.component.scss'
})
export class ExamInfoComponent implements OnInit {
  hasExamStarted: boolean = false;
  hasExamEnded: boolean = false;
  constructor(private storage: StorageService, protected examService: ExamService, private router: Router) {}

  formatDateRange(start: string, end: string | undefined = undefined) {
    const pad = (e: number) => String(e).padStart(2, '0');
    const date = (e: Date) => {
      return e.getFullYear() + '/' + pad(e.getMonth() + 1) + '/' + pad(e.getDate());
    }
    const time = (e: Date) => {
      return pad(e.getHours()) + ':' + pad(e.getMinutes()) + ':' + pad(e.getSeconds());
    }
    const startDateObj = new Date(start);
    const startDate = date(startDateObj);
    const startTime = time(startDateObj);

    if (!end) return `${startDate} ${startTime}`;

    const endDateObj = new Date(end);
    const endDate = date(endDateObj);
    const endTime = time(endDateObj);
    return startDate == endDate ? `${startDate} ${startTime} - ${endTime}` : `${startDate} ${startTime} - ${endDate} ${endTime}`;
  }
  formatTime(time: string) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    let parts = [];

    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'godzinę' : (hours < 5 || hours > 21 ? 'godziny' : 'godzin')}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minutę' : (minutes < 5 ? 'minuty' : 'minut')}`);
    if (seconds > 0) parts.push(`${seconds} ${seconds === 1 ? 'sekundę' : (seconds < 5 ? 'sekundy' : 'sekund')}`);

    return parts.join(' ');
  }
  formatQuestionsCount(count: number) {
    if (count === 1) return 'pytania';
    return 'pytań';
  }
  formatQuestionPassingCount(count: number) {
    if (count === 1) return 'pytanie';
    return (count % 10 >= 2 && count % 10 <= 4 && !(count % 100 >= 12 && count % 100 <= 14)) ? 'pytania' : 'pytań';
  }

  isLoading = false;
  startExam() {
    if (!this.hasExamStarted) return;
    if (this.hasExamEnded) return;
    this.isLoading = true;
    if (['DEMO', 'EgzaminProbny'].includes(this.storage.accessCode!)) {
      this.examService.startExam().subscribe()
    }
    else this.router.navigate(['/egzamin/dane-osobowe']).then(()=>{
      this.isLoading = false;
    });
  }

  checkExamStatus() {
    let timer: number | undefined = undefined;
    const startTime = (new Date(this.examService.examConfig!.start_time)).getTime() || 0;
    const endTime = this.examService.examConfig!.end_time ? (new Date(this.examService.examConfig!.end_time)).getTime() || Number.POSITIVE_INFINITY : null;
    const checkTime = () => {
      if (endTime && endTime < Date.now()) {
        this.hasExamStarted = true;
        this.hasExamEnded = true;
        clearInterval(timer);
        return false;
      }
      if (startTime < Date.now()) {
        this.hasExamStarted = true;
        if (!endTime) clearInterval(timer);
        return true;
      }
      return true
    }
    if (checkTime()) timer = window.setInterval(() => {
      checkTime();
    }, 1000);
  }

  ngOnInit() {
    this.examService.appState.headerType = 'exit';
    this.checkExamStatus();
  }
}
