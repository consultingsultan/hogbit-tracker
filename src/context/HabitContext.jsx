import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { STORAGE_KEYS, loadFromStorage, saveToStorage, calculateSessionDuration } from '../utils/storageUtils';
import { formatDate } from '../utils/dateUtils';
import posthog from 'posthog-js';

const HabitContext = createContext();

const initialState = {
  user: null,
  habits: [],
  completions: [],
  currentView: 'dashboard',
  loading: true,
  error: null
};

const habitReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    
    case 'SET_COMPLETIONS':
      return { ...state, completions: action.payload };
    
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'ADD_HABIT': {
      const newHabit = {
        id: Date.now().toString(),
        name: action.payload.name,
        description: action.payload.description || '',
        color: action.payload.color || '#3B82F6',
        targetFrequency: action.payload.targetFrequency || 'daily',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      return { ...state, habits: [...state.habits, newHabit] };
    }
    
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload.id ? { ...habit, ...action.payload } : habit
        )
      };
    
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload),
        completions: state.completions.filter(completion => completion.habitId !== action.payload)
      };
    
    case 'TOGGLE_HABIT_COMPLETION': {
      const { habitId } = action.payload;
      const today = formatDate(new Date());
      const existingCompletion = state.completions.find(
        completion => completion.habitId === habitId && completion.date === today
      );
      
      if (existingCompletion) {
        return {
          ...state,
          completions: state.completions.filter(completion => completion.id !== existingCompletion.id)
        };
      } else {
        const newCompletion = {
          id: Date.now().toString(),
          habitId,
          completedAt: new Date().toISOString(),
          date: today
        };
        return {
          ...state,
          completions: [...state.completions, newCompletion]
        };
      }
    }
    
    case 'ADD_COMPLETION': {
      const completion = {
        id: Date.now().toString(),
        habitId: action.payload.habitId,
        completedAt: new Date().toISOString(),
        date: action.payload.date || formatDate(new Date())
      };
      return { ...state, completions: [...state.completions, completion] };
    }
    
    case 'REMOVE_COMPLETION':
      return {
        ...state,
        completions: state.completions.filter(completion => completion.id !== action.payload)
      };
    
    case 'LOAD_DATA':
      return {
        ...state,
        user: action.payload.user,
        habits: action.payload.habits,
        completions: action.payload.completions,
        loading: false
      };
    
    case 'CLEAR_ALL_DATA':
      return {
        ...initialState,
        loading: false
      };
    
    default:
      return state;
  }
};

export const HabitProvider = ({ children }) => {
  const [state, dispatch] = useReducer(habitReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = loadFromStorage(STORAGE_KEYS.USER);
        const habits = loadFromStorage(STORAGE_KEYS.HABITS) || [];
        const completions = loadFromStorage(STORAGE_KEYS.COMPLETIONS) || [];
        
        dispatch({
          type: 'LOAD_DATA',
          payload: { user, habits, completions }
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (!state.loading && state.user) {
      saveToStorage(STORAGE_KEYS.USER, state.user);
    }
  }, [state.user, state.loading]);

  useEffect(() => {
    if (!state.loading) {
      saveToStorage(STORAGE_KEYS.HABITS, state.habits);
    }
  }, [state.habits, state.loading]);

  useEffect(() => {
    if (!state.loading) {
      saveToStorage(STORAGE_KEYS.COMPLETIONS, state.completions);
    }
  }, [state.completions, state.loading]);

  const actions = {
    setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
    
    addHabit: (habitData) => dispatch({ type: 'ADD_HABIT', payload: habitData }),
    
    updateHabit: (habitData) => dispatch({ type: 'UPDATE_HABIT', payload: habitData }),
    
    deleteHabit: (habitId) => dispatch({ type: 'DELETE_HABIT', payload: habitId }),
    
    toggleHabitCompletion: (habitId) => dispatch({ type: 'TOGGLE_HABIT_COMPLETION', payload: { habitId } }),
    
    addCompletion: (habitId, date) => dispatch({ type: 'ADD_COMPLETION', payload: { habitId, date } }),
    
    removeCompletion: (completionId) => dispatch({ type: 'REMOVE_COMPLETION', payload: completionId }),
    
    setCurrentView: (view) => dispatch({ type: 'SET_CURRENT_VIEW', payload: view }),
    
    clearAllData: () => dispatch({ type: 'CLEAR_ALL_DATA' }),
    
    logout: () => {
      const currentUser = state.user;
      const currentHabits = state.habits;
      
      // Track logout BEFORE clearing data (so we still have user context)
      if (currentUser && typeof window !== 'undefined' && posthog && posthog.__loaded) {
        try {
          // Calculate session completions
          const today = formatDate(new Date());
          const sessionCompletions = state.completions.filter(
            completion => completion.date === today
          ).length;
          
          posthog.capture('user_logged_out', {
            user_email: currentUser.email,
            user_name: currentUser.name,
            user_id: currentUser.id,
            session_duration: calculateSessionDuration(),
            habits_completed_this_session: sessionCompletions,
            total_habits: currentHabits.length,
            logout_timestamp: new Date().toISOString(),
            logout_method: 'manual_button_click'
          });
        } catch (error) {
          console.error('Error tracking logout:', error);
        }
      }
      
      // Clear localStorage (except user registry)
      Object.values(STORAGE_KEYS).forEach(key => {
        if (key !== STORAGE_KEYS.USER_REGISTRY) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear session start time
      localStorage.removeItem('habit-tracker-session-start');
      
      // Reset PostHog AFTER tracking logout event
      setTimeout(() => {
        if (typeof window !== 'undefined' && posthog && posthog.__loaded) {
          try {
            posthog.reset();
          } catch (error) {
            console.error('Error resetting PostHog:', error);
          }
        }
      }, 100);
      
      // Reset state
      dispatch({ type: 'CLEAR_ALL_DATA' });
    },
    
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error })
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
};

// Hook must be imported from ./index.js
export const useHabit = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabit must be used within a HabitProvider');
  }
  return context;
};