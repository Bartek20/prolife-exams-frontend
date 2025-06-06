import {EventEmitter, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {AppState, ExamConfig, ExamResult, ExamState, Question} from '../types';
import {Router} from '@angular/router';

import { Observable } from 'rxjs';

import { BlurSpy } from '../utils/CheatingProtection';
import {NgToastService} from 'ng-angular-popup';
import {StorageService} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  examConfig: ExamConfig | null = null;
  examState: ExamState | null = null;
  blurSpy: BlurSpy | null = null;
  blurEvent = new EventEmitter<void>();
  maxBlursEvent = new EventEmitter<void>();

  appState: AppState = {
    // Global
    headerType: 'normal',
    // Exam
    clockText: undefined,
    currentQuestion: undefined,
    selectedAnswer: -1,
    hasAnswerChanged: false,
  }

  constructor(private storage: StorageService, private http: HttpClient, private router: Router, private toast: NgToastService) {}

  setupFocusMonitoring() {
    if (this.blurSpy) return this.blurSpy
    this.blurSpy = new BlurSpy(()=>{
      this.blurEvent.emit()
    }, ()=>{
      this.maxBlursEvent.emit()
    }, () => {
      this.toast.danger('Podczas egzaminu nie opuszczaj karty z testem. Egzaminator został powiadomiony.', 'Wykryto opuszczenie strony', 5000)
    }, 5)
    const uuid = this.storage.responseUuid
    this.blurSpy.start(250, uuid ? `focus_${uuid}` : 'focus_exam')
    return this.blurSpy
  }

  getExamConfig(access_code: string) {
    return new Observable<void>(observer => {
      this.http.get(`/api/exam/config/${access_code}`).subscribe({
        next: (resp: any) => {
          this.examConfig = resp.config;
          this.storage.accessCode = access_code;
          this.storage.responseUuid = null;
          this.router.navigate(['/egzamin/informacje'], {
            replaceUrl: true
          });
          observer.next();
          observer.complete();
        },
        error: () => {
          observer.error();
          observer.complete();
        }
      });
    })
  }

  startExam(name: string | undefined = undefined, surname: string | undefined = undefined, email: string | undefined = undefined) {
    return new Observable<void>(observer => {
      this.http.post('/api/exam/start', {
        access_code: this.storage.accessCode,
        student_name: name,
        student_surname: surname,
        student_email: email
      }).subscribe({
        next: (resp: any) => {
          this.storage.accessCode = null
          this.storage.responseUuid = resp.uuid
          this.storage.examToken = resp.token
          this.router.navigate(['/egzamin/pytania'], {
            replaceUrl: true
          })
          observer.next();
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        }
      });
    })
  }
  getState(uuid: string) {
    return new Observable<void>(observer => {
      this.http.get('/api/exam/state').subscribe({
        next: (resp: any) => {
          if (resp.exam.end_time) observer.error()
          else {
            this.examConfig = resp.config;
            this.examState = resp.exam;
            observer.next();
          }
          observer.complete();
        },
        error: () => {
          observer.error();
          observer.complete();
        }
      });
    })
  }
  finishExam() {
    return new Observable<void>(observer => {
      this.http.post<{
        success: boolean,
        token: string,
        info: any
      }>('/api/exam/finish', {}).subscribe({
        next: (resp) => {
          this.storage.result = {key: this.examState!.uuid, value: {
              exam_name: resp.info.exam_name,
              exam_time: new Date(resp.info.exam_date).getTime(),
              exam_token: resp.token,
              student: resp.info.student_info.name + ' ' + resp.info.student_info.surname,
            }}
          this.storage.responseUuid = null;
          this.storage.examToken = null;
          this.router.navigate([`/egzamin/wyniki/${this.examState!.uuid}`], {
            replaceUrl: true
          });
          this.blurSpy?.stop();
          observer.next();
          observer.complete();
        },
        error: (err) => {
          if (err.error.message == 'Exam has ended.') {
            this.router.navigate([`/egzamin/wyniki/${this.examState!.uuid}`], {
              replaceUrl: true
            });
          }
          observer.error();
          observer.complete();
        }
      });
    })
  }

  getQuestion(id: number) {
    return new Observable<Question>(observer => {
      if (this.examState?.questions[id - 1].question != 'Brak pytania') {
        this.appState.currentQuestion = this.examState!.questions[id - 1];
        this.appState.selectedAnswer = this.examState!.questions[id - 1].answer;
        this.appState.hasAnswerChanged = false;
        observer.next(this.examState!.questions[id - 1]);
        observer.complete();
        return;
      }

      this.http.get<{
        success: boolean,
        question: Question,
      }>(`/api/exam/question/${id}`).subscribe({
        next: (resp) => {
          this.examState!.questions[resp.question.index - 1] = resp.question;
          this.appState.currentQuestion = resp.question;
          this.appState.selectedAnswer = resp.question.answer;
          this.appState.hasAnswerChanged = false;
          observer.next(resp.question);
          observer.complete();
        },
        error: () => {
          observer.error();
          observer.complete();
        }
      });
    })
  }
  changeQuestion = new EventEmitter<number>()
  setAnswer() {
    if (!this.appState.currentQuestion || this.appState.selectedAnswer == -1) {
      return new Observable<void>(observer => {
        observer.next();
        observer.complete();
      })
    }

    const id = this.appState.currentQuestion.index;
    const uuid = this.appState.currentQuestion.uuid!;
    const answer = this.appState.selectedAnswer;
    return new Observable<void>(observer => {
      this.http.post(`/api/exam/answer/${id}`, {
        uuid,
        answer
      }).subscribe({
        next: () => {
          this.examState!.questions[id - 1].answer = answer;
          observer.next();
          observer.complete();
        },
        error: (err) => {
          if (err.error.error == "Exam has ended.") {
            this.router.navigate([`/egzamin/wyniki/${this.examState?.uuid || ''}`], {
              replaceUrl: true
            });
          }
          observer.error();
          observer.complete();
        }
      });
    })
  }
}
