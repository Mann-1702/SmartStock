import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface UserInfo {
  _id?: string;
  googleId?: string;
  name?: string;
  email?: string;
  role?: string;
  storeId?: string;
  plan?: string;
  skuCount?: number;
}

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
  currentPlan: string | null = null;
  skuCount: number = 0;
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  onPlanClick(event: Event, type: string, addCount?: number): void {
    // If the clicked plan is already active, prevent further action
    if ((type === 'premium' && this.currentPlan === 'premium') || (type === 'free' && this.currentPlan === 'free')) {
      event.preventDefault();
      return;
    }

    // For addons, we navigate to payment with addCount; use Router navigate to ensure query params
    if (type === 'addons') {
      event.preventDefault();
      const ac = addCount || 100;
      this.router.navigate(['/payment'], { queryParams: { type: 'addons', addCount: ac } });
      return;
    }

    // For premium, allow the anchor/routerLink to handle navigation; no extra logic needed here
  }

  ngOnInit(): void {
    this.fetchUser();
    // listen for updates so the page updates dynamically after payment
    window.addEventListener('user-updated', this.onUserUpdated);
  }

  fetchUser(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.currentPlan = null;
      return;
    }
    this.loading = true;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<UserInfo>('http://localhost:3000/auth/user', { headers }).subscribe({
      next: (u) => {
        this.currentPlan = u.plan || 'free';
        this.skuCount = u.skuCount || 0;
        this.loading = false;
      },
      error: (err) => {
        console.warn('Pricing: failed to fetch user', err);
        this.error = 'Could not load current plan.';
        this.loading = false;
      }
    });
  }

  onUserUpdated = () => {
    // small delay to allow backend write to complete
    setTimeout(() => this.fetchUser(), 300);
  }

  ngOnDestroy(): void {
    window.removeEventListener('user-updated', this.onUserUpdated);
  }

}
