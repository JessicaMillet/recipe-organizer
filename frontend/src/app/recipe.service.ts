import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

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

  constructor(private http: HttpClient) {}

getRecipes(): Observable<Recipe[]> {
  return this.http.get<Recipe[]>(this.apiUrl);
}

addRecipe(recipe: Recipe): Observable<Recipe> {
  return this.http.post<Recipe>(this.apiUrl, recipe);
}

updateRecipe(recipe: Recipe): Observable<Recipe> {
  return this.http.put<Recipe>(`${this.apiUrl}/${recipe._id}`, recipe);
}

deleteRecipe(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
}