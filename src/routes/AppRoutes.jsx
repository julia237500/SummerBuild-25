import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import MyRecipes from '../pages/MyRecipes';
import NewRecipe from '../pages/NewRecipe';
import RecipeDetail from '../pages/RecipeDetail';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signin" />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/my-recipes"
        element={
          <PrivateRoute>
            <MyRecipes />
          </PrivateRoute>
        }
      />
      <Route
        path="/new-recipe"
        element={
          <PrivateRoute>
            <NewRecipe />
          </PrivateRoute>
        }
      />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
    </Routes>
  );
} 