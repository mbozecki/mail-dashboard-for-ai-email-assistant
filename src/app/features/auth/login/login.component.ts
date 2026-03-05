import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ButtonModule, InputTextModule, PasswordModule,
    MessageModule, DividerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form: FormGroup;
  mode = signal<'password' | 'magic'>('password');
  loading = signal(false);
  error = signal<string | null>(null);
  magicSent = signal(false);
  magicEmail = '';

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  switchMode(m: 'password' | 'magic') {
    this.mode.set(m);
    this.error.set(null);
    this.magicSent.set(false);
  }

  async signIn() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.value;
    const { error } = await this.supabase.signInWithPassword(email, password);
    this.loading.set(false);
    if (error) {
      this.error.set(error.message);
    } else {
      this.router.navigate(['/dashboard/overview']);
    }
  }

  async sendMagicLink() {
    if (!this.magicEmail) return;
    this.loading.set(true);
    this.error.set(null);
    const { error } = await this.supabase.signInWithMagicLink(this.magicEmail);
    this.loading.set(false);
    if (error) {
      this.error.set(error.message);
    } else {
      this.magicSent.set(true);
    }
  }
}