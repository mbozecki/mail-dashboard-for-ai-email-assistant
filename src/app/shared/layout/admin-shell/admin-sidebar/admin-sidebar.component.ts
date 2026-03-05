import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { SupabaseService } from '../../../../core/services/supabase.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive, MenuModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent {
  public supabase = inject(SupabaseService);
  private router = inject(Router);

  public navItems: NavItem[] = [
    { label: 'Dashboard',   icon: 'pi-chart-bar', route: '/admin/dashboard' },
    { label: 'Użytkownicy', icon: 'pi-users',     route: '/admin/users' },
    { label: 'Raporty',     icon: 'pi-file',      route: '/admin/reports' },
  ];

  public menuItems: MenuItem[] = [
    { label: 'Wróć do aplikacji', icon: 'pi pi-arrow-left', routerLink: '/dashboard/overview' },
    { separator: true },
    { label: 'Wyloguj się', icon: 'pi pi-sign-out', command: () => this.signOut() },
  ];

  get initials(): string {
    return (this.supabase.userEmail ?? 'A')[0].toUpperCase();
  }

  public async signOut(): Promise<void> {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
