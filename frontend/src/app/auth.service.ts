import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'https://recipe-organizer-production-7491.up.railway.app/api';

    constructor(private http: HttpClient) { }

    register(email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, { email, password });
    }

    login(email: string, password: string): Observable<{ token: string }> {
        return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password });
    }
}