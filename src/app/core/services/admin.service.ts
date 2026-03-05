import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminMetrics {
  activeSubscriptions: number;
  canceledSubscriptions: number;
  trialingSubscriptions: number;
  mrr: number;
  newSubscriptionsThisMonth: number;
  cancellationsThisMonth: number;
  totalEmailsProcessed: number;
  avgEmailsPerUser: number;
  avgAiCostPerUser: number;
  avgProfitPerUser: number;
  infraCostMonthly: number;
  totalRevenueMonthly: number;
  mrrHistory: { month: string; mrr: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  subscriptionStatus: string;
  emailsProcessed: number;
  aiCostUsd: number;
  createdAt: string;
}

export interface PaginatedAdminUsers {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = environment.apiUrl;
  private http = inject(HttpClient);

  public getMetrics(): Observable<AdminMetrics> {
    return this.http.get<AdminMetrics>(`${this.base}/api/admin/metrics`);
  }

  public getUsers(page = 1, search?: string): Observable<PaginatedAdminUsers> {
    let params = new HttpParams().set('page', page);
    if (search) params = params.set('search', search);
    return this.http.get<PaginatedAdminUsers>(`${this.base}/api/admin/users`, { params });
  }

  public updateSubscription(userId: string, action: 'grant' | 'revoke'): Observable<void> {
    return this.http.patch<void>(`${this.base}/api/admin/users/${userId}/subscription`, { action });
  }

  public exportCsv(from: string, to: string): Observable<Blob> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get(`${this.base}/api/admin/export`, { params, responseType: 'blob' });
  }
}
