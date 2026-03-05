import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, AdminSidebarComponent],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent {}
