import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AdminService, AdminUser } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  imports: [
    CommonModule, FormsModule,
    TableModule, InputTextModule, ButtonModule,
    TagModule, IconFieldModule, InputIconModule,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  users = signal<AdminUser[]>([]);
  total = signal(0);
  loading = signal(true);
  search = '';
  pageSize = 20;
  currentPage = 1;
  actionLoading: Record<string, boolean> = {};

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading.set(true);
    this.adminService.getUsers(this.currentPage, this.search || undefined).subscribe({
      next: res => { this.users.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(event: { first: number; rows: number }) {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.loadUsers();
  }

  onSearch() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.currentPage = 1; this.loadUsers(); }, 400);
  }

  updateSub(user: AdminUser, action: 'grant' | 'revoke') {
    this.actionLoading[user.id] = true;
    this.adminService.updateSubscription(user.id, action).subscribe({
      next: () => { this.actionLoading[user.id] = false; this.loadUsers(); },
      error: () => { this.actionLoading[user.id] = false; },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Aktywna', trialing: 'Próbna', past_due: 'Zaległa',
      canceled: 'Anulowana', none: 'Brak',
    };
    return map[status] ?? status;
  }

  statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      active: 'success', trialing: 'info', past_due: 'warn',
      canceled: 'danger', none: 'secondary',
    };
    return map[status] ?? 'secondary';
  }
}
