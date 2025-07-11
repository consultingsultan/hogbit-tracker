import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingUp, Flame, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHabit } from '../context';
import { getWeekDates, formatDate, isToday } from '../utils/dateUtils';
import { calculateStreak, calculateLongestStreak, getCompletionRate } from '../utils/streakUtils';
import { usePostHog } from '../hooks/usePostHog';

const ProgressView = ({ onBack }) => {
  const { habits, completions, setCurrentView, user } = useHabit();
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const { capture } = usePostHog();

  const activeHabits = habits.filter(habit => habit.isActive);
  const currentHabit = selectedHabit || activeHabits[0];

  const weekDates = getWeekDates(weekOffset);

  // Track progress view
  useEffect(() => {
    if (user && activeHabits.length > 0) {
      capture('progress_viewed', {
        user_id: user.id,
        total_habits: activeHabits.length,
        selected_habit: currentHabit?.name,
        week_offset: weekOffset,
        view_time: new Date().toISOString()
      });
    }
  }, [user, activeHabits.length, currentHabit?.name, weekOffset, capture]);

  // Check for weekly goal achievement
  useEffect(() => {
    if (currentHabit && weekOffset === 0) {
      const thisWeekCompletions = weekDates.map(date => {
        const dateStr = formatDate(date);
        return completions.some(completion => 
          completion.habitId === currentHabit.id && completion.date === dateStr
        );
      });
      
      const completedDays = thisWeekCompletions.filter(Boolean).length;
      const totalDays = weekDates.filter(date => date <= new Date()).length;
      
      // Track weekly goal if user completed habit every day this week so far
      if (completedDays === totalDays && totalDays >= 7) {
        capture('weekly_goal_achieved', {
          user_id: user?.id,
          habit_name: currentHabit.name,
          completed_days: completedDays,
          week_completion_rate: Math.round((completedDays / 7) * 100),
          achievement_time: new Date().toISOString()
        });
      }
    }
  }, [currentHabit, weekOffset, weekDates, completions, user?.id, capture]);

  const getOverallStats = () => {
    if (!currentHabit) return { streak: 0, longestStreak: 0, completionRate: 0 };
    
    return {
      streak: calculateStreak(completions, currentHabit.id),
      longestStreak: calculateLongestStreak(completions, currentHabit.id),
      completionRate: getCompletionRate(completions, currentHabit.id, 30)
    };
  };

  const stats = getOverallStats();

  const getDayStatus = (date) => {
    if (!currentHabit) return 'inactive';
    
    const dateStr = formatDate(date);
    const isCompleted = completions.some(completion => 
      completion.habitId === currentHabit.id && completion.date === dateStr
    );
    
    if (isCompleted) return 'completed';
    if (isToday(date)) return 'today';
    if (date > new Date()) return 'future';
    return 'missed';
  };

  const getDayStyles = (status) => {
    const baseStyles = 'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200';
    
    switch (status) {
      case 'completed':
        return `${baseStyles} bg-green-500 text-white`;
      case 'today':
        return `${baseStyles} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-2 border-blue-500 dark:border-blue-400`;
      case 'missed':
        return `${baseStyles} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400`;
      case 'future':
        return `${baseStyles} bg-gray-100 dark:bg-dark-border text-gray-400 dark:text-dark-muted`;
      default:
        return `${baseStyles} bg-gray-50 dark:bg-dark-surface text-gray-500 dark:text-dark-muted`;
    }
  };

  const navigateWeek = (direction) => {
    setWeekOffset(prev => prev + direction);
  };

  const getWeekTitle = () => {
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === -1) return 'Last Week';
    if (weekOffset === 1) return 'Next Week';
    return `${Math.abs(weekOffset)} weeks ${weekOffset < 0 ? 'ago' : 'from now'}`;
  };

  if (activeHabits.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center">
          <Target className="w-12 h-12 text-gray-400 dark:text-dark-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">No habits to track</h2>
          <p className="text-gray-600 dark:text-dark-muted mb-4">Add some habits to see your progress here!</p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Progress</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Habit Selector */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-3">Select Habit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeHabits.map(habit => (
              <button
                key={habit.id}
                onClick={() => setSelectedHabit(habit)}
                className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                  currentHabit?.id === habit.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-dark-surface'
                }`}
                style={{ borderLeftColor: habit.color, borderLeftWidth: '4px' }}
              >
                <h3 className="font-medium text-gray-900 dark:text-dark-text">{habit.name}</h3>
                <p className="text-sm text-gray-600 dark:text-dark-muted mt-1">
                  {calculateStreak(completions, habit.id)} day streak
                </p>
              </button>
            ))}
          </div>
        </div>

        {currentHabit && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-dark-muted">Current Streak</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{stats.streak}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-dark-muted">Best Streak</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{stats.longestStreak}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-dark-muted">30-Day Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{stats.completionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Calendar */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Weekly View</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateWeek(-1)}
                    className="p-2 text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-text min-w-[120px] text-center">
                    {getWeekTitle()}
                  </span>
                  <button
                    onClick={() => navigateWeek(1)}
                    className="p-2 text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-dark-muted py-2">
                    {day}
                  </div>
                ))}
                
                {weekDates.map(date => {
                  const status = getDayStatus(date);
                  return (
                    <div key={date.toISOString()} className="text-center">
                      <div className={getDayStyles(status)}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-600 dark:text-dark-muted">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400 rounded"></div>
                  <span className="text-gray-600 dark:text-dark-muted">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded"></div>
                  <span className="text-gray-600 dark:text-dark-muted">Missed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-dark-border rounded"></div>
                  <span className="text-gray-600 dark:text-dark-muted">Future</span>
                </div>
              </div>
            </div>

            {/* Habit Details */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div
                  className="w-4 h-16 rounded-full"
                  style={{ backgroundColor: currentHabit.color }}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
                    {currentHabit.name}
                  </h3>
                  {currentHabit.description && (
                    <p className="text-gray-600 dark:text-dark-muted mb-3">
                      {currentHabit.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-dark-muted">Target:</span>
                      <span className="ml-2 font-medium capitalize text-gray-900 dark:text-dark-text">
                        {currentHabit.targetFrequency}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-dark-muted">Created:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-dark-text">
                        {new Date(currentHabit.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressView;