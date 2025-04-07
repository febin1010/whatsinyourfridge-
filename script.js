document.addEventListener('DOMContentLoaded', function() {
    const ingredientInput = document.getElementById('ingredient-input');
    const addIngredientBtn = document.getElementById('add-ingredient');
    const ingredientsList = document.getElementById('ingredients-list');
    const findRecipesBtn = document.getElementById('find-recipes');
    const recipesContainer = document.getElementById('recipes-container');
    const resultsSection = document.getElementById('results-section');
    const loadingElement = document.getElementById('loading');
    const modal = document.getElementById('recipe-modal');
    const closeModal = document.querySelector('.close-modal');
    
    let ingredients = [];
    
    // Add ingredient to the list
    addIngredientBtn.addEventListener('click', function() {
        const ingredient = ingredientInput.value.trim();
        if (ingredient && !ingredients.includes(ingredient.toLowerCase())) {
            ingredients.push(ingredient.toLowerCase());
            renderIngredientsList();
            ingredientInput.value = '';
        }
    });
    
    ingredientInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addIngredientBtn.click();
        }
    });
    
    findRecipesBtn.addEventListener('click', function() {
        if (ingredients.length === 0) {
            alert('Please add at least one ingredient');
            return;
        }
        
        loadingElement.style.display = 'flex';
        resultsSection.style.display = 'none';
        
        fetchRecipes(ingredients)
            .then(recipes => {
                displayRecipes(recipes);
                loadingElement.style.display = 'none';
                resultsSection.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching recipes:', error);
                loadingElement.style.display = 'none';
                alert('Failed to fetch recipes. Please try again later.');
            });
    });
    
    // Close modal when clicking X
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    function renderIngredientsList() {
        ingredientsList.innerHTML = '';
        ingredients.forEach(ingredient => {
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            tag.innerHTML = `
                ${ingredient}
                <button data-ingredient="${ingredient}">&times;</button>
            `;
            ingredientsList.appendChild(tag);
            
            tag.querySelector('button').addEventListener('click', function() {
                ingredients = ingredients.filter(i => i !== ingredient);
                renderIngredientsList();
            });
        });
    }
    
    async function fetchRecipes(ingredients) {
        const apiKey = 'f713b479323b447c981a8499a6e1b386';
        const ingredientsString = ingredients.join(',+');
        const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsString}&number=10&apiKey=${apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching recipes:', error);
            throw error;
        }
    }
    
    function displayRecipes(recipes) {
        recipesContainer.innerHTML = '';
        
        if (recipes.length === 0) {
            recipesContainer.innerHTML = '<p>No recipes found with these ingredients. Try adding more ingredients.</p>';
            return;
        }
        
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                <div class="recipe-info">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span>${recipe.usedIngredientCount} used</span>
                        <span>${recipe.missedIngredientCount} missing</span>
                    </div>
                </div>
            `;
            
            recipeCard.addEventListener('click', () => {
                showRecipeDetails(recipe.id);
            });
            
            recipesContainer.appendChild(recipeCard);
        });
    }
    
    async function showRecipeDetails(recipeId) {
        const apiKey = '2a4d249944b74d2288da87ef5f782c0a';
        const url = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${apiKey}`;
        
        loadingElement.style.display = 'flex';
        modal.style.display = 'none';
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const recipeDetails = await response.json();
            
            // Update modal content
            document.getElementById('modal-recipe-title').textContent = recipeDetails.title;
            document.getElementById('modal-recipe-image').src = recipeDetails.image;
            
            // Clear previous content
            document.getElementById('used-ingredients').innerHTML = '';
            document.getElementById('missing-ingredients').innerHTML = '';
            document.getElementById('recipe-instructions').innerHTML = '';
            
            // Add used ingredients (you might want to filter these based on your original search)
            recipeDetails.extendedIngredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient.original;
                document.getElementById('used-ingredients').appendChild(li);
            });
            
            // Add instructions
            if (recipeDetails.analyzedInstructions && recipeDetails.analyzedInstructions.length > 0) {
                recipeDetails.analyzedInstructions[0].steps.forEach(step => {
                    const li = document.createElement('li');
                    li.textContent = step.step;
                    document.getElementById('recipe-instructions').appendChild(li);
                });
            } else {
                document.getElementById('recipe-instructions').innerHTML = '<li>No instructions available for this recipe.</li>';
            }
            
            loadingElement.style.display = 'none';
            modal.style.display = 'block';
            
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            loadingElement.style.display = 'none';
            alert('Failed to load recipe details. Please try again.');
        }
    }
});