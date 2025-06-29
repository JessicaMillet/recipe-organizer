import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe, RecipeService } from '../recipe.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
  searchTerm = '';
  isLoggedIn = false;
  loading = false;
  uploading = false;

  imagePreview: string | ArrayBuffer | null = null;
  imageError: string | null = null;

  selectedFile: File | null = null;

  constructor(private recipeService: RecipeService, private router: Router) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;

    if (!this.isLoggedIn) {
      alert('Please login to view recipes.');
      this.router.navigate(['/login']);
      return;
    }

    this.loadRecipes();
  }

  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 2 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        this.imageError = 'Only JPG, PNG, or WebP images are allowed.';
        return;
      }

      if (file.size > maxSize) {
        this.imageError = 'Image is too large. Max 2MB allowed.';
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.imageError = null;
      };
      reader.readAsDataURL(file);
    }
  }

  loadRecipes(): void {
    this.loading = true;
    this.recipeService.getRecipes().subscribe(
      (data) => {
        this.recipes = data;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching recipes:', error);
        this.loading = false;
      }
    );
  }

  addRecipe(form: NgForm): void {
    if (!this.newRecipe.title || !this.newRecipe.ingredients || !this.newRecipe.instructions || !this.selectedFile) {
      alert('All fields and an image are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newRecipe.title);
    formData.append('ingredients', this.newRecipe.ingredients);
    formData.append('instructions', this.newRecipe.instructions);
    formData.append('image', this.selectedFile);

    this.uploading = true;
    this.recipeService.addRecipe(formData).subscribe(
      (res) => {
        alert('Recipe added successfully!');
        this.newRecipe = { title: '', ingredients: '', instructions: '', imageUrl: '' };
        this.imagePreview = null;
        this.imageError = null;
        this.selectedFile = null;
        form.resetForm();
        this.uploading = false;
        this.loadRecipes();
      },
      (error) => {
        console.error('Error adding recipe:', error);
        alert('Failed to add recipe. Please try again.');
        this.uploading = false;
      }
    );
  }

  getImageUrl(recipe: Recipe): string {
    if (!recipe.imagePath) return 'assets/default.jpg';
    if (recipe.imagePath.startsWith('http')) return recipe.imagePath;
    return `https://res.cloudinary.com/dvfbelg1c/image/upload/recipes/${recipe.imagePath}`;
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
        console.error('Error updating recipe:', error);
      }
    );
  }

  deleteRecipe(id: string): void {
    if (confirm('Are you sure you want to delete this recipe?')) {
      this.recipeService.deleteRecipe(id).subscribe(
        () => this.loadRecipes(),
        (error) => console.error('Error deleting recipe:', error)
      );
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}