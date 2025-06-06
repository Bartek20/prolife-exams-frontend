import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from "@angular/core";
import {StorageService} from "./storage.service";
import {catchError, retry, throwError} from "rxjs";
import {Router} from "@angular/router";

type UnprotectedRoute = {
    requiresAuth: false;
}
type AdminRoute = {
  requiresAuth: true;
  tokenType: 'admin';
}
type ExamRoute = {
  requiresAuth: true;
  tokenType: 'exam';
}
type ResultRoute = {
  requiresAuth: true;
  tokenType: 'result';
  targetUUID: string;
}
type Route = UnprotectedRoute | AdminRoute | ExamRoute | ResultRoute;
function parseRoute(appRoute: string, apiRoute: string): Route {
  const url = apiRoute.replace('/api/', '').split('/');
  if (url[0] == 'admin') {
    if (['tokenize'].includes(url[1])) return {
      requiresAuth: false,
    }
    return {
      requiresAuth: true,
      tokenType: 'admin',
    }
  }
  if (url[0] == 'exam') {
    if (['config', 'start', 'restore'].includes(url[1])) return {
      requiresAuth: false,
    }
    return {
      requiresAuth: true,
      tokenType: 'exam',
    }
  }
  if (url[0] == 'results') {
    if (appRoute.startsWith('/wykladowca/')) {
      return {
        requiresAuth: true,
        tokenType: 'admin',
      }
    }
    return {
      requiresAuth: true,
      tokenType: 'result',
      targetUUID: url[1]
    }
  }
  return {
    requiresAuth: false,
  }
}

function getToken(route: Exclude<Route, UnprotectedRoute>): string | null {
  const storage = inject(StorageService)
  if (route.tokenType === 'admin') return storage.adminToken
  if (route.tokenType === 'exam') return storage.examToken
  return storage.result(route.targetUUID).exam_token
}


export const ApiInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;

  // Ignore non-API requests
  if (!url.startsWith("/api/")) return next(req)

  req = req.clone({
    withCredentials: true,
  })

  const router = inject(Router);
  const route = parseRoute(router.routerState.snapshot.url, url);
  if (route.requiresAuth) {
    const token = getToken(route);
    if (!token) {
      console.warn('No token found for request:', req);
    }
    else {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        }
      });
    }
  }

  return next(req).pipe(catchError((err: HttpErrorResponse) => {
    if (err.status === 503) {
      console.error('Service unavailable:', err);
      router.navigate(['/serwis-niedostepny'], {
        skipLocationChange: true,
      });
      return throwError(() => new Error('Service unavailable'));
    }
    if (err.status === 401 && route.requiresAuth && route.tokenType === 'admin') {
      console.warn('Unauthorized request:', req);
      router.navigate(['/wykladowca/logowanie'], {
        queryParams: { redirect: router.routerState.snapshot.url },
        skipLocationChange: true
      });
      return throwError(() => new Error('Admin auth required'));
    }
    console.error('Error occurred while fetching data:', err);
    return throwError(() => err);
  }));
};
