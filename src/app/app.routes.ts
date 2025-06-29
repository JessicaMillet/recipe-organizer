import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { RecipeListComponent } from './recipe-list/recipe-list.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },  // default redirect
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'recipes', component: RecipeListComponent },
    // optionally add a wildcard route for 404
    { path: '**', redirectTo: 'login' }
];

