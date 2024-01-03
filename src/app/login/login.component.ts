import { Component } from '@angular/core';
import { AuthConfigService } from '../auth-config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private authConfigService: AuthConfigService){

  }
  login(){

    this.authConfigService.login();
  }
}
