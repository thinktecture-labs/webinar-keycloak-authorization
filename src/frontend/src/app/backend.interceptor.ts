import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { KeycloakService } from './services/keycloak.service';

@Injectable()
export class BackendHttpInterceptor implements HttpInterceptor {
  private rptUrls: RegExp[];

  constructor(private keycloak: KeycloakService) {
    this.rptUrls = environment.keycloak.rptUrls.map(
      (url) => new RegExp(url, 'i')
    );
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!request.url.startsWith(environment.apiBaseUrl)) {
      return next.handle(request);
    }

    if (this.rptUrls.some((r) => r.test(request.url))) {
      return this.keycloak.authenticated
        .pipe(
          mergeMap(() => this.keycloak.getEntitlement()),
          mergeMap((token) => this.runRequestWithToken(next, request, token.access_token)));
    }

    return this.keycloak.authenticated
      .pipe(mergeMap(() => this.keycloak.getAccessToken()))
      .pipe(mergeMap((token) => this.runRequestWithToken(next, request, token)));
  }

  private runRequestWithToken(
    next: HttpHandler,
    request: HttpRequest<any>,
    token: string
  ): Observable<HttpEvent<any>> {
    const req = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });

    return next.handle(req);
  }
}
