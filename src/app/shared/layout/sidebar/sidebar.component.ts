import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { SupabaseService } from '../../../core/services/supabase.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MenuModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  public supabase = inject(SupabaseService);
  private router = inject(Router);

  public navItems: NavItem[] = [
    { label: 'Przegląd',    icon: 'pi-home',        route: '/dashboard/overview' },
    { label: 'Zapytaj AI',  icon: 'pi-comments',    route: '/dashboard/ask' },
    { label: 'Emaile',      icon: 'pi-inbox',       route: '/dashboard/emails' },
    { label: 'Faktury',     icon: 'pi-file-pdf',    route: '/dashboard/invoices' },
    { label: 'Wydatki',     icon: 'pi-chart-bar',   route: '/dashboard/spending' },
    { label: 'Subskrypcja', icon: 'pi-credit-card', route: '/dashboard/subscription' },
    { label: 'Ustawienia',  icon: 'pi-cog',         route: '/dashboard/settings' },
  ];

  public menuItems: MenuItem[] = [
    { label: 'Ustawienia', icon: 'pi pi-cog', routerLink: '/dashboard/settings' },
    { separator: true },
    { label: 'Wyloguj się', icon: 'pi pi-sign-out', command: () => this.signOut() },
  ];

  get isAdmin(): boolean {
    return this.supabase.session()?.user?.user_metadata?.['role'] === 'admin';
  }

  get initials(): string {
    return (this.supabase.userEmail ?? 'U')[0].toUpperCase();
  }

  public async signOut(): Promise<void> {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
