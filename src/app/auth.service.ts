import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    register(email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, { email, password });
    }

    login(email: string, password: string): Observable<{ token: string }> {
        return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
            tap(res => {
                localStorage.setItem('token', res.token); // ✅ Save the token here
            })
        );
    }
}