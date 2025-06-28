import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';  // uses apiUrl from correct env

export interface Recipe {
  _id?: string;
  title: string;
  ingredients: string;
  instructions: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // LOGIN
  login(userData: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, userData);
  }

  // REGISTER
  register(userData: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // GET RECIPES
  getRecipes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recipes`, this.getAuthHeaders());
  }

  // ADD RECIPE
  addRecipe(recipe: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/recipes`, recipe, this.getAuthHeaders());
  }

  // UPDATE RECIPE
  updateRecipe(id: string, recipe: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/recipes/${id}`, recipe, this.getAuthHeaders());
  }

  // DELETE RECIPE
  deleteRecipe(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/recipes/${id}`, this.getAuthHeaders());
  }
}