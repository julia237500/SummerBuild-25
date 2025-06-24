// Format difficulty level for display
export const formatDifficulty = (difficulty) => {
  if (!difficulty) return '';
  
  // The database uses capitalized values, so we can return as-is
  return difficulty;
};

// Format cuisine type for display
export const formatCuisineType = (cuisineType) => {
  if (!cuisineType) return '';
  
  return cuisineType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format dietary restriction for display
export const formatDietaryRestriction = (restriction) => {
  if (!restriction) return '';
  
  return restriction
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get difficulty color class
export const getDifficultyColor = (difficulty) => {
  const colors = {
    'Easy': 'bg-green-500',
    'Medium': 'bg-yellow-500', 
    'Hard': 'bg-red-500'
  };
  
  return colors[difficulty] || 'bg-gray-500';
};

// Format cooking time
export const formatCookingTime = (prepTime, cookTime) => {
  if (prepTime && cookTime) {
    return prepTime + cookTime;
  }
  return prepTime || cookTime || 0;
};

// Format calories
export const formatCalories = (calories) => {
  if (!calories) return 'N/A';
  return `${calories} cal`;
}; 