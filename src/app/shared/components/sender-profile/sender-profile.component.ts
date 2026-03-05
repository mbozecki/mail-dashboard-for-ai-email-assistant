import { Component, signal, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { SkeletonModule } from 'primeng/skeleton';
import { ApiService, Email } from '../../../core/services/api.service';

@Component({
  selector: 'app-sender-profile',
  imports: [CommonModule, DrawerModule, SkeletonModule],
  templateUrl: './sender-profile.component.html',
  styleUrl: './sender-profile.component.scss',
})
export class SenderProfileComponent {
  private api = inject(ApiService);

  public visible = input(false);
  public sender = input('');
  public senderName = input('');
  public visibleChange = output<boolean>();

  public emails = signal<Email[]>([]);
  public total = signal(0);
  public loadingEmails = signal(false);

  constructor() {
    effect(() => {
      if (this.visible() && this.sender()) {
        this.loadEmails();
      }
    });
  }

  public onClose(v: boolean): void {
    this.visibleChange.emit(v);
    if (!v) {
      this.emails.set([]);
      this.total.set(0);
    }
  }

  private loadEmails(): void {
    this.loadingEmails.set(true);
    this.api.getEmails(1, 20, undefined, this.sender()).subscribe({
      next: res => {
        this.emails.set(res.items);
        this.total.set(res.total);
        this.loadingEmails.set(false);
      },
      error: () => this.loadingEmails.set(false),
    });
  }

  public initial(): string {
    if (this.senderName()?.trim()) return this.senderName().trim()[0].toUpperCase();
    return (this.sender() ?? 'U')[0].toUpperCase();
  }

  public avatarColor(): string {
    const palette = ['#6d28d9', '#1d4ed8', '#065f46', '#9a3412', '#1e3a5f', '#4a1d96'];
    let h = 0;
    for (let i = 0; i < this.sender().length; i++) h = (h * 31 + this.sender().charCodeAt(i)) & 0xffff;
    return palette[h % palette.length];
  }

  public dateRange(): string {
    const items = this.emails();
    if (!items.length) return 'ΓÇö';
    const dates = items.map(e => e.date?.slice(0, 10) ?? '').filter(Boolean).sort();
    if (!dates.length) return 'ΓÇö';
    const first = dates[0];
    const last = dates[dates.length - 1];
    return first === last ? first : `${first.slice(0, 7)} ΓÇô ${last.slice(0, 7)}`;
  }
}

