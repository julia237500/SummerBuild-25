import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../components/Home';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import MyRecipes from '../components/MyRecipes';
import NewRecipe from '../pages/NewRecipe';
import RecipeDetail from '../pages/RecipeDetail';
import RecipeSearch from '../components/RecipeSearch';
import RecipeDetails from '../components/RecipeDetails';
import Favorites from '../components/Favorites';

// Route wrapper for authenticated routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/signin" />;
};

// Route wrapper for public routes (signin/signup)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return !user ? children : <Navigate to="/" />;
};

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public home page */}
      <Route path="/" element={<Home />} />

      {/* Auth routes - redirect to home if already logged in */}
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />

      {/* Protected routes - require authentication */}
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <RecipeSearch />
          </PrivateRoute>
        }
      />
      <Route
        path="/recipe/:id"
        element={
          <PrivateRoute>
            <RecipeDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-recipes"
        element={
          <PrivateRoute>
            <MyRecipes />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-recipes/new"
        element={
          <PrivateRoute>
            <NewRecipe />
          </PrivateRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <PrivateRoute>
            <Favorites />
          </PrivateRoute>
        }
      />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
} 