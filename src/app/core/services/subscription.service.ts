import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SubscriptionStatus {
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'none';
  currentPeriodEnd?: string;
  pricePerMonth?: number;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface PortalSessionResponse {
  portalUrl: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private base = environment.apiUrl;
  private http = inject(HttpClient);

  public getSubscription(): Observable<SubscriptionStatus> {
    return this.http.get<SubscriptionStatus>(`${this.base}/api/stripe/subscription`);
  }

  public createCheckoutSession(): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(`${this.base}/api/stripe/create-checkout-session`, {});
  }

  public createPortalSession(): Observable<PortalSessionResponse> {
    return this.http.post<PortalSessionResponse>(`${this.base}/api/stripe/portal-session`, {});
  }
}
