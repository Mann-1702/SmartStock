import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginWithGoogle() {
    window.location.href = 'http://localhost:3000/auth/google';
  }
}
