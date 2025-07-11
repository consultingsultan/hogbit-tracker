import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, TrendingUp, Target, Settings, BarChart3, LogOut } from 'lucide-react';
import { useHabit } from '../context';
import { formatDisplayDate } from '../utils/dateUtils';
import { isCompletedToday, getTotalCompletions } from '../utils/streakUtils';
import HabitCard from './HabitCard';
import ThemeToggle from './ThemeToggle';
import { usePostHog } from '../hooks/usePostHog';

const Dashboard = ({ onAddHabit, onEditHabit, onDeleteHabit }) => {
  const { user, habits, completions, setCurrentView, logout } = useHabit();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { capture } = usePostHog();

  const today = useMemo(() => new Date(), []);
  const activeHabits = habits.filter(habit => habit.isActive);
  const completedToday = activeHabits.filter(habit => isCompletedToday(completions, habit.id));
  const totalHabits = activeHabits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday.length / totalHabits) * 100) : 0;
  const allHabitsCompleted = totalHabits > 0 && completedToday.length === totalHabits;

  // Track dashboard view
  useEffect(() => {
    if (user) {
      capture('dashboard_viewed', {
        user_id: user.id,
        total_habits: totalHabits,
        completed_today: completedToday.length,
        completion_rate: completionRate
      });
    }
  }, [user, capture, totalHabits, completedToday.length, completionRate]);

  // Track daily goal achievement
  useEffect(() => {
    if (allHabitsCompleted && totalHabits > 0) {
      capture('daily_goal_achieved', {
        user_id: user?.id,
        total_habits: totalHabits,
        completion_date: formatDisplayDate(today),
        achievement_time: new Date().toISOString()
      });
    }
  }, [allHabitsCompleted, totalHabits, user?.id, capture, today]);

  const handleDeleteHabit = (habitId) => {
    setShowDeleteConfirm(habitId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      const habitToDelete = habits.find(h => h.id === showDeleteConfirm);
      const totalCompletions = habitToDelete ? getTotalCompletions(completions, habitToDelete.id) : 0;
      
      // Track habit deletion
      if (habitToDelete) {
        capture('habit_deleted', {
          user_id: user?.id,
          habit_name: habitToDelete.name,
          habit_color: habitToDelete.color,
          habit_frequency: habitToDelete.targetFrequency,
          total_completions: totalCompletions,
          habit_age_days: Math.floor((new Date() - new Date(habitToDelete.createdAt)) / (1000 * 60 * 60 * 24)),
          deleted_at: new Date().toISOString()
        });
      }
      
      onDeleteHabit(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // Track logout event - this is redundant since logout() already tracks it
    // Removing this to avoid double tracking
    logout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-dark-muted">
                {formatDisplayDate(today)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setCurrentView('progress')}
                className="p-2 text-gray-600 dark:text-dark-muted hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-dark-border rounded-lg transition-colors"
                title="View Progress"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-dark-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={onAddHabit}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Habit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-dark-muted">Total Habits</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{totalHabits}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-dark-muted">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                  {completedToday.length}/{totalHabits}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-dark-muted">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Habits Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">Today's Habits</h2>
          
          {activeHabits.length === 0 ? (
            <div className="card text-center py-12">
              <Target className="w-12 h-12 text-gray-400 dark:text-dark-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">No habits yet</h3>
              <p className="text-gray-600 dark:text-dark-muted mb-4">
                Start building better habits by adding your first one!
              </p>
              <button
                onClick={onAddHabit}
                className="btn-primary"
              >
                Add Your First Habit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onEdit={onEditHabit}
                  onDelete={handleDeleteHabit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {totalHabits > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentView('progress')}
                className="btn-secondary flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Progress
              </button>
              <button
                onClick={onAddHabit}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Habit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button (Mobile) */}
      <button
        onClick={onAddHabit}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 md:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-sm w-full border dark:border-dark-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">Delete Habit</h3>
            <p className="text-gray-600 dark:text-dark-muted mb-4">
              Are you sure you want to delete this habit? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-sm w-full border dark:border-dark-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">Logout</h3>
            <p className="text-gray-600 dark:text-dark-muted mb-4">
              Are you sure you want to logout? This will clear all your data and return you to the welcome screen.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmLogout}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
              <button
                onClick={cancelLogout}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;