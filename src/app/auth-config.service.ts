import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthConfigService {

  constructor(public oauthService: OAuthService ) {
    this.initlogin();
  }

  initlogin() {
    const config : AuthConfig = {
      issuer: environment.fusionauth.issuer,
      clientId: environment.fusionauth.clientId,
      responseType: 'code',
      redirectUri: window.location.origin + '/home',  //USUARIO_PRINCIPAL // ADMINISTRADOR
      scope: 'openid offline_access profile applicationId roles',
      useSilentRefresh: false,
      showDebugInformation: false,
      nonceStateSeparator: 'semicolon'
    }  
    this.oauthService.configure(config);
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  login() {

    this.oauthService.initLoginFlow();

  }
  logout(){
    this.oauthService.logOut();
  }

  getProfile(){
    return this.oauthService.getIdentityClaims();
  }
}
