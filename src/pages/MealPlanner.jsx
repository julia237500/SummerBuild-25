import React from 'react';
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
  const [search, setSearch] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [customRecipeName, setCustomRecipeName] = useState('');
  const [editCell, setEditCell] = useState(null); // {dateKey, idx}
  const [editValue, setEditValue] = useState('');
  const [unsaved, setUnsaved] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
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
          const plan = await recipeService.getMealPlan();
          // Ensure planner is always an object
          setPlanner(plan && typeof plan === 'object' ? plan : {});
        } catch {
          setPlanner({});
        }
      } else {
        setPlanner({});
      }
    }
    loadRecipes();
    loadPlanner();
  }, [user]);

  useEffect(() => {
    setFilteredRecipes(
      search.trim()
        ? recipes.filter(
            r =>
              (r.name || r.title || '')
                .toLowerCase()
                .includes(search.trim().toLowerCase())
          )
        : recipes
    );
  }, [search, recipes]);

  // Track if navigation is blocked due to unsaved changes
  const [navigationBlocked, setNavigationBlocked] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Save planner to Supabase and reload from DB
  async function savePlannerToDB() {
    if (!user) return;
    setSaving(true);
    try {
      await recipeService.saveMealPlan(planner);
      setUnsaved(false);
      setToast('Meal plan saved!');
      setTimeout(() => setToast(''), 2000);
      // Reload from DB to ensure state matches backend
      const plan = await recipeService.getMealPlan();
      setPlanner(plan && typeof plan === 'object' ? plan : {});
    } catch {
      setToast('Failed to save meal plan');
      setTimeout(() => setToast(''), 2000);
    }
    setSaving(false);
  }

  // Load planner from Supabase on mount and user change
  useEffect(() => {
    async function loadPlanner() {
      if (user) {
        try {
          const plan = await recipeService.getMealPlan();
          setPlanner(plan && typeof plan === 'object' ? plan : {});
        } catch {
          setPlanner({});
        }
      } else {
        setPlanner({});
      }
    }
    loadPlanner();
  }, [user]);

  // Block navigation if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsaved) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // SPA navigation block
    const handlePopState = (e) => {
      if (unsaved) {
        e.preventDefault();
        setNavigationBlocked(true);
        setPendingNavigation(() => () => window.history.go(-1));
        return false;
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [unsaved]);

  // Helper to update planner and sync with Supabase
  const updatePlannerAndSync = async (newPlanner) => {
    setPlanner(newPlanner);
    setUnsaved(true);
  };

  // Assign custom recipe name to selected date
  const assignCustomRecipe = async () => {
    if (!selectedDate || !customRecipeName.trim()) return;
    const prevRecipes = planner[selectedDate]?.recipes || [];
    const newPlanner = {
      ...planner,
      [selectedDate]: {
        recipes: [...prevRecipes, customRecipeName.trim()]
      }
    };
    await updatePlannerAndSync(newPlanner);
    setShowRecipePicker(false);
    setSelectedDate(null);
    setCustomRecipeName('');
    setToast('Recipe assigned!');
    setTimeout(() => setToast(''), 1500);
  };

  // Remove a recipe name from a date and sync with Supabase
  const removeRecipeName = async (dateKey, idx) => {
    const prevRecipes = planner[dateKey]?.recipes || [];
    const newRecipes = prevRecipes.filter((_, i) => i !== idx);
    const newPlanner = { ...planner };
    if (newRecipes.length === 0) {
      delete newPlanner[dateKey];
    } else {
      newPlanner[dateKey] = { recipes: newRecipes };
    }
    await updatePlannerAndSync(newPlanner);
    setToast('Recipe removed!');
    setTimeout(() => setToast(''), 1500);
  };

  // Edit a recipe name and sync with Supabase
  const saveEditRecipeName = async () => {
    if (!editCell || !editValue.trim()) return;
    const prevRecipes = planner[editCell.dateKey]?.recipes || [];
    const newRecipes = prevRecipes.map((r, i) => (i === editCell.idx ? editValue.trim() : r));
    const newPlanner = {
      ...planner,
      [editCell.dateKey]: { recipes: newRecipes }
    };
    await updatePlannerAndSync(newPlanner);
    setEditCell(null);
    setEditValue('');
    setToast('Recipe updated!');
    setTimeout(() => setToast(''), 1500);
  };

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

  // Add another recipe name to a date
  const addAnotherRecipe = (dateKey) => {
    setSelectedDate(dateKey);
    setShowRecipePicker(true);
  };

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

  // Warn user if leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsaved]);

  // Intercept navigation away (SPA) if unsaved
  useEffect(() => {
    const handleRouteChange = (e) => {
      if (unsaved) {
        e.preventDefault();
        setShowUnsavedModal(true);
        setPendingNavigation(() => () => window.history.back());
        return false;
      }
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [unsaved]);

  // Helper to get date key (YYYY-MM-DD)
  function getDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // View recipe (open in new tab)
  function viewRecipe(recipeId) {
    window.open(`/recipe/${recipeId}`, '_blank');
  }

  // Calendar navigation
  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
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
                        {cell && cell.recipes && cell.recipes.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {cell.recipes.map((recipeName, idx) =>
                              editCell && editCell.dateKey === dateKey && editCell.idx === idx ? (
                                <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: 6,
                                      border: '1px solid #e3f2fd',
                                      fontSize: 15
                                    }}
                                    autoFocus
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') saveEditRecipeName();
                                    }}
                                  />
                                  <button
                                    style={{
                                      fontSize: 12,
                                      color: '#4CAF50',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: 0
                                    }}
                                    onClick={saveEditRecipeName}
                                    disabled={!editValue.trim()}
                                  >
                                    Save
                                  </button>
                                  <button
                                    style={{
                                      fontSize: 12,
                                      color: '#e74c3c',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: 0
                                    }}
                                    onClick={() => setEditCell(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <span style={{
                                    fontWeight: 600,
                                    color: '#3498db',
                                    fontSize: 15
                                  }}>
                                    {recipeName}
                                  </span>
                                  <button
                                    style={{
                                      fontSize: 12,
                                      color: '#4CAF50',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: 0
                                    }}
                                    onClick={() => startEditRecipeName(dateKey, idx, recipeName)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    style={{
                                      fontSize: 12,
                                      color: '#e74c3c',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: 0
                                    }}
                                    onClick={() => removeRecipeName(dateKey, idx)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              )
                            )}
                            <button
                              style={{
                                fontSize: 12,
                                color: '#3498db',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                textAlign: 'left'
                              }}
                              onClick={() => addAnotherRecipe(dateKey)}
                            >
                              + Add another recipe
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
            customRecipeName={customRecipeName}
            setCustomRecipeName={setCustomRecipeName}
            assignCustomRecipe={assignCustomRecipe}
            onClose={() => {
              setShowRecipePicker(false);
              setCustomRecipeName('');
            }}
          />
        )}
        {showUnsavedModal && (
          <UnsavedChangesModal
            onSave={async () => {
              await savePlannerToDB();
              setShowUnsavedModal(false);
              setUnsaved(false);
              if (pendingNavigation) pendingNavigation();
            }}
            onDiscard={() => {
              setUnsaved(false);
              setShowUnsavedModal(false);
              if (pendingNavigation) pendingNavigation();
            }}
            onCancel={() => setShowUnsavedModal(false)}
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

// Modal for entering custom recipe name
const MealPlannerModal = React.forwardRef(function MealPlannerModal({ customRecipeName, setCustomRecipeName, assignCustomRecipe, onClose }, ref) {
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
        maxWidth: 400,
        width: '100%',
        boxShadow: '0 4px 24px #0002'
      }}>
        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 18,
          color: '#222c36'
        }}>Assign Recipe Name</h2>
        <input
          type="text"
          placeholder="Enter recipe name..."
          value={customRecipeName}
          onChange={e => setCustomRecipeName(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e3f2fd',
            marginBottom: 16,
            fontSize: 16
          }}
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter') assignCustomRecipe();
          }}
        />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            style={{
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
          <button
            style={{
              background: '#4CAF50',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#fff'
            }}
            onClick={assignCustomRecipe}
            disabled={!customRecipeName.trim()}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
});

// Modal for unsaved changes
function UnsavedChangesModal({ onSave, onDiscard, onCancel }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: 32,
        maxWidth: 400,
        width: '100%',
        boxShadow: '0 4px 24px #0002',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, color: '#e67e22' }}>
          Unsaved Changes
        </h2>
        <p style={{ marginBottom: 24, color: '#333' }}>
          You have unsaved changes in your meal plan. Do you want to save before leaving?
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            style={{
              background: '#4CAF50',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#fff'
            }}
            onClick={onSave}
          >
            Save
          </button>
          <button
            style={{
              background: '#e74c3c',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#fff'
            }}
            onClick={onDiscard}
          >
            Discard
          </button>
          <button
            style={{
              background: '#e3f2fd',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#3498db'
            }}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}