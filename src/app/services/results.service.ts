import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ExamResult} from '../types';
import {StorageService} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  constructor(private storage: StorageService, private http: HttpClient) {
  }

  isDEMOExam = false
  results?: ExamResult = undefined
  resultsHidden = false
  authRequired = false
  examNotFound = false
  examInProgress = false

  restoreExam(uuid: string, name: string, surname: string, email: string) {
    return new Observable<void>(observer => {
      this.http.post<{
        success: boolean,
        token: string,
        info: any
      }>('/api/exam/restore', {
        uuid,
        student_name: name,
        student_surname: surname,
        student_email: email
      }).subscribe({
        next: (resp) => {
          this.storage.result = {key: uuid, value: {
              exam_name: resp.info.exam_name,
              exam_time: new Date(resp.info.exam_date).getTime(),
              exam_token: resp.token,
              student: resp.info.student_info.name + ' ' + resp.info.student_info.surname,
            }}
          observer.next()
          observer.complete()
        },
        error: () => {
          observer.error()
          observer.complete()
        }
      })
    })
  }

  getResults(uuid: string) {
    this.isDEMOExam = false
    this.results = undefined;
    this.resultsHidden = false;
    this.authRequired = false;
    this.examNotFound = false;
    this.examInProgress = false;

    return new Observable<void>(observer => {
      this.http.get<ExamResult>(`/api/results/${uuid}`).subscribe({
        next: (resp) => {
          this.results = resp;
          this.isDEMOExam = resp.exam.isDEMO
          this.resultsHidden = false;
          this.authRequired = false;
          this.examNotFound = false;
          this.examInProgress = false;
          observer.next();
          observer.complete();
        },
        error: (err) => {
          if (err.error) {
            this.resultsHidden = err.error.error == 'Results are not available';
            this.authRequired = err.error.error == 'Auth required';
            this.examNotFound = err.error.error == 'Response not found';
            this.examInProgress = err.error.error == 'Exam has not ended';
          }

          if (this.examNotFound) {
            this.storage.result = {key: uuid, value: null};
          }

          observer.error();
          observer.complete();
        }
      });
    })
  }
  downloadResults(uuid: string) {
    return new Observable<void>(observer => {
      this.http.get(`/api/results/${uuid}/download`, {
        responseType: 'blob'
      }).subscribe({
        next: (resp) => {
          const url = URL.createObjectURL(resp);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `Wyniki Egzaminu.pdf`;
          anchor.click();
          setTimeout(() => URL.revokeObjectURL(url), 100);
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
}
