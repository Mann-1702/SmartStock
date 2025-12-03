import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: any[] = [];
  totalAmount = 0;
  totalQuantity = 0;
  showCheckoutForm = false;
  customerName = '';
  customerEmail = '';
  isProcessing = false;
  private cartSubscription: Subscription | null = null;

  @ViewChild('nameInput') nameInput!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    
    // Subscribe to cart changes from CartService
    this.cartSubscription = this.cartService.cart$.subscribe(updatedCart => {
      this.cart = updatedCart;
      this.calculateTotals();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadCart(): void {
    this.cart = this.cartService.getCart();
    this.calculateTotals();
  }

  calculateTotals() {
    this.totalAmount = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.totalQuantity = this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  toggleCheckoutForm() {
    this.showCheckoutForm = !this.showCheckoutForm;
  }

  removeItem(item: any) {
    this.cartService.removeFromCart(item._id);
    this.cart = this.cartService.getCart();
    this.calculateTotals();
  }

  updateQuantity(item: any, quantity: number) {
    if (quantity > 0) {
      item.quantity = quantity;
      this.cartService.updateQuantity(item._id, quantity);
      this.calculateTotals();
    }
  }

  // Checkout: Create order from cart items
  checkout() {
    const name = this.nameInput?.nativeElement?.value?.trim();
    const email = this.emailInput?.nativeElement?.value?.trim();

    if (!name || !email) {
      alert('Please enter your name and email');
      return;
    }

    if (this.cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    this.isProcessing = true;

    // Prepare cart items for checkout
    const cartItems = this.cart.map(item => ({
      _id: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    // Call the checkout endpoint (which also updates stock on backend)
    this.orderService.checkoutCart(name, email, cartItems).subscribe({
      next: (response) => {
        alert('Order placed successfully! Order ID: ' + response.order._id);
        
        // Clear cart after successful order and stock update
        this.cartService.clearCart();
        this.cart = [];
        this.totalAmount = 0;
        this.totalQuantity = 0;
        this.showCheckoutForm = false;
        this.isProcessing = false;
        
        // Reset form inputs
        if (this.nameInput) this.nameInput.nativeElement.value = '';
        if (this.emailInput) this.emailInput.nativeElement.value = '';

        // Small delay to ensure backend has processed stock updates
        setTimeout(() => {
          // Redirect to customer shop so they can see updated stock
          this.router.navigate(['/customer-shop']);
        }, 500);
      },
      error: (error) => {
        console.error('Checkout error:', error);
        const errorMessage = error.error?.message || 'Please try again';
        alert('Error placing order: ' + errorMessage);
        this.isProcessing = false;
      }
    });
  }

  // Legacy method for stock update (kept for compatibility)
  buyNow() {
    const updates = this.cart.map(item => ({
      _id: item._id,
      quantitySold: item.quantity
    }));

    this.http.put('http://localhost:3000/api/products/updateStock', { updates })
      .subscribe({
        next: () => {
          alert('Purchase successful! Stock updated.');
          this.cartService.clearCart();
          this.cart = [];
          this.totalAmount = 0;
          this.totalQuantity = 0;
        },
        error: (err) => {
          console.error('Error updating stock:', err);
          alert('Something went wrong. Please try again.');
        }
      });
  }
}
