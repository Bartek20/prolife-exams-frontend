import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RedirectCommand, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {TeacherService} from './teacher.service';
import {StorageService} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TeacherGuard implements CanActivate {

  constructor(private storage: StorageService, private teacherService: TeacherService, private router: Router) {}

  redirectConstructor(url: string, local: boolean = false) {
    const path = this.router.parseUrl(url);
    return new RedirectCommand(path, {
      skipLocationChange: local
    });
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return new Observable<RedirectCommand | boolean>((observer) => {
      const path = state.url.split('?')[0].split('/').pop();
      this.teacherService.checkSession().subscribe({
        next: () => {
          if (path != 'logowanie') {
            observer.next(true)
            observer.complete();
            return;
          }
          const redirect = route.queryParams['redirect'] || '/wykladowca';
          observer.next(this.redirectConstructor(redirect));
          observer.complete();
        },
        error: () => {
          if (path == 'logowanie') {
            observer.next(true);
            observer.complete();
            return;
          }
          const route = encodeURIComponent(state.url)
          observer.next(this.redirectConstructor('/wykladowca/logowanie?redirect=' + route, true));
          observer.complete();
        },
      })
    })
  }

}
