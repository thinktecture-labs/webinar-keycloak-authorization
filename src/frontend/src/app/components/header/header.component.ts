import { Component, OnInit } from '@angular/core';
import { KeycloakProfile } from 'keycloak-js';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  public profile: KeycloakProfile | undefined;

  constructor(private keycloak: KeycloakService) {}
  ngOnInit(): void {
    this.keycloak.loadUserProfile()
      .subscribe(profile => this.profile = profile);
  }

  public login() {
    this.keycloak.login();
  }

  public logout() {
    this.keycloak.logout();
  }
}
