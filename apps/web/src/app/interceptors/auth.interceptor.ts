import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const token = localStorage.getItem('tinytag-token');
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: 'Bearer '.concat(token) }
    });
    return next(cloned);
  }
  return next(req);
}
