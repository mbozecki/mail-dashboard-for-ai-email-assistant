import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Stats {
  email_count: number;
  attachment_count: number;
  active_draft: unknown | null;
  emails_per_month: { month: string; count: number }[];
  top_senders: { sender: string; count: number }[];
}

export interface Email {
  id: string;
  sender: string;
  sender_name: string;
  subject: string;
  date: string;
  doc_type: string;
  direction: string;
}

export interface EmailDetail extends Email {
  recipient: string;
  content: string;
  message_id: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  file_name: string;
  doc_type: string;
  seller: string;
  seller_nip: string;
  invoice_number: string;
  invoice_date: string;
  total_brutto: number | null;
  total_netto: number | null;
  vat_amount: number | null;
  payment_date: string;
  message_id: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AttachmentResponse extends PaginatedResponse<Attachment> {
  sellers: string[];
}

export interface AskResponse {
  question: string;
  answer: string;
  sources: { doc_type: string; seller?: string; sender?: string; date?: string }[];
}

export interface SpendingSummary {
  total_pln: number;
  invoice_count: number;
  avg_monthly_pln: number;
  top_seller: string | null;
  monthly: { month: string; total: number; count: number }[];
  by_seller: { seller: string; total: number; count: number }[];
  by_doc_type: { doc_type: string; total: number; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  private http = inject(HttpClient);

  public getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.base}/api/stats`);
  }

  public getEmails(page = 1, pageSize = 20, search?: string, sender?: string): Observable<PaginatedResponse<Email>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (search) params = params.set('search', search);
    if (sender) params = params.set('sender', sender);
    return this.http.get<PaginatedResponse<Email>>(`${this.base}/api/emails`, { params });
  }

  public getEmail(id: string): Observable<EmailDetail> {
    return this.http.get<EmailDetail>(`${this.base}/api/emails/${id}`);
  }

  public getAttachments(page = 1, pageSize = 20, seller?: string): Observable<AttachmentResponse> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (seller) params = params.set('seller', seller);
    return this.http.get<AttachmentResponse>(`${this.base}/api/attachments`, { params });
  }

  public getSpending(): Observable<SpendingSummary> {
    return this.http.get<SpendingSummary>(`${this.base}/api/spending`);
  }

  public ask(question: string): Observable<AskResponse> {
    return this.http.post<AskResponse>(`${this.base}/api/ask`, { question });
  }
}
