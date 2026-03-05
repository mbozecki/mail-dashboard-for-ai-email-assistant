import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ApiService, Attachment } from '../../core/services/api.service';

@Component({
  selector: 'app-invoices',
  imports: [
    CommonModule, FormsModule,
    TableModule, InputTextModule, SkeletonModule,
    IconFieldModule, InputIconModule,
  ],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
})
export class InvoicesComponent implements OnInit {
  items = signal<Attachment[]>([]);
  total = signal(0);
  grandTotal = computed(() =>
    this.items().reduce((s, i) => s + (i.total_brutto ?? 0), 0)
  );
  sellers = signal<string[]>([]);
  loading = signal(true);
  sellerFilter = '';
  pageSize = 20;
  currentPage = 1;

  private filterTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadItems(); }

  loadItems() {
    this.loading.set(true);
    this.api.getAttachments(this.currentPage, this.pageSize, this.sellerFilter || undefined).subscribe({
      next: res => {
        this.items.set(res.items);
        this.total.set(res.total);
        if (res.sellers?.length) this.sellers.set(res.sellers);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPage(event: { first: number; rows: number }) {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.loadItems();
  }

  onFilter() {
    if (this.filterTimer) clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => { this.currentPage = 1; this.loadItems(); }, 400);
  }

  filterBySeller(seller: string) {
    this.sellerFilter = seller;
    this.currentPage = 1;
    this.loadItems();
  }

  clearFilter() {
    this.sellerFilter = '';
    this.currentPage = 1;
    this.loadItems();
  }
}
