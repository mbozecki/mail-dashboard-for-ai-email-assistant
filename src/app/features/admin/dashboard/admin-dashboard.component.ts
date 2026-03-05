import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart, PieChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { AdminService, AdminMetrics } from '../../../core/services/admin.service';

echarts.use([LineChart, PieChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, SkeletonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  metrics = signal<AdminMetrics | null>(null);
  loading = signal(true);

  pieItems = computed(() => {
    const m = this.metrics();
    if (!m) return [];
    return [
      { name: 'Aktywne',   value: m.activeSubscriptions,   color: '#22c55e' },
      { name: 'Próbne',    value: m.trialingSubscriptions,  color: '#3b82f6' },
      { name: 'Anulowane', value: m.canceledSubscriptions,  color: '#ef4444' },
    ];
  });

  lineOptions = computed(() => {
    const history = this.metrics()?.mrrHistory ?? [];
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1f1f26',
        borderColor: 'rgba(139,92,246,0.24)',
        textStyle: { color: '#f1f0f5', fontSize: 12 },
        padding: [6, 10],
        formatter: (params: { name: string; value: number }[]) =>
          `${params[0].name}: <b>${params[0].value.toLocaleString('pl-PL')} PLN</b>`,
      },
      xAxis: {
        type: 'category',
        data: history.map(h => h.month.slice(0, 7)),
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
        data: history.map(h => h.mrr),
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#8b5cf6', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(139,92,246,0.3)' }, { offset: 1, color: 'rgba(139,92,246,0)' }],
          },
        },
      }],
      grid: { top: 12, right: 10, bottom: 24, left: 48 },
    };
  });

  pieOptions = computed(() => {
    const items = this.pieItems();
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
        data: items.map(i => ({ name: i.name, value: i.value, itemStyle: { color: i.color } })),
        label: { show: false },
        itemStyle: { borderColor: '#111116', borderWidth: 2 },
      }],
    };
  });

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getMetrics().subscribe({
      next: m => { this.metrics.set(m); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
