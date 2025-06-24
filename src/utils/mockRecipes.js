import { recipeService } from '../services/recipeService';

export const mockRecipes = [
  {
    name: "Classic Spaghetti Carbonara",
    description: "A traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper. This creamy and flavorful dish is a favorite among pasta lovers.",
    ingredients: [
      { name: "Spaghetti", amount: 400, unit: "g" },
      { name: "Pancetta", amount: 150, unit: "g" },
      { name: "Eggs", amount: 4, unit: "large" },
      { name: "Parmesan cheese", amount: 100, unit: "g" },
      { name: "Black pepper", amount: 2, unit: "tsp" },
      { name: "Salt", amount: 1, unit: "tsp" }
    ],
    instructions: [
      "Bring a large pot of salted water to boil and cook spaghetti according to package directions.",
      "While pasta cooks, cut pancetta into small cubes and cook in a large skillet until crispy.",
      "In a bowl, whisk together eggs, grated parmesan, and black pepper.",
      "Drain pasta, reserving 1 cup of pasta water.",
      "Add hot pasta to the skillet with pancetta, remove from heat.",
      "Quickly stir in egg mixture, adding pasta water as needed for creaminess.",
      "Serve immediately with extra parmesan and black pepper."
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 4,
    difficulty: "Medium",
    cuisine_type: "italian",
    calories_per_serving: 650,
    image_url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500",
    is_private: false
  },
  {
    name: "Chicken Tikka Masala",
    description: "A creamy and aromatic Indian curry dish with tender chicken pieces in a rich tomato-based sauce. Perfect with rice or naan bread.",
    ingredients: [
      { name: "Chicken breast", amount: 600, unit: "g" },
      { name: "Yogurt", amount: 200, unit: "ml" },
      { name: "Tikka masala paste", amount: 3, unit: "tbsp" },
      { name: "Onion", amount: 1, unit: "large" },
      { name: "Garlic", amount: 4, unit: "cloves" },
      { name: "Ginger", amount: 2, unit: "tbsp" },
      { name: "Tomato puree", amount: 400, unit: "ml" },
      { name: "Heavy cream", amount: 200, unit: "ml" },
      { name: "Coriander", amount: 1, unit: "bunch" }
    ],
    instructions: [
      "Marinate chicken in yogurt and 1 tbsp tikka paste for 30 minutes.",
      "Cook chicken in a hot pan until browned, set aside.",
      "Sauté chopped onion, garlic, and ginger until soft.",
      "Add remaining tikka paste and cook for 2 minutes.",
      "Add tomato puree and simmer for 10 minutes.",
      "Return chicken to pan, add cream and simmer for 15 minutes.",
      "Garnish with fresh coriander and serve with rice."
    ],
    prep_time_minutes: 20,
    cook_time_minutes: 30,
    servings: 4,
    difficulty: "Medium",
    cuisine_type: "indian",
    calories_per_serving: 450,
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
    is_private: false
  },
  {
    name: "Quick Breakfast Smoothie Bowl",
    description: "A healthy and colorful breakfast bowl packed with fruits, nuts, and superfoods. Perfect for a nutritious start to your day.",
    ingredients: [
      { name: "Frozen banana", amount: 2, unit: "medium" },
      { name: "Frozen berries", amount: 100, unit: "g" },
      { name: "Greek yogurt", amount: 150, unit: "ml" },
      { name: "Honey", amount: 2, unit: "tbsp" },
      { name: "Granola", amount: 50, unit: "g" },
      { name: "Chia seeds", amount: 1, unit: "tbsp" },
      { name: "Fresh fruits", amount: 100, unit: "g" },
      { name: "Nuts", amount: 30, unit: "g" }
    ],
    instructions: [
      "Blend frozen banana, berries, yogurt, and honey until smooth.",
      "Pour into a bowl and let it thicken for 5 minutes.",
      "Top with granola, chia seeds, fresh fruits, and nuts.",
      "Serve immediately while cold and creamy."
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 2,
    difficulty: "Easy",
    cuisine_type: "american",
    calories_per_serving: 320,
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    is_private: false
  },
  {
    name: "Thai Green Curry",
    description: "A fragrant and spicy Thai curry with vegetables and coconut milk. This vegetarian version is packed with flavor and nutrients.",
    ingredients: [
      { name: "Green curry paste", amount: 3, unit: "tbsp" },
      { name: "Coconut milk", amount: 400, unit: "ml" },
      { name: "Mixed vegetables", amount: 500, unit: "g" },
      { name: "Tofu", amount: 200, unit: "g" },
      { name: "Fish sauce", amount: 2, unit: "tbsp" },
      { name: "Palm sugar", amount: 1, unit: "tbsp" },
      { name: "Thai basil", amount: 1, unit: "handful" },
      { name: "Jasmine rice", amount: 200, unit: "g" }
    ],
    instructions: [
      "Cook jasmine rice according to package instructions.",
      "Heat oil in a wok and fry curry paste until fragrant.",
      "Add coconut milk and bring to a gentle simmer.",
      "Add vegetables and tofu, cook for 8-10 minutes.",
      "Season with fish sauce and palm sugar.",
      "Garnish with Thai basil and serve with rice."
    ],
    prep_time_minutes: 15,
    cook_time_minutes: 20,
    servings: 4,
    difficulty: "Medium",
    cuisine_type: "thai",
    calories_per_serving: 380,
    image_url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500",
    is_private: false
  },
  {
    name: "Chocolate Chip Cookies",
    description: "Classic homemade chocolate chip cookies with crispy edges and chewy centers. A perfect treat for any occasion.",
    ingredients: [
      { name: "All-purpose flour", amount: 250, unit: "g" },
      { name: "Butter", amount: 200, unit: "g" },
      { name: "Brown sugar", amount: 150, unit: "g" },
      { name: "White sugar", amount: 100, unit: "g" },
      { name: "Eggs", amount: 2, unit: "large" },
      { name: "Vanilla extract", amount: 2, unit: "tsp" },
      { name: "Chocolate chips", amount: 200, unit: "g" },
      { name: "Baking soda", amount: 1, unit: "tsp" },
      { name: "Salt", amount: 0.5, unit: "tsp" }
    ],
    instructions: [
      "Preheat oven to 350°F (175°C) and line baking sheets with parchment paper.",
      "Cream butter and sugars until light and fluffy.",
      "Beat in eggs and vanilla extract.",
      "Mix in flour, baking soda, and salt until just combined.",
      "Fold in chocolate chips.",
      "Drop rounded tablespoons of dough onto baking sheets.",
      "Bake for 10-12 minutes until golden brown.",
      "Cool on baking sheets for 5 minutes before transferring to wire racks."
    ],
    prep_time_minutes: 20,
    cook_time_minutes: 12,
    servings: 24,
    difficulty: "Easy",
    cuisine_type: "american",
    calories_per_serving: 180,
    image_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500",
    is_private: false
  },
  {
    name: "Mediterranean Quinoa Salad",
    description: "A refreshing and nutritious salad with quinoa, fresh vegetables, and Mediterranean flavors. Perfect for lunch or as a side dish.",
    ingredients: [
      { name: "Quinoa", amount: 200, unit: "g" },
      { name: "Cherry tomatoes", amount: 200, unit: "g" },
      { name: "Cucumber", amount: 1, unit: "medium" },
      { name: "Red onion", amount: 0.5, unit: "medium" },
      { name: "Kalamata olives", amount: 100, unit: "g" },
      { name: "Feta cheese", amount: 100, unit: "g" },
      { name: "Olive oil", amount: 3, unit: "tbsp" },
      { name: "Lemon juice", amount: 2, unit: "tbsp" },
      { name: "Fresh herbs", amount: 1, unit: "handful" }
    ],
    instructions: [
      "Rinse quinoa and cook according to package instructions.",
      "Let quinoa cool completely.",
      "Chop vegetables and combine in a large bowl.",
      "Add cooled quinoa, olives, and feta cheese.",
      "Whisk together olive oil, lemon juice, and herbs for dressing.",
      "Pour dressing over salad and toss gently.",
      "Season with salt and pepper to taste.",
      "Chill for 30 minutes before serving."
    ],
    prep_time_minutes: 15,
    cook_time_minutes: 20,
    servings: 6,
    difficulty: "Easy",
    cuisine_type: "mediterranean",
    calories_per_serving: 280,
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    is_private: false
  },
  {
    name: "Beef Stir Fry",
    description: "A quick and flavorful stir fry with tender beef, crisp vegetables, and a savory sauce. Ready in under 30 minutes!",
    ingredients: [
      { name: "Beef strips", amount: 400, unit: "g" },
      { name: "Broccoli", amount: 300, unit: "g" },
      { name: "Bell peppers", amount: 2, unit: "medium" },
      { name: "Soy sauce", amount: 3, unit: "tbsp" },
      { name: "Garlic", amount: 3, unit: "cloves" },
      { name: "Ginger", amount: 1, unit: "tbsp" },
      { name: "Cornstarch", amount: 1, unit: "tbsp" },
      { name: "Sesame oil", amount: 1, unit: "tbsp" },
      { name: "Rice", amount: 200, unit: "g" }
    ],
    instructions: [
      "Cook rice according to package instructions.",
      "Marinate beef with soy sauce and cornstarch for 10 minutes.",
      "Heat wok or large pan over high heat.",
      "Stir fry beef until browned, remove from pan.",
      "Add vegetables and stir fry for 3-4 minutes.",
      "Return beef to pan, add garlic and ginger.",
      "Cook for 2 more minutes until everything is heated through.",
      "Serve hot over rice."
    ],
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    servings: 4,
    difficulty: "Medium",
    cuisine_type: "chinese",
    calories_per_serving: 420,
    image_url: "https://images.unsplash.com/photo-1563379091339-03246963d60a?w=500",
    is_private: false
  },
  {
    name: "Homemade Pizza Margherita",
    description: "A classic Italian pizza with fresh mozzarella, tomato sauce, and basil. Simple ingredients that create an amazing flavor.",
    ingredients: [
      { name: "Pizza dough", amount: 1, unit: "ball" },
      { name: "Tomato sauce", amount: 200, unit: "ml" },
      { name: "Fresh mozzarella", amount: 200, unit: "g" },
      { name: "Fresh basil", amount: 1, unit: "handful" },
      { name: "Olive oil", amount: 2, unit: "tbsp" },
      { name: "Garlic", amount: 2, unit: "cloves" },
      { name: "Salt", amount: 1, unit: "tsp" },
      { name: "Black pepper", amount: 1, unit: "tsp" }
    ],
    instructions: [
      "Preheat oven to 450°F (230°C) with pizza stone if available.",
      "Roll out pizza dough on a floured surface.",
      "Spread tomato sauce evenly over dough.",
      "Tear mozzarella into pieces and distribute over sauce.",
      "Drizzle with olive oil and season with salt and pepper.",
      "Bake for 12-15 minutes until crust is golden and cheese is bubbly.",
      "Remove from oven and top with fresh basil leaves.",
      "Let rest for 5 minutes before slicing and serving."
    ],
    prep_time_minutes: 20,
    cook_time_minutes: 15,
    servings: 4,
    difficulty: "Medium",
    cuisine_type: "italian",
    calories_per_serving: 380,
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
    is_private: false
  }
];

export const addMockRecipes = async () => {
  try {
    console.log('Starting to add mock recipes...');
    const results = [];
    
    for (const recipe of mockRecipes) {
      try {
        console.log(`Adding recipe: ${recipe.name}`);
        const createdRecipe = await recipeService.createRecipe(recipe);
        results.push({ success: true, recipe: createdRecipe });
        console.log(`Successfully added: ${recipe.name}`);
      } catch (error) {
        console.error(`Failed to add recipe ${recipe.name}:`, error);
        results.push({ success: false, recipe: recipe.name, error: error.message });
      }
    }
    
    console.log('Finished adding mock recipes');
    return results;
  } catch (error) {
    console.error('Error in addMockRecipes:', error);
    throw error;
  }
};

export const clearMockRecipes = async () => {
  try {
    console.log('Clearing mock recipes...');
    const userRecipes = await recipeService.getUserRecipes();
    
    for (const recipe of userRecipes) {
      if (mockRecipes.some(mock => mock.name === recipe.name)) {
        await recipeService.deleteRecipe(recipe.id);
        console.log(`Deleted: ${recipe.name}`);
      }
    }
    
    console.log('Finished clearing mock recipes');
  } catch (error) {
    console.error('Error clearing mock recipes:', error);
    throw error;
  }
}; 