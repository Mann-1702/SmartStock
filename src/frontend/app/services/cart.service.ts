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
    console.log('=== CartService Constructor Called ===');
    this.loadCartFromStorage();
    console.log('Cart after loading from storage:', this.cart);
    this.cartSubject.next(this.cart);
    console.log('Initial cart$ emitted');
  }

  private loadCartFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      this.cart = stored ? JSON.parse(stored) : [];
      console.log('Cart loaded from localStorage:', this.cart);
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.cart = [];
    }
  }

  private saveCartToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cart));
      this.cartSubject.next([...this.cart]);
      console.log('Cart saved to localStorage:', this.cart);
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
      console.log('Product added to cart:', product);
      console.log('Cart now contains:', this.cart);
      this.saveCartToStorage();
    }
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.cart.find(p => p._id === productId);
    if (item) {
      item.quantity = quantity;
      console.log('Quantity updated for', productId, ':', quantity);
      this.saveCartToStorage();
    }
  }

  removeFromCart(productId: string) {
    this.cart = this.cart.filter(p => p._id !== productId);
    console.log('Item removed from cart. Cart now:', this.cart);
    this.saveCartToStorage();
  }

  clearCart() {
    this.cart = [];
    console.log('Cart cleared');
    this.saveCartToStorage();
  }
}
