import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const excludedRoutes = ['/authenticate', '/refresh-token'];
  
  if (excludedRoutes.some(route => req.url.includes(route))) {
    return next(req);
  }

  // Check if we're running in the browser
  const isBrowser = typeof window !== 'undefined';
  
  const token = isBrowser ? localStorage.getItem('accessToken') : null;
  const refreshToken = isBrowser ? localStorage.getItem('refreshToken') : null;
  
  const auth = inject(AuthService);
  
  if (token) {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && refreshToken) {
          return auth.refreshToken(refreshToken).pipe(
            switchMap((response: any) => {
              localStorage.setItem('accessToken', response.accessToken);
              localStorage.setItem('refreshToken', response.refreshToken);
              
              return next(req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.accessToken}`
                }
              }));
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
  
  return next(req);
};
