import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {authorizeResponse, getExamsResponse} from '../types';
import {StorageService} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  constructor(private storage: StorageService, private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  getCSRFCookie() {
    return new Observable<void>(observer => {
      this.http.get('/sanctum/csrf-cookie', {
        withCredentials: true
      }).subscribe({
        next: () => {
          observer.next();
          observer.complete();
        },
        error: () => {
          observer.error();
          observer.complete();
        },
      });
    });
  }

  checkSession() {
    return new Observable<void>(observer => {
      if (!this.storage.adminToken) {
        observer.error();
        observer.complete();
        return;
      }
      this.getCSRFCookie().subscribe({
        next: () => {
          this.http.post('/api/admin/check', {}, {
            headers: {
              'Authorization': `Bearer ${this.storage.adminToken}`,
            },
            withCredentials: true
          }).subscribe({
            next: () => {
              observer.next();
              observer.complete();
            },
            error: () => {
              this.storage.adminToken = null;
              observer.error();
              observer.complete();
            },
          });
        }
      })
    });
  }

  authorize(email: string, password: string) {
    return new Observable<void>(observer => {
      this.http.post<authorizeResponse>('/api/admin/tokenize', {
        email,
        password,
      }, {
        withCredentials: true,
      }).subscribe({
        next: (resp) => {
          this.storage.adminToken = resp.token!;
          const redirect = this.route.snapshot.queryParams['redirect'] || '/wykladowca';
          this.router.navigate([redirect]);
          observer.next();
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        },
      });
    })
  }
  logout() {
    return new Observable<void>(observer => {
      this.http.post('/api/admin/logout', {}, {
        headers: {
          'Authorization': `Bearer ${this.storage.adminToken}`,
        },
        withCredentials: true,
      }).subscribe({
        next: () => {
          this.storage.adminToken = null;
          this.router.navigate(['/wykladowca/logowanie'], {
            queryParams: {
              redirect: this.router.routerState.snapshot.url
            },
            skipLocationChange: true
          });
          observer.next();
          observer.complete();
        },
        error: () => {
          observer.next();
          observer.complete();
        },
      });
    })
  }

  getExams() {
    return new Observable<any>(observer => {
      this.http.get<getExamsResponse>('/api/admin/exams', {}).subscribe({
        next: (resp) => {
          observer.next(resp.exams);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        },
      })
    })
  }
  createExam(data: any) {
    return new Observable<number>(observer => {
      this.http.post('/api/admin/exam/create', data, {}).subscribe({
        next: (resp: any) => {
          observer.next(resp.exam_id);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        },
      })
    })
  }
  modifyExam(id: number, data: any) {
    return new Observable<void>(observer => {
      this.http.post(`/api/admin/exam/${id}/modify`, data, {}).subscribe({
        next: () => {
          observer.next();
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        },
      })
    })
  }

  getExam(id: number) {
    return new Observable<any>(observer => {
      this.http.get(`/api/admin/exam/${id}`, {}).subscribe({
        next: (resp: any) => {
          observer.next(resp.exam);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        },
      })
    })
  }
  getStats(id: number, date: string) {
    return new Observable<any>(observer => {
      this.http.get(`/api/admin/exam/${id}/stats/${date}`).subscribe({
        next: (resp: any) => {
          observer.next(resp.stats);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        },
      })
    })
  }
  getResponses(id: number, trashed: boolean = false) {
    return new Observable<any>(observer => {
      this.http.get(`/api/admin/exam/${id}/responses`, {
        params: {
          trashed: trashed,
        }
      }).subscribe({
        next: (resp: any) => {
          observer.next(resp.responses);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        },
      })
    })
  }
  getResponsesList(id: number) {
    return new Observable<any>(observer => {
      this.http.get(`/api/admin/exam/${id}/responses/list`, {}).subscribe({
        next: (resp: any) => {
          observer.next(resp.responses);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        },
      })
    })
  }

  getResponse(uuid: string) {
    return new Observable<any>(observer => {
      this.http.get(`/api/admin/response/${uuid}`, {}).subscribe({
        next: (resp: any) => {
          observer.next(resp.response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        },
      })
    })
  }
  removeResponse(uuid: string) {
    return new Observable<void>(observer => {
      this.http.post(`/api/admin/response/${uuid}/remove`, {}, {}).subscribe({
        next: () => {
          observer.next();
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        },
      })
    })
  }
  restoreResponse(uuid: string) {
    return new Observable<void>(observer => {
      this.http.post(`/api/admin/response/${uuid}/restore`, {}, {}).subscribe({
        next: () => {
          observer.next();
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        },
      })
    })
  }
}
