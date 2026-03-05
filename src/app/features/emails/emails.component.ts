import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ApiService, Email, EmailDetail } from '../../core/services/api.service';

@Component({
  selector: 'app-emails',
  imports: [
    CommonModule, FormsModule,
    TableModule, InputTextModule, ButtonModule,
    DrawerModule, TagModule, SkeletonModule,
    IconFieldModule, InputIconModule,
  ],
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.scss',
})
export class EmailsComponent implements OnInit {
  emails = signal<Email[]>([]);
  total = signal(0);
  loading = signal(true);
  search = '';
  pageSize = 20;
  currentPage = 1;

  drawerOpen = false;
  selectedEmail = signal<EmailDetail | null>(null);
  detailLoading = signal(false);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadEmails(); }

  loadEmails() {
    this.loading.set(true);
    this.api.getEmails(this.currentPage, this.pageSize, this.search || undefined).subscribe({
      next: res => { this.emails.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(event: { first: number; rows: number }) {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.loadEmails();
  }

  onSearch() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.currentPage = 1; this.loadEmails(); }, 400);
  }

  openEmail(email: Email) {
    this.drawerOpen = true;
    this.selectedEmail.set(null);
    this.detailLoading.set(true);
    this.api.getEmail(email.id).subscribe({
      next: d => { this.selectedEmail.set(d); this.detailLoading.set(false); },
      error: () => this.detailLoading.set(false),
    });
  }

  senderColor(email: string): string {
    const p = ['#6d28d9', '#1d4ed8', '#065f46', '#9a3412', '#1e3a5f', '#4a1d96'];
    let h = 0;
    for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) & 0xffff;
    return p[h % p.length];
  }

  senderInitial(email: string, name?: string): string {
    if (name?.trim()) return name.trim()[0].toUpperCase();
    return (email ?? 'U')[0].toUpperCase();
  }
}
