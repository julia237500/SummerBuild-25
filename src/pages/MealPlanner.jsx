import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { recipeService } from '../services/recipeService';

// Helper to get days in a month
function getDaysInMonth(year, month) {
  const numDays = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: numDays }, (_, i) => i + 1);
}

// Helper to get weekday (0=Sun, 6=Sat)
function getWeekday(year, month, day) {
  return new Date(year, month, day).getDay();
}

export default function MealPlanner() {
  const { user } = useAuth();
  const today = new Date();
  const [recipes, setRecipes] = useState([]);
  const [planner, setPlanner] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const modalRef = useRef(null);

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

  // Assign recipe to selected date
  const assignRecipe = (recipe) => {
    if (!selectedDate) return;
    setPlanner(prev => ({
      ...prev,
      [selectedDate]: {
        recipeId: recipe.id,
        recipeName: recipe.name || recipe.title,
        recipe
      }
    }));
    setShowRecipePicker(false);
    setSelectedDate(null);
    setToast('Recipe assigned!');
    setTimeout(() => setToast(''), 1500);
  };

  const removeRecipe = (dateKey) => {
    setPlanner(prev => {
      const newPlanner = { ...prev };
      delete newPlanner[dateKey];
      return newPlanner;
    });
    setToast('Recipe removed!');
    setTimeout(() => setToast(''), 1500);
  };

  // Calendar navigation
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  // Helper to get date key (YYYY-MM-DD)
  function getDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // View recipe (open in new tab)
  function viewRecipe(recipeId) {
    window.open(`/recipe/${recipeId}`, '_blank');
  }

  // Calendar rendering
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayWeekday = getWeekday(year, month, 1);
  const calendarRows = [];
  let week = [];
  // Fill empty cells before first day
  for (let i = 0; i < firstDayWeekday; i++) week.push(null);
  daysInMonth.forEach(day => {
    week.push(day);
    if (week.length === 7) {
      calendarRows.push(week);
      week = [];
    }
  });
  if (week.length) {
    while (week.length < 7) week.push(null);
    calendarRows.push(week);
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
        <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            style={{
              background: '#e3f2fd',
              color: '#3498db',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer'
            }}
            onClick={prevMonth}
          >
            &lt; Prev
          </button>
          <span style={{ fontWeight: 700, fontSize: 20 }}>
            {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            style={{
              background: '#e3f2fd',
              color: '#3498db',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer'
            }}
            onClick={nextMonth}
          >
            Next &gt;
          </button>
          <button
            style={{
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 28px',
              fontWeight: 700,
              fontSize: 16,
              marginLeft: 'auto',
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
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <th key={d} style={{
                    padding: 12,
                    background: '#e3f2fd',
                    fontWeight: 700,
                    color: '#222c36',
                    fontSize: 16
                  }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarRows.map((row, i) => (
                <tr key={i}>
                  {row.map((day, j) => {
                    if (!day) {
                      return <td key={j} style={{ background: '#f4f6fa', padding: 16 }} />;
                    }
                    const dateKey = getDateKey(year, month, day);
                    const cell = planner[dateKey];
                    const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                    return (
                      <td
                        key={j}
                        style={{
                          padding: 12,
                          minWidth: 120,
                          minHeight: 80,
                          border: '1px solid #e3f2fd',
                          verticalAlign: 'top',
                          background: isToday ? '#d1eaff' : '#fff',
                          boxShadow: isToday ? '0 0 0 2px #3498db' : undefined,
                          position: 'relative'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#3498db', marginBottom: 6 }}>{day}</div>
                        {cell ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span
                              style={{
                                fontWeight: 600,
                                color: '#3498db',
                                fontSize: 15,
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
                            <button
                              style={{
                                fontSize: 12,
                                color: '#e74c3c',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                textAlign: 'left'
                              }}
                              onClick={() => removeRecipe(dateKey)}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            style={{
                              fontSize: 13,
                              color: '#3498db',
                              background: 'none',
                              border: '1px dashed #3498db',
                              borderRadius: 8,
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              marginTop: 4
                            }}
                            onClick={() => {
                              setSelectedDate(dateKey);
                              setShowRecipePicker(true);
                            }}
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
