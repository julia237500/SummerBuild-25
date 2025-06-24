import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../components/Home';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import MyRecipes from '../components/MyRecipes';
import NewRecipe from '../pages/NewRecipe';
import RecipeDetail from '../pages/RecipeDetail';
import RecipeSearch from '../components/RecipeSearch';
import IngredientSubstitutes from '../components/IngredientSubstitutes';
import Profile from '../components/Profile';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import SubscriptionPage from '../SubscriptionPage';
import MealPlanner from '../pages/MealPlanner';
import ContactPage from '../pages/ContactPage';
import MockDataManager from '../components/MockDataManager';
import Community from '../components/Community';

// Route wrapper for authenticated routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/signin" />;
};

// Route wrapper for public routes (signin/signup)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return !user ? children : <Navigate to="/" />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
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
      <Route
        path="/subscription"
        element={<SubscriptionPage />}
        />

      {/* Protected routes */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <RecipeSearch />
          </PrivateRoute>
        }
      />
      <Route
        path="/ingredient-substitutes"
        element={
          <PrivateRoute>
            <IngredientSubstitutes />
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
        path="/meal-planner"
        element={
          <PrivateRoute>
            <MealPlanner />
          </PrivateRoute>
        }
      />
      <Route
        path="/mock-data"
        element={
          <PrivateRoute>
            <MockDataManager />
          </PrivateRoute>
        }
      />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/community" element={<Community />} />
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}