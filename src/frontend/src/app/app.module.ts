import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { HeaderComponent } from './components/header/header.component';
import { CustomerDetailComponent } from './components/customer-detail/customer-detail.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomerItemComponent } from './components/customer-item/customer-item.component';
import { KeycloakService } from './services/keycloak.service';
import { BackendHttpInterceptor } from './backend.interceptor';
import { ProjectItemComponent } from './components/project-item/project-item.component';
import { AlertService } from './services/alert.service';
import { ProjectService } from './services/project.service';


function initializeAppFactory(keycloak: KeycloakService): () => Promise<any> {
  return async () => await keycloak.init();
 }

@NgModule({
  declarations: [
    AppComponent,
    CustomerListComponent,
    HeaderComponent,
    CustomerDetailComponent,
    CustomerItemComponent,
    ProjectItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [KeycloakService],
      multi: true
    },
    KeycloakService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BackendHttpInterceptor,
      multi: true
    },
    ProjectService,
    AlertService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
