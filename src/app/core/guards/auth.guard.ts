import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  return toObservable(supabase.loading).pipe(
    filter(loading => \!loading),
    take(1),
    map(() => supabase.session() ? true : router.createUrlTree(["'/login'"])),
  );
};
