import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Keycloak from 'keycloak-js';
import { BehaviorSubject, from, Observable, of, Subject } from 'rxjs';
import {
  filter,
  mergeMap,
  publishLast,
  refCount,
  shareReplay,
} from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private authenticated$ = new BehaviorSubject<boolean>(false);
  private permissionsLoaded$: Observable<PermissionMatcher> | undefined;

  private keycloak: Keycloak.KeycloakInstance;

  private uma2Configuration?: Observable<UMA2Configuration>;

  constructor(private http: HttpClient) {
    this.keycloak = Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    });
  }

  public init(): Promise<boolean> {
    this.keycloak.onAuthSuccess = () => this.authenticated$.next(true);
    return this.keycloak.init({ onLoad: 'check-sso' });
  }

  //#region Other Stuff
  public login(): Promise<void> {
    return this.keycloak.login();
  }

  public logout(): Promise<void> {
    return this.keycloak.logout();
  }

  public loadUserProfile(): Observable<Keycloak.KeycloakProfile | undefined> {
    return this.authenticated
      .pipe(mergeMap(() => from(this.keycloak.loadUserProfile())));
  }

  public getAccessToken(): Observable<string> {
    return from(this.keycloak.updateToken(5))
      .pipe(mergeMap(() => of(this.keycloak.token ?? '')));
  }

  public get authenticated(): Observable<boolean> {
    return this.authenticated$.pipe(filter((b) => b));
  }
  //#endregion

  // getEntitlement requests a RPT
  // for the current user from Keycloak
  public getEntitlement(): Observable<TokenResponse> {
    return this.makeUMARequest<TokenResponse>();
  }

  // loadPermissions requests all permissions
  // for the current user from Keycloak
  public loadPermissions(): Observable<PermissionMatcher> {
    if (!this.permissionsLoaded$)
    {
      this.permissionsLoaded$ = this.authenticated
        .pipe(
          mergeMap(() => this.makeUMARequest<Permission[]>({ response_mode: 'permissions' })),
          mergeMap((permissions) => of(new PermissionMatcher(permissions))),
          shareReplay(1));
    }
    return this.permissionsLoaded$;
  }

  // loads UMA2 discovery document from Keycloak
  private loadUMA2Configuration(): Observable<UMA2Configuration> {
    if (this.uma2Configuration == null) {
      this.uma2Configuration = this.http
        .get<UMA2Configuration>(
          `${this.keycloak.authServerUrl}/realms/${this.keycloak.realm}/.well-known/uma2-configuration`
        )
        .pipe(publishLast(), refCount());
    }
    return this.uma2Configuration;
  }

  private makeUMARequest<TResponse>(
    params?: { [param: string]: string } | null
  ): Observable<TResponse> {
    return this.loadUMA2Configuration()
      .pipe(mergeMap((config) => {
        const p = new HttpParams()
          .set('grant_type', 'urn:ietf:params:oauth:grant-type:uma-ticket')
          .set('audience', environment.keycloak.resourceServer);

        const body = params
          ? p.appendAll(params)
          : p;

        const headers = new HttpHeaders()
          .set('Authorization', `Bearer ${this.keycloak.token}`)
          .set('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post<TResponse>(config.token_endpoint, body, { headers });
      })
    );
  }
}

export interface Permission {
  rsname: string;
  scopes: string[];
}

export class PermissionMatcher {

  constructor(private permissions: Permission[]) {
  }

  public isAuthorized(resource: string, scope: string): boolean {
    if (!this.permissions) {
      return false;
    }

    return this.permissions.some(
      (p) => p.rsname === resource && p.scopes.some((s) => s === scope)
    );
  }
}

interface UMA2Configuration {
  token_endpoint: string;
}

export interface TokenResponse {
  access_token: string;
  expires: number;
}
function replay(arg0: number): import("rxjs").OperatorFunction<PermissionMatcher, PermissionMatcher> {
  throw new Error('Function not implemented.');
}

