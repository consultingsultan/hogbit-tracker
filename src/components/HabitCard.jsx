import React, { useState } from 'react';
import { Check, Edit2, Trash2, Flame, Calendar, TrendingUp } from 'lucide-react';
import { useHabit } from '../context';
import { calculateStreak, isCompletedToday, getCompletionRate } from '../utils/streakUtils';
import { usePostHog } from '../hooks/usePostHog';

const HabitCard = ({ habit, onEdit, onDelete }) => {
  const { completions, toggleHabitCompletion, user } = useHabit();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { capture } = usePostHog();

  const isCompleted = isCompletedToday(completions, habit.id);
  const currentStreak = calculateStreak(completions, habit.id);
  const completionRate = getCompletionRate(completions, habit.id, 30);

  const handleToggleCompletion = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    
    try {
      const previousStreak = currentStreak;
      await toggleHabitCompletion(habit.id);
      
      if (!isCompleted) {
        // Calculate new streak after completion
        const newStreak = previousStreak + 1;
        
        // Track habit completion
        capture('habit_completed', {
          user_id: user?.id,
          habit_name: habit.name,
          habit_color: habit.color,
          habit_frequency: habit.targetFrequency,
          streak_count: newStreak,
          completion_time: new Date().toISOString(),
          completion_rate: completionRate
        });
        
        // Check for streak milestones
        const milestones = [3, 7, 14, 30, 50, 100];
        if (milestones.includes(newStreak)) {
          capture('streak_milestone', {
            user_id: user?.id,
            habit_name: habit.name,
            milestone_days: newStreak,
            achievement_time: new Date().toISOString(),
            habit_color: habit.color
          });
        }
        
        const card = document.getElementById(`habit-card-${habit.id}`);
        if (card) {
          card.classList.add('celebration');
          setTimeout(() => {
            card.classList.remove('celebration');
          }, 300);
        }
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    } finally {
      setTimeout(() => setIsCompleting(false), 200);
    }
  };

  const handleEdit = () => {
    setShowActions(false);
    onEdit(habit);
  };

  const handleDelete = () => {
    setShowActions(false);
    onDelete(habit.id);
  };

  return (
    <div
      id={`habit-card-${habit.id}`}
      className="habit-card relative group"
      style={{ borderLeft: `4px solid ${habit.color}` }}
    >
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={() => setShowActions(!showActions)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border"
        >
          <Edit2 className="w-4 h-4 text-gray-400 dark:text-dark-muted" />
        </button>
        
        {showActions && (
          <div className="absolute top-8 right-0 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg dark:shadow-slate-900/30 py-1 z-10">
            <button
              onClick={handleEdit}
              className="w-full px-3 py-1 text-left text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border flex items-center gap-2"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-3 py-1 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Habit content */}
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={handleToggleCompletion}
          disabled={isCompleting}
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isCompleted
              ? 'bg-success border-success text-white'
              : 'border-gray-300 dark:border-dark-border hover:border-gray-400 dark:hover:border-gray-500'
          } ${isCompleting ? 'scale-90' : 'hover:scale-105'}`}
        >
          {isCompleting ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            isCompleted && <Check className="w-4 h-4" />
          )}
        </button>

        {/* Habit details */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 dark:text-dark-text mb-1 ${isCompleted ? 'line-through text-gray-500 dark:text-dark-muted' : ''}`}>
            {habit.name}
          </h3>
          
          {habit.description && (
            <p className="text-sm text-gray-600 dark:text-dark-muted mb-2">
              {habit.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-dark-muted">
            {/* Streak */}
            <div className="flex items-center gap-1">
              <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-dark-muted'}`} />
              <span className={`font-medium ${currentStreak > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-dark-muted'}`}>
                {currentStreak} day{currentStreak !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Completion rate */}
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">
                {completionRate}%
              </span>
            </div>

            {/* Target frequency */}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="capitalize">
                {habit.targetFrequency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 bg-gray-200 dark:bg-dark-border rounded-full h-2">
        <div
          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      {/* Completion celebration overlay */}
      {isCompleted && (
        <div className="absolute inset-0 bg-success bg-opacity-5 dark:bg-opacity-10 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default HabitCard;