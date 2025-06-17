import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { recipeService } from '../services/recipeService';

// Days and meal slots
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

export default function MealPlanner() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [planner, setPlanner] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const modalRef = useRef(null);

  // Load recipes and planner from DB
  useEffect(() => {
    async function loadRecipes() {
      if (user) {
        try {
          const data = await recipeService.getUserRecipes();
          setRecipes(data || []);
        } catch {
          setRecipes([]);
        }
      }
    }
    async function loadPlanner() {
      if (user) {
        try {
          const plan = await recipeService.getMealPlan?.();
          if (plan && typeof plan === 'object') setPlanner(plan);
        } catch {}
      }
    }
    loadRecipes();
    loadPlanner();
  }, [user]);

  // Save planner to DB
  async function savePlannerToDB() {
    if (!user) return;
    setSaving(true);
    try {
      await recipeService.saveMealPlan?.(planner);
      setToast('Meal plan saved!');
      setTimeout(() => setToast(''), 2000);
    } catch {
      setToast('Failed to save meal plan');
      setTimeout(() => setToast(''), 2000);
    }
    setSaving(false);
  }

  // Modal accessibility: close on Esc, focus trap
  useEffect(() => {
    if (!showRecipePicker) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setShowRecipePicker(false);
      // Focus trap
      if (modalRef.current && e.key === 'Tab') {
        const focusable = modalRef.current.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showRecipePicker]);

  const handleCellClick = (day, meal) => {
    setSelectedCell({ day, meal });
    setShowRecipePicker(true);
  };

  const assignRecipe = (recipe) => {
    setPlanner(prev => ({
      ...prev,
      [`${selectedCell.day}_${selectedCell.meal}`]: {
        recipeId: recipe.id,
        recipeName: recipe.name || recipe.title,
        recipe
      }
    }));
    setShowRecipePicker(false);
    setSelectedCell(null);
    setToast('Recipe assigned!');
    setTimeout(() => setToast(''), 1500);
  };

  const removeRecipe = (day, meal) => {
    setPlanner(prev => {
      const newPlanner = { ...prev };
      delete newPlanner[`${day}_${meal}`];
      return newPlanner;
    });
    setToast('Recipe removed!');
    setTimeout(() => setToast(''), 1500);
  };

  // Google Calendar Integration (improved date range)
  const addToGoogleCalendar = (day, meal, recipe) => {
    const startDate = getNextDateForDay(day);
    const endDate = getNextDateForDay(day, 1);
    const title = `${meal}: ${recipe.name || recipe.title}`;
    const description = recipe.description || '';
    const url = window.location.origin + `/recipe/${recipe.id}`;
    const details = encodeURIComponent(`${description}\n\nView recipe: ${url}`);
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${details}`;
    window.open(calendarUrl, '_blank');
  };

  // Helper to get next date string for a given day of week (YYYYMMDD)
  function getNextDateForDay(day, offset = 0) {
    const today = new Date();
    const dayIndex = DAYS.indexOf(day);
    const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
    let diff = dayIndex - todayIndex;
    if (diff < 0) diff += 7;
    const target = new Date(today);
    target.setDate(today.getDate() + diff + offset);
    return target.toISOString().slice(0, 10).replace(/-/g, '');
  }

  // Highlight selected cell
  function isSelectedCell(day, meal) {
    return selectedCell && selectedCell.day === day && selectedCell.meal === meal;
  }

  // View recipe (open in new tab)
  function viewRecipe(recipeId) {
    window.open(`/recipe/${recipeId}`, '_blank');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f4f6fa 0%, #e3f2fd 100%)',
      padding: '32px 0'
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 4px 24px #0001',
        padding: 40,
        marginBottom: 40
      }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          marginBottom: 24,
          color: '#222c36',
          letterSpacing: 1
        }}>
          Meal Planner
        </h1>
        <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
          <button
            style={{
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 28px',
              fontWeight: 700,
              fontSize: 16,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px #0001',
              opacity: saving ? 0.7 : 1
            }}
            onClick={savePlannerToDB}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#f9f9f9',
            borderRadius: 12,
            boxShadow: '0 2px 8px #0001',
            marginBottom: 24
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: 16,
                  background: '#e3f2fd',
                  fontWeight: 700,
                  color: '#222c36',
                  fontSize: 18,
                  borderTopLeftRadius: 12
                }}>Day / Meal</th>
                {MEALS.map(meal => (
                  <th key={meal} style={{
                    padding: 16,
                    background: '#e3f2fd',
                    fontWeight: 700,
                    color: '#222c36',
                    fontSize: 18
                  }}>{meal}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, dayIdx) => (
                <tr key={day}>
                  <td style={{
                    padding: 16,
                    fontWeight: 600,
                    background: dayIdx % 2 === 0 ? '#f8fafc' : '#fff',
                    color: '#222c36'
                  }}>{day}</td>
                  {MEALS.map(meal => {
                    const cellKey = `${day}_${meal}`;
                    const cell = planner[cellKey];
                    return (
                      <td
                        key={meal}
                        style={{
                          padding: 16,
                          minWidth: 180,
                          border: '1px solid #e3f2fd',
                          verticalAlign: 'top',
                          background: isSelectedCell(day, meal)
                            ? '#d1eaff'
                            : (dayIdx % 2 === 0 ? '#f8fafc' : '#fff'),
                          boxShadow: isSelectedCell(day, meal) ? '0 0 0 2px #3498db' : undefined
                        }}
                      >
                        {cell ? (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            alignItems: 'flex-start'
                          }}>
                            <span style={{
                              fontWeight: 600,
                              color: '#3498db',
                              fontSize: 16,
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                              tabIndex={0}
                              onClick={() => viewRecipe(cell.recipeId)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') viewRecipe(cell.recipeId);
                              }}
                              aria-label="View recipe"
                            >
                              {cell.recipeName}
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                style={{
                                  fontSize: 13,
                                  color: '#fff',
                                  background: '#4CAF50',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '6px 14px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  boxShadow: '0 1px 4px #0001'
                                }}
                                onClick={() => addToGoogleCalendar(day, meal, cell.recipe)}
                              >
                                Add to Google Calendar
                              </button>
                              <button
                                style={{
                                  fontSize: 13,
                                  color: '#fff',
                                  background: '#e74c3c',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '6px 14px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  boxShadow: '0 1px 4px #0001'
                                }}
                                onClick={() => removeRecipe(day, meal)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            style={{
                              fontSize: 14,
                              color: '#3498db',
                              background: 'none',
                              border: '1px dashed #3498db',
                              borderRadius: 8,
                              padding: '10px 18px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              transition: 'background 0.2s'
                            }}
                            onClick={() => handleCellClick(day, meal)}
                          >
                            Assign Recipe
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recipe Picker Modal */}
        {showRecipePicker && (
          <MealPlannerModal
            ref={modalRef}
            recipes={recipes}
            assignRecipe={assignRecipe}
            onClose={() => setShowRecipePicker(false)}
          />
        )}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#4CAF50',
            color: '#fff',
            padding: '14px 32px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            boxShadow: '0 2px 8px #0002',
            zIndex: 3000
          }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

// Modal extracted for accessibility and reusability
const MealPlannerModal = React.forwardRef(function MealPlannerModal({ recipes, assignRecipe, onClose }, ref) {
  useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus();
    }
  }, [ref]);
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: 32,
        maxWidth: 500,
        width: '100%',
        boxShadow: '0 4px 24px #0002'
      }}>
        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 18,
          color: '#222c36'
        }}>Select a Recipe</h2>
        <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 18 }}>
          {recipes.length === 0 ? (
            <div style={{ color: '#888' }}>No recipes found.</div>
          ) : (
            recipes.map(recipe => (
              <div
                key={recipe.id}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  color: '#3498db',
                  fontWeight: 600,
                  fontSize: 16
                }}
                tabIndex={0}
                onClick={() => assignRecipe(recipe)}
                onKeyDown={e => {
                  if (e.key === 'Enter') assignRecipe(recipe);
                }}
                aria-label={`Assign ${recipe.name || recipe.title}`}
              >
                {recipe.name || recipe.title}
              </div>
            ))
          )}
        </div>
        <button
          style={{
            marginTop: 8,
            background: '#e3f2fd',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            cursor: 'pointer',
            fontWeight: 600,
            color: '#3498db'
          }}
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
});
