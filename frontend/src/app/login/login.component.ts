import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, FormsModule] //  required for [(ngModel)]
})

export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token); // Store token
        alert('Login successful!');
        this.router.navigate(['/recipes']); // Navigate to recipe list
      },
      error: (err) => {
        console.error('Login error:', err); // ← log entire error
        alert('Login failed: ' + (err.error?.message || 'Server unreachable or unexpected error.'));
      }
    });
  }
}