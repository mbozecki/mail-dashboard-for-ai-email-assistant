import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, ButtonModule, MenuModule],
  template: `
    <header class="flex items-center justify-between px-6 h-14 border-b shrink-0"
            style="background: var(--p-surface-50); border-color: var(--p-surface-200)">

      <div></div>

      <div class="flex items-center gap-3">
        <span class="text-sm hidden sm:block" style="color: var(--p-surface-500)">
          {{ supabase.userEmail }}
        </span>
        <div (click)="menu.toggle($event)"
             style="width:32px;height:32px;border-radius:50%;background:var(--p-primary-600);color:white;
                    display:flex;align-items:center;justify-content:center;font-size:13px;
                    font-weight:600;cursor:pointer;user-select:none">
          {{ initials }}
        </div>
        <p-menu #menu [model]="menuItems" [popup]="true" />
      </div>
    </header>
  `,
})
export class TopbarComponent {
  public supabase = inject(SupabaseService);
  private router = inject(Router);

  public menuItems: MenuItem[] = [
    { label: 'Settings', icon: 'pi pi-cog', routerLink: '/dashboard/settings' },
    { separator: true },
    { label: 'Sign out', icon: 'pi pi-sign-out', command: () => this.signOut() },
  ];

  get initials(): string {
    const email = this.supabase.userEmail ?? '';
    return email.charAt(0).toUpperCase() || 'U';
  }

  public async signOut(): Promise<void> {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
