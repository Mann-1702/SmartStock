import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: any[] = [];
  private readonly STORAGE_KEY = 'smartstock_cart';
  private cartSubject = new BehaviorSubject<any[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
    this.cartSubject.next(this.cart);
  }

  private loadCartFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      this.cart = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.cart = [];
    }
  }

  private saveCartToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cart));
      this.cartSubject.next([...this.cart]);
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  getCart() {
    return this.cart;
  }

  addToCart(product: any) {
    const existing = this.cart.find(p => p._id === product._id);
    if (!existing) {
      this.cart.push({ ...product });
      this.saveCartToStorage();
    }
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.cart.find(p => p._id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCartToStorage();
    }
  }

  removeFromCart(productId: string) {
    this.cart = this.cart.filter(p => p._id !== productId);
    this.saveCartToStorage();
  }

  clearCart() {
    this.cart = [];
    this.saveCartToStorage();
  }
}
