import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { AdminService } from '../../../core/services/admin.service';

interface ReportData {
  revenue: number;
  newSubscriptions: number;
  cancellations: number;
}

@Component({
  selector: 'app-admin-reports',
  imports: [CommonModule, FormsModule, ButtonModule, DatePickerModule, TagModule],
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.scss',
})
export class AdminReportsComponent implements OnInit {
  fromDate: Date | null = null;
  toDate: Date | null = null;
  exportLoading = signal(false);
  report = signal<ReportData | null>(null);

  churnRate = computed(() => {
    const r = this.report();
    if (!r) return 0;
    const base = r.newSubscriptions + r.cancellations;
    return base === 0 ? 0 : (r.cancellations / base) * 100;
  });

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    const now = new Date();
    this.fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  private toDateString(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  exportCsv() {
    if (!this.fromDate || !this.toDate) return;
    const from = this.toDateString(this.fromDate);
    const to = this.toDateString(this.toDate);
    this.exportLoading.set(true);
    this.adminService.exportCsv(from, to).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${from}_${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.exportLoading.set(false);
      },
      error: () => this.exportLoading.set(false),
    });
  }
}
