import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe, RecipeService } from '../recipe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeFilterPipe } from '../recipe-filter-pipe';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RecipeFilterPipe],
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  newRecipe: Recipe = { title: '', ingredients: '', instructions: '', imageUrl: '' };
  editRecipe: Recipe = { title: '', ingredients: '', instructions: '', imageUrl: '' };
  editingId: string | null = null;
  searchTerm: string = '';
  isLoggedIn: boolean = false;
  loading = false;

  constructor(private recipeService: RecipeService, public router: Router) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;

    if (!this.isLoggedIn) {
      alert('Please login to view recipes.');
      this.router.navigate(['/login']);
      return; //  Prevent loading data if not logged in
    }

    this.loadRecipes(); //  Properly call outside method
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  loadRecipes(): void {
    this.loading = true;
    this.recipeService.getRecipes().subscribe(
      (data) => {
        this.recipes = data;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching recipes', error);
        this.loading = false;
      }
    );
  }

  addRecipe(): void {
    if (!this.newRecipe.title || !this.newRecipe.ingredients || !this.newRecipe.instructions) return;

    this.recipeService.addRecipe(this.newRecipe).subscribe(
      () => {
        this.newRecipe = { title: '', ingredients: '', instructions: '', imageUrl: '' };
        this.loadRecipes();
      },
      (error) => {
        console.error('Error adding recipe', error);
      }
    );
  }

  startEdit(recipe: Recipe): void {
    this.editingId = recipe._id || null;
    this.editRecipe = { ...recipe };
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  updateRecipe(): void {
    if (!this.editingId) return;

    this.recipeService.updateRecipe(this.editingId, this.editRecipe).subscribe(
      () => {
        this.editingId = null;
        this.loadRecipes();
      },
      (error) => {
        console.error('Error updating recipe', error);
      }
    );
  }

  deleteRecipe(id: string): void {
    if (confirm('Are you sure you want to delete this recipe?')) {
      this.recipeService.deleteRecipe(id).subscribe(
        () => this.loadRecipes(),
        (error) => {
          console.error('Error deleting recipe', error);
        }
      );
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}