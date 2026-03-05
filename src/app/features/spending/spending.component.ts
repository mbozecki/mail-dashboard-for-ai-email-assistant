import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ApiService, SpendingSummary } from '../../core/services/api.service';

echarts.use([BarChart, PieChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-spending',
  imports: [CommonModule, SkeletonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './spending.component.html',
  styleUrl: './spending.component.scss',
})
export class SpendingComponent implements OnInit {
  readonly SELLER_COLORS = ['#7c3aed', '#6d28d9', '#8b5cf6', '#5b21b6', '#4c1d95', '#a78bfa', '#c4b5fd', '#ddd6fe'];

  data = signal<SpendingSummary | null>(null);
  loading = signal(true);

  sellerItems = computed(() => (this.data()?.by_seller ?? []).slice(0, 6));

  barOptions = computed(() => {
    const months = this.data()?.monthly ?? [];
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
        data: months.map(m => m.total),
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
      grid: { top: 12, right: 10, bottom: 24, left: 56 },
    };
  });

  pieOptions = computed(() => {
    const sellers = this.sellerItems();
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1f1f26',
        borderColor: 'rgba(139,92,246,0.24)',
        textStyle: { color: '#f1f0f5', fontSize: 12 },
        padding: [6, 10],
        formatter: (p: { name: string; value: number; percent: number }) =>
          `${p.name}: <b>${p.value.toLocaleString('pl-PL')} PLN</b> (${p.percent}%)`,
      },
      series: [{
        type: 'pie',
        radius: ['44%', '70%'],
        center: ['50%', '50%'],
        data: sellers.map(s => ({ name: s.seller, value: s.total })),
        label: { show: false },
        itemStyle: { borderColor: '#111116', borderWidth: 2 },
        color: this.SELLER_COLORS,
      }],
    };
  });

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getSpending().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
