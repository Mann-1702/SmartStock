import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private http: HttpClient, private router: Router, private config: ConfigService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      // not logged in
      this.router.navigate(['/login']);
      return of(false);
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any>(`${this.config.getApiUrl()}/auth/user`, { headers }).pipe(
      map(() => true),
      catchError(() => {
        // token invalid — clear and redirect
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
