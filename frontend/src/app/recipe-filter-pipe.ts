import { Pipe, PipeTransform } from '@angular/core';
import { Recipe } from './recipe.service';

@Pipe({
  name: 'recipeFilter' // <<< Make sure this name matches!
})
export class RecipeFilterPipe implements PipeTransform {
  transform(recipes: Recipe[], searchTerm: string): Recipe[] {
    if (!recipes || !searchTerm) return recipes;
    return recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}