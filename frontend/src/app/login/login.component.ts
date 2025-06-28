import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // ✅ Import RouterModule
import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, FormsModule, RouterModule],  // ✅ Add RouterModule here
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/recipes']);
      },
      error: (err) => {
        alert('Login failed: ' + err.error.message);
      }
    });
  }
}