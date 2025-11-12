import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface User {
  _id: string;
  googleId: string;
  name: string;
  email: string;
  role: string;
  storeId: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user: User | null = null;
  isManager = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.checkUser();
  }

  checkUser(): void {
    this.http.get<User>('http://localhost:3000/auth/user', { withCredentials: true })
      .subscribe({
        next: (user) => {
          this.user = user;
          this.isManager = user.role === 'manager';
        },
        error: () => {
          this.user = null;
          this.isManager = false;
        }
      });
  }

  logout(): void {
    window.location.href = 'http://localhost:3000/auth/logout';
  }
}
