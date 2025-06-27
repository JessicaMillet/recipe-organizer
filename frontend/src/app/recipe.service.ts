import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';  // import environment

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
  private apiUrl = environment.apiUrl;  // use environment.apiUrl here

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getRecipes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recipes`, this.getAuthHeaders());
  }

  addRecipe(recipe: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/recipes`, recipe, this.getAuthHeaders());
  }

  updateRecipe(id: string, recipe: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/recipes/${id}`, recipe, this.getAuthHeaders());
  }

  deleteRecipe(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/recipes/${id}`, this.getAuthHeaders());
  }
}