import { Component } from '@angular/core';
import { RecipeListComponent } from './recipe-list/recipe-list.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RecipeListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  protected title = 'frontend';
}
