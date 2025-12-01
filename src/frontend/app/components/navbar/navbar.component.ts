import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';

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
export class NavbarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isManager = false;
  cartCount = 0;
  private routerSub?: Subscription;
  displayName = '';

  constructor(private http: HttpClient, private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.checkUser();
    this.updateCartCount();
    // Subscribe to cart changes
    this.cartService.cart$.subscribe(cart => {
      this.cartCount = cart.length;
      console.log('Navbar cart count updated:', this.cartCount);
    });
    // Re-run checkUser() after navigation in case token was added to URL by redirect
    this.routerSub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.checkUser();
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  updateCartCount(): void {
    this.cartCount = this.cartService.getCart().length;
    console.log('Cart count updated:', this.cartCount);
  }

  checkUser(): void {
    // Try to get token from localStorage; if redirected with token param, capture it
    let token = localStorage.getItem('token');
    console.log('Navbar: existing token in localStorage:', token);
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('token');
      if (t) {
        token = t;
        localStorage.setItem('token', token);
        // remove token from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, document.title, url.toString());
        console.log('Navbar: captured token from URL and saved to localStorage');
      }
    } catch (e) {
      // ignore
    }

    if (!token) {
      this.user = null;
      this.isManager = false;
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<User>('http://localhost:3000/auth/user', { headers })
      .subscribe({
        next: (user) => {
          console.log('Navbar: /auth/user response', user);
          this.user = user;
          // prefer explicit displayName from server, fallback to name or email local-part
          this.displayName = (user as any).displayName || user.name || (user.email ? user.email.split('@')[0] : 'User');
          this.isManager = user.role === 'manager';
        },
        error: (err) => {
          console.warn('Navbar: /auth/user error', err);
          // token invalid or expired
          localStorage.removeItem('token');
          this.user = null;
          this.isManager = false;
        }
      });
  }

  logout(): void {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    // call backend to blacklist token, then clear client token and redirect to login
    this.http.get('http://localhost:3000/auth/logout', { headers, responseType: 'text' as 'json' })
      .subscribe({
        next: () => {
          localStorage.removeItem('token');
          this.user = null;
          this.isManager = false;
          window.location.href = '/login';
        },
        error: () => {
          // still clear local token even if backend call fails
          localStorage.removeItem('token');
          this.user = null;
          this.isManager = false;
          window.location.href = '/login';
        }
      });
  }
}
