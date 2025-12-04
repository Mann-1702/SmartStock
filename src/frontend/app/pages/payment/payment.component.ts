import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  cardNumber: string = '';
  expiryDate: string = '';
  cvc: string = '';
  message: string = '';
  isError: boolean = false;
  isProcessing: boolean = false;
  paymentType: string | null = null;
  showModal: boolean = false;
  modalMessage: string = '';
  addCount: number = 100; // default add-on quantity

  constructor(private paymentService: PaymentService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.paymentType = this.route.snapshot.queryParamMap.get('type');
    const ac = this.route.snapshot.queryParamMap.get('addCount');
    if (ac) {
      const n = parseInt(ac, 10);
      if (!isNaN(n) && n > 0) this.addCount = n;
    }
  }

  payNow() {
    // client-side validation
    const validationError = this.validateInputs();
    if (validationError) {
      this.isError = true;
      this.message = validationError;
      return;
    }
    this.isProcessing = true;
    const payload = { cardNumber: this.cardNumber, expiryDate: this.expiryDate, cvc: this.cvc, type: this.paymentType, addCount: this.addCount };
    this.paymentService.confirmPayment(payload).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.isError = false;
        this.modalMessage = res && res.message ? res.message : (this.paymentType === 'addons' ? `Payment successful! You have received ${this.addCount} more SKUs.` : 'Payment successful! Your plan has been upgraded to Premium.');
        this.showModal = true;
        // notify other parts of app (pricing/navbar) to refresh user
        try { window.dispatchEvent(new Event('user-updated')); } catch (e) {}
        setTimeout(() => { this.showModal = false; this.router.navigate(['/dashboard']); }, 1400);
      },
      error: (err) => {
        this.isProcessing = false;
        this.isError = true;
        // Prefer structured server message, but fall back to other fields
        const serverMessage = (err && err.error && (err.error.message || err.error.error)) || err.message || err.statusText || 'Payment failed.';
        this.message = serverMessage;
        console.error('confirm-payment error:', err);
        // If auth error, clear token and redirect to login
        if (err && (err.status === 401 || err.status === 403)) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.router.navigate(['/dashboard']);
  }

  validateInputs(): string | null {
    // card number: digits only, 16 characters
    const card = (this.cardNumber || '').replace(/\s+/g, '');
    if (!/^\d{16}$/.test(card)) {
      return 'Card number must be exactly 16 digits.';
    }

    // expiry date: MM/YY (05/24) and not nonsense month
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.expiryDate || '')) {
      return 'Expiry date must be in MM/YY format.';
    }

    // cvc: 3 digits
    if (!/^\d{3}$/.test(this.cvc || '')) {
      return 'CVC must be exactly 3 digits.';
    }

    return null;
  }
}

