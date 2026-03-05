import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const adminGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  if (supabase.session()?.user?.user_metadata?.['role'] === 'admin') return true;
  return router.createUrlTree(['/dashboard/overview']);
};
