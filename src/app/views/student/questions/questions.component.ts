import {Component, OnInit} from '@angular/core';
import {ExamService} from '../../../services/exam.service';
import {NgClass} from '@angular/common';
import {Router} from '@angular/router';
import {LoadingComponent} from '../../../components/loading/loading.component';
import {QuestionComponent} from '../../../components/question/question.component';
import {PopupQuestionComponent} from '../../../components/popup-question/popup-question.component';
import {of} from 'rxjs';
import {StorageService} from '../../../services/storage.service';
import {Message} from 'primeng/message';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-questions',
  imports: [
    NgClass,
    LoadingComponent,
    QuestionComponent,
    PopupQuestionComponent,
    Message,
    Button,
    Card
  ],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss'
})
export class QuestionsComponent implements OnInit {
  isLoading: 'question' | 'finish' | false = 'question';
  error: string | null = null;
  askBeforeContinue = false;
  mainElement: HTMLElement | null = null;

  constructor(private storage: StorageService , protected examService: ExamService, private router: Router) {}
  ngOnInit() {
    this.mainElement = <HTMLElement>document.querySelector('main');
    this.examService.appState.headerType = 'clock';
    this.examService.setupFocusMonitoring()
    this.examService.getState(this.storage.responseUuid!).subscribe({
      next: () => {
        const index = this.examService!.examState!.questions.find(e => e.answer == null)?.index
        this.fetchQuestion(index ?? 1);
        if (this.examService.examConfig!.is_global_duration) {
          this.setupClock(this.examService.examState!.start_time)
        }
      }
    })
    this.examService.changeQuestion.subscribe({
      next: (id: number) => {
        this.changeQuestion(id);
      }
    })
  }

  // Clock
  timer?: number;
  durationToTime(duration: string) {
    const [hours, minutes, seconds] = duration.split(':').map(Number);

    let time = 0;
    time += hours * 60 * 60 * 1000;
    time += minutes * 60 * 1000;
    time += seconds * 1000;

    return time;
  }
  setupClock(start_time: string) {
    if (this.timer) clearInterval(this.timer);
    const startTime = (new Date(start_time)).getTime();
    const endTime = startTime + this.durationToTime(this.examService.examConfig!.duration);

    const setClock = () => {
      const now = Date.now();
      if (now > endTime) {
        window.clearInterval(this.timer);
        this.timesUpHandler();
        return false;
      }

      const diff = endTime - now;
      const hours = Math.floor(diff / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);

      this.examService.appState.clockText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      return true;
    }

    if (setClock()) this.timer = window.setInterval(setClock, 1000);
  }

  changeAnswer(index: number) {
    this.examService.appState.hasAnswerChanged = true;
    this.examService.appState.selectedAnswer = index;
    this.error = null;
  }

  fetchQuestion(id: number) {
    this.examService.getQuestion(id).subscribe({
      next: (resp) => {
        this.error = null;
        this.isLoading = false;
        if (!this.examService.examConfig!.is_global_duration) {
          this.setupClock(resp!.start_time!);
        }
      }
    });
  }

  finishExam() {
    this.error = null;
    if (!this.examService.appState.currentQuestion) return;
    if (this.examService.appState.selectedAnswer == -1) {
      this.error = 'Aby kontynuować, wybierz odpowiedź';
      return;
    }

    this.askBeforeContinue = true;
  }

  changeQuestion(id: number) {
    if (this.isLoading) return
    if (id > this.examService.appState.currentQuestion!.index) {
      if (this.examService.appState.selectedAnswer == -1) {
        this.error = 'Aby kontynuować, wybierz odpowiedź';
        return;
      }
    }

    this.isLoading = 'question';

    if (this.examService.appState.selectedAnswer == -1 || !this.examService.appState.hasAnswerChanged) {
      this.fetchQuestion(id);
      return
    }

    this.examService.setAnswer().subscribe(() => {
      this.fetchQuestion(id);
    });

    this.mainElement!.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  closePopup() {
    this.askBeforeContinue = false
  }
  fetchFinish() {
    this.askBeforeContinue = false;
    this.isLoading = 'finish';

    const resp = this.examService.appState.hasAnswerChanged ? this.examService.setAnswer() : of();

    let test = false
    resp.subscribe({
      next: () => {
        test = true
        this.examService.finishExam().subscribe({
          next: () => this.examService.appState.headerType = 'normal'
        })
      },
      complete: () => {
        if (!test) this.examService.finishExam().subscribe({
          next: () => this.examService.appState.headerType = 'normal'
        })
      }
    })
  }

  timesUpHandler() {
    if (this.examService.appState.selectedAnswer == -1) {
      this.examService.appState.hasAnswerChanged = true;
      this.examService.appState.selectedAnswer = -2;
    }
    if (this.examService.examConfig!.is_global_duration || this.examService.appState.currentQuestion!.index == this.examService.examConfig!.question_number) {
      this.fetchFinish()
      return
    }
    this.changeQuestion(this.examService.appState.currentQuestion!.index + 1);
  }
}
