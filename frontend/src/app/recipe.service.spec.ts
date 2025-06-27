import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecipeService } from './recipe.service';
import { Recipe } from './recipe.service';

describe('RecipeService', () => {
  let service: RecipeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecipeService]
    });

    service = TestBed.inject(RecipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch recipes via GET', () => {
    const dummyRecipes: Recipe[] = [
      { _id: '1', title: 'Recipe 1', ingredients: 'Ing 1', instructions: 'Instr 1', imageUrl: '' },
      { _id: '2', title: 'Recipe 2', ingredients: 'Ing 2', instructions: 'Instr 2', imageUrl: '' },
    ];

    service.getRecipes().subscribe(recipes => {
      expect(recipes.length).toBe(2);
      expect(recipes).toEqual(dummyRecipes);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/recipes');
    expect(req.request.method).toBe('GET');
    req.flush(dummyRecipes); // Mock the HTTP response with dummyRecipes
  });
});
