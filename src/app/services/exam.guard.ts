import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RedirectCommand, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ExamService } from './exam.service';
import {StorageService} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ExamGuard implements CanActivate {

  constructor(private storage: StorageService, private examService: ExamService, private router: Router) {}

  redirectConstructor(url: string) {
    const path = this.router.parseUrl(url);
    return new RedirectCommand(path);
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return new Observable<RedirectCommand | boolean>((observer) => {
      const urlParts = state.url.split('/');

      const accessCode = this.storage.accessCode;
      const response = this.storage.responseUuid;

      // No exam selected
      if (!accessCode && !response) {
        if (urlParts.includes('kod-dostepu') || urlParts.includes('wyniki')) observer.next(true)
        else observer.next(this.redirectConstructor('/kod-dostepu'));
        observer.complete();
      }
      // Exam selected, no current response
      else if (accessCode && !response) {
        if (urlParts.includes('wyniki')) {
          observer.next(true)
          observer.complete();
          return
        }
        if (this.examService.examConfig) {
          if (urlParts.includes('kod-dostepu') || urlParts.includes('informacje')) observer.next(true)
          else observer.next(this.redirectConstructor('/egzamin/informacje'));
          observer.complete();
          return
        }
        this.examService.getExamConfig(accessCode).subscribe({
          next: () => {
            if (urlParts.includes('kod-dostepu') || urlParts.includes('informacje')) observer.next(true)
            else observer.next(this.redirectConstructor('/egzamin/informacje'));
            observer.complete();
          },
          error: () => {
            this.storage.accessCode = null;
            if (urlParts.includes('kod-dostepu')) observer.next(true)
            else observer.next(this.redirectConstructor('/kod-dostepu'));
            observer.complete();
          }
        })
      }
      // Exam selected, response exists
      else if (!accessCode && response) {
        this.examService.getState(response).subscribe({
          next: () => {
            if (urlParts.includes('pytania')) observer.next(true)
            else observer.next(this.redirectConstructor('/egzamin/pytania'));
            observer.complete();
          },
          error: () => {
            if (urlParts.includes('kod-dostepu') || urlParts.includes('wyniki')) observer.next(true)
            else observer.next(this.redirectConstructor(`/egzamin/wyniki/${response}`));
            observer.complete();
          }
        })
      }
    })
  }
}
