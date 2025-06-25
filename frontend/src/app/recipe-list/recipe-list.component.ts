import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService, Recipe } from '../recipe.service';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent {
  recipes: Recipe[] = [];
  newRecipe: Recipe = { title: '', ingredients: '', instructions: '', imageUrl: '' };
  editRecipe: Recipe = { title: '', ingredients: '', instructions: '', imageUrl: '' };
  editingId: string | null = null;
  
  constructor(private recipeService: RecipeService) {
    this.loadRecipes();
  }

  loadRecipes() {
    this.recipeService.getRecipes().subscribe(data => this.recipes = data);
  }

  addRecipe() {
    this.recipeService.addRecipe(this.newRecipe).subscribe(() => {
      this.newRecipe = { title: '', ingredients: '', instructions: '', imageUrl: '' };
      this.loadRecipes();
    });
  }

  deleteRecipe(id: string) {
    this.recipeService.deleteRecipe(id).subscribe(() => this.loadRecipes());
  }

  startEdit(recipe: Recipe) {
    this.editingId = recipe._id!;
    this.editRecipe = { ...recipe };
  }

  cancelEdit() {
    this.editingId = null;
  }

  updateRecipe(recipe: Recipe) {
    if (this.editRecipe._id) {
      this.recipeService.updateRecipe(this.editRecipe).subscribe(() => {
        this.editingId = null;
        this.loadRecipes();
      });
    }
  } 
}