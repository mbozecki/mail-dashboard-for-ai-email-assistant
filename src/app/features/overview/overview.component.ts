import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ApiService, Stats, Email } from '../../core/services/api.service';
import { SenderProfileComponent } from '../../shared/components/sender-profile/sender-profile.component';

echarts.use([BarChart, PieChart, TooltipComponent, GridComponent, CanvasRenderer]);

@Component({
  selector: 'app-overview',
  imports: [CommonModule, RouterLink, SkeletonModule, NgxEchartsDirective, SenderProfileComponent],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  readonly PIE_COLORS = ['#7c3aed', '#6d28d9', '#8b5cf6', '#5b21b6', '#4c1d95', '#a78bfa'];

  stats = signal<Stats | null>(null);
  recentEmails = signal<Email[]>([]);
  loading = signal(true);

  profileVisible = false;
  profileSender = '';
  profileSenderName = '';

  topSender = computed(() => this.stats()?.top_senders?.[0] ?? null);
  topSenderShort = computed(() => {
    const s = this.topSender()?.sender ?? '';
    const at = s.indexOf('@');
    if (at > -1) return s.slice(at + 1).split('.')[0];
    return s.length > 14 ? s.slice(0, 12) + '…' : s;
  });
  latestPeriod = computed(() => {
    const m = this.stats()?.emails_per_month ?? [];
    return m.length ? m[m.length - 1] : null;
  });
  topSendersWithEmail = computed(() =>
    (this.stats()?.top_senders ?? []).slice(0, 5).map(s => ({
      email: s.sender,
      name: this.shortenSender(s.sender),
      value: s.count,
    }))
  );

  barOptions = computed(() => {
    const months = (this.stats()?.emails_per_month ?? []).slice(-12);
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1f1f26',
        borderColor: 'rgba(139,92,246,0.24)',
        textStyle: { color: '#f1f0f5', fontSize: 12 },
        padding: [6, 10],
      },
      xAxis: {
        type: 'category',
        data: months.map(m => m.month.slice(5)),
        axisLine: { lineStyle: { color: 'rgba(139,92,246,0.14)' } },
        axisLabel: { color: '#524f60', fontSize: 11 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(139,92,246,0.06)', type: 'dashed' } },
        axisLabel: { color: '#524f60', fontSize: 11 },
        axisLine: { show: false },
      },
      series: [{
        data: months.map(m => m.count),
        type: 'bar',
        barMaxWidth: 28,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#8b5cf6' }, { offset: 1, color: '#5b21b6' }],
          },
          borderRadius: [3, 3, 0, 0],
        },
      }],
      grid: { top: 12, right: 10, bottom: 24, left: 32 },
    };
  });

  pieOptions = computed(() => {
    const senders = (this.stats()?.top_senders ?? []).slice(0, 5);
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1f1f26',
        borderColor: 'rgba(139,92,246,0.24)',
        textStyle: { color: '#f1f0f5', fontSize: 12 },
        padding: [6, 10],
        formatter: (p: { name: string; value: number; percent: number }) =>
          `${p.name}: <b>${p.value}</b> (${p.percent}%)`,
      },
      series: [{
        type: 'pie',
        radius: ['44%', '70%'],
        center: ['50%', '50%'],
        data: senders.map(s => ({ name: this.shortenSender(s.sender), value: s.count })),
        label: { show: false },
        itemStyle: { borderColor: '#111116', borderWidth: 2 },
        color: this.PIE_COLORS,
      }],
    };
  });

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getStats().subscribe({
      next: s => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.api.getEmails(1, 8).subscribe({
      next: res => this.recentEmails.set(res.items),
    });
  }

  openSenderProfile(sender: string, name: string) {
    this.profileSender = sender;
    this.profileSenderName = name;
    this.profileVisible = true;
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

  shortenSender(email: string): string {
    const at = email.indexOf('@');
    if (at > -1) {
      const local = at > 10 ? email.slice(0, 9) + '…' : email.slice(0, at);
      return `${local}@${email.slice(at + 1).split('.')[0]}`;
    }
    return email.length > 18 ? email.slice(0, 16) + '…' : email;
  }
}
