import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
export class NavbarComponent implements OnInit {
  user: User | null = null;
  isManager = false;
  cartCount = 0;

  constructor(private http: HttpClient, private cartService: CartService) {}

  ngOnInit(): void {
    this.checkUser();
    this.updateCartCount();
    // Subscribe to cart changes
    this.cartService.cart$.subscribe(cart => {
      this.cartCount = cart.length;
      console.log('Navbar cart count updated:', this.cartCount);
    });
  }

  updateCartCount(): void {
    this.cartCount = this.cartService.getCart().length;
    console.log('Cart count updated:', this.cartCount);
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
