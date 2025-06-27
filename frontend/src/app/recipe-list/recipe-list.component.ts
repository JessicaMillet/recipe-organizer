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

  constructor(private recipeService: RecipeService, public router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    console.log('Token exists:', this.isLoggedIn);

    if (!this.isLoggedIn) {
      alert('Please login to view recipes.');
      this.router.navigate(['/login']);
      return;
    }

    this.loadRecipes();
  }

  goToLogin(): void {
    console.log('Redirecting to login...');
    this.router.navigate(['/login']);
  }

  loadRecipes(): void {
    this.loading = true;
    console.log('Loading recipes...');
    this.recipeService.getRecipes().subscribe(
      (data) => {
        this.recipes = data;
        console.log('Recipes loaded:', data);
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching recipes:', error);
        this.loading = false;
      }
    );
  }

  addRecipe(): void {
    console.log('Add button clicked. Recipe:', this.newRecipe);
    if (!this.newRecipe.title || !this.newRecipe.ingredients || !this.newRecipe.instructions) {
      console.warn('Missing required fields.');
      return;
    }

    this.recipeService.addRecipe(this.newRecipe).subscribe(
      (res) => {
        console.log('Recipe added:', res);
        this.newRecipe = { title: '', ingredients: '', instructions: '', imageUrl: '' };
        this.loadRecipes();
      },
      (error) => {
        console.error('Error adding recipe:', error);
      }
    );
  }

  startEdit(recipe: Recipe): void {
    console.log('Editing recipe:', recipe);
    this.editingId = recipe._id || null;
    this.editRecipe = { ...recipe };
  }

  cancelEdit(): void {
    console.log('Edit canceled');
    this.editingId = null;
  }

  updateRecipe(): void {
    if (!this.editingId) return;

    console.log('Updating recipe ID:', this.editingId, 'With data:', this.editRecipe);
    this.recipeService.updateRecipe(this.editingId, this.editRecipe).subscribe(
      (res) => {
        console.log('Recipe updated:', res);
        this.editingId = null;
        this.loadRecipes();
      },
      (error) => {
        console.error('Error updating recipe:', error);
      }
    );
  }

  deleteRecipe(id: string): void {
    if (confirm('Are you sure you want to delete this recipe?')) {
      console.log('Deleting recipe with ID:', id);
      this.recipeService.deleteRecipe(id).subscribe(
        (res) => {
          console.log('Recipe deleted:', res);
          this.loadRecipes();
        },
        (error) => {
          console.error('Error deleting recipe:', error);
        }
      );
    }
  }

  logout(): void {
    console.log('Logging out...');
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}