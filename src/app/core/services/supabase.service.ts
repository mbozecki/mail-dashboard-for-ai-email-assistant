import { Injectable, signal, inject } from '@angular/core';
import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly supabase: SupabaseClient;
  private router = inject(Router);

  public session = signal<Session | null>(null);
  public loading = signal(true);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
    );

    this.supabase.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.loading.set(false);
    });

    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this.session.set(session);
      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/login']);
      }
    });
  }

  get accessToken(): string | null {
    return this.session()?.access_token ?? null;
  }

  get userEmail(): string | null {
    return this.session()?.user?.email ?? null;
  }

  public async signInWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  public async signInWithMagicLink(email: string) {
    return this.supabase.auth.signInWithOtp({ email });
  }

  public async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
