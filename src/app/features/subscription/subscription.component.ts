import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { SubscriptionService, SubscriptionStatus } from '../../core/services/subscription.service';

@Component({
  selector: 'app-subscription',
  imports: [CommonModule, TagModule, ButtonModule, SkeletonModule],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss',
})
export class SubscriptionComponent implements OnInit {
  sub = signal<SubscriptionStatus | null>(null);
  loading = signal(true);
  actionLoading = signal(false);
  showSuccessBanner = signal(false);

  statusLabel = computed(() => {
    const map: Record<string, string> = {
      active: 'Aktywna', trialing: 'Próbna', past_due: 'Zaległa',
      canceled: 'Anulowana', none: 'Brak subskrypcji',
    };
    return map[this.sub()?.status ?? 'none'] ?? 'Nieznany';
  });

  statusSeverity = computed((): 'success' | 'info' | 'warn' | 'danger' | 'secondary' => {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      active: 'success', trialing: 'info', past_due: 'warn',
      canceled: 'danger', none: 'secondary',
    };
    return map[this.sub()?.status ?? 'none'] ?? 'secondary';
  });

  constructor(
    private subscriptionService: SubscriptionService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['payment'] === 'success') {
        this.showSuccessBanner.set(true);
        this.router.navigate([], { replaceUrl: true, queryParams: {} });
      }
    });
    this.loadSubscription();
  }

  loadSubscription() {
    this.loading.set(true);
    this.subscriptionService.getSubscription().subscribe({
      next: s => { this.sub.set(s); this.loading.set(false); },
      error: () => { this.sub.set({ status: 'none' }); this.loading.set(false); },
    });
  }

  subscribe() {
    this.actionLoading.set(true);
    this.subscriptionService.createCheckoutSession().subscribe({
      next: res => { window.location.href = res.checkoutUrl; },
      error: () => this.actionLoading.set(false),
    });
  }

  openPortal() {
    this.actionLoading.set(true);
    this.subscriptionService.createPortalSession().subscribe({
      next: res => { window.location.href = res.portalUrl; },
      error: () => this.actionLoading.set(false),
    });
  }
}
