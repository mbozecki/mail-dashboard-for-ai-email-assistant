import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { SupabaseService } from '../../core/services/supabase.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface HealthStatus { status: string; imap_watchers: number; telegram: boolean; }

@Component({
  selector: 'app-settings',
  imports: [CommonModule, ButtonModule, SkeletonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  health = signal<HealthStatus | null>(null);
  healthLoading = signal(false);

  constructor(
    public supabase: SupabaseService,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() { this.loadHealth(); }

  loadHealth() {
    this.healthLoading.set(true);
    this.http.get<HealthStatus>(`${environment.apiUrl}/health`).subscribe({
      next: h => { this.health.set(h); this.healthLoading.set(false); },
      error: () => { this.health.set(null); this.healthLoading.set(false); },
    });
  }

  async signOut() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
