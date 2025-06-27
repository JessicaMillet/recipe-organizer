import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService, Recipe } from '../recipe.service';
import { Router } from '@angular/router';
import { RecipeFilterPipe } from '../recipe-filter-pipe';


@Component({
  selector: 'app-recipe-list',
  standalone: true,
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
  imports: [CommonModule, FormsModule, RecipeFilterPipe]
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  newRecipe: Recipe = { title: '', ingredients: '', instructions: '', imageUrl: '' };
  editRecipe: Recipe = { title: '', ingredients: '', instructions: '', imageUrl: '' };
  editingId: string | null = null;
  searchTerm: string = '';

  constructor(
    private recipeService: RecipeService,
    private router: Router
  ) { }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to view recipes.');
      this.router.navigate(['/login']);
    } else {
      this.loadRecipes();
    }
  }

  loadRecipes() {
    this.recipeService.getRecipes().subscribe({
      next: (recipes) => this.recipes = recipes,
      error: (err) => alert('Failed to load recipes: ' + err.message)
    });
  }

  addRecipe() {
    this.recipeService.addRecipe(this.newRecipe).subscribe(() => {
      this.newRecipe = { title: '', ingredients: '', instructions: '', imageUrl: '' };
      this.loadRecipes();
    });
  }

  deleteRecipe(id: string) {
    if (confirm('Are you sure you want to delete this recipe?')) {
      this.recipeService.deleteRecipe(id).subscribe(() => this.loadRecipes());
    }
  }

  startEdit(recipe: Recipe) {
    this.editingId = recipe._id!;
    this.editRecipe = { ...recipe };
  }

  cancelEdit() {
    this.editingId = null;
  }

  updateRecipe() {
    if (this.editRecipe._id) {
      this.recipeService.updateRecipe(this.editRecipe._id, this.editRecipe).subscribe({
        next: () => {
          this.editingId = null;
          this.loadRecipes();
        },
        error: (err) => alert('Update failed: ' + err.message)
      });
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
