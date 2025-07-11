import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useHabit } from '../context';
import ThemeToggle from './ThemeToggle';
import { usePostHog } from '../hooks/usePostHog';
import { 
  getUserData, 
  isNewUser, 
  registerUser, 
  calculateDaysSinceLastLogin, 
  setSessionStartTime 
} from '../utils/storageUtils';

const WelcomeScreen = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useHabit();
  const { capture, identify } = usePostHog();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const emailKey = formData.email.toLowerCase().trim();
      const existingUserData = getUserData(emailKey);
      const isFirstTime = isNewUser(emailKey);
      
      // Set session start time
      setSessionStartTime();
      
      // Register or update user in registry
      const registryData = registerUser(emailKey, {
        name: formData.name.trim(),
        email: emailKey
      });
      
      const userId = `user_${emailKey.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      const user = {
        id: userId,
        name: formData.name.trim(),
        email: emailKey,
        createdAt: new Date().toISOString()
      };
      
      // Always identify user with email as distinct ID
      identify(emailKey, {
        email: emailKey,
        name: formData.name.trim(),
        user_type: isFirstTime ? 'new_user' : 'returning_user',
        login_timestamp: new Date().toISOString(),
        total_previous_sessions: registryData.sessionCount || 1,
        first_login_at: registryData.firstLoginAt,
        last_login_at: registryData.lastLoginAt
      });
      
      // Track appropriate events based on user type
      if (isFirstTime) {
        capture('user_onboarded', {
          user_email: emailKey,
          user_name: formData.name.trim(),
          onboarding_completed_at: new Date().toISOString(),
          registration_method: 'email_entry',
          name_length: formData.name.length,
          email_domain: emailKey.split('@')[1]
        });
      } else {
        capture('user_returned', {
          user_email: emailKey,
          user_name: formData.name.trim(),
          return_login_at: new Date().toISOString(),
          days_since_last_login: calculateDaysSinceLastLogin(existingUserData),
          total_sessions: registryData.sessionCount,
          first_login_at: registryData.firstLoginAt
        });
      }
      
      // Always track session start
      capture('user_session_started', {
        user_email: emailKey,
        session_type: isFirstTime ? 'first_time' : 'returning',
        login_method: 'email_entry',
        session_count: registryData.sessionCount
      });
      
      setUser(user);
      
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-dark-bg dark:to-slate-800 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full bg-white dark:bg-dark-surface rounded-2xl shadow-xl dark:shadow-slate-900/30 p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <img 
              src="https://emoji.slack-edge.com/TSS5W8YQZ/hog-excited/8999998a2f173796.gif" 
              alt="Hogbit Tracker" 
              className="w-16 h-16 rounded-full"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
            Welcome to Hogbit Tracker
          </h1>
          <p className="text-gray-600 dark:text-dark-muted mb-6">
            Start building better habits today. Track your progress, build streaks, and achieve your goals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="text-left">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                What's your name?
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-muted ${
                  errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-border'
                }`}
                placeholder="Enter your name"
                maxLength={50}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="text-left">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                What's your email address?
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-muted ${
                  errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-border'
                }`}
                placeholder="Enter your email"
                maxLength={100}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {errors.general && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {errors.general}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Setting up...
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-dark-muted mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Features you'll love</span>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 dark:text-dark-muted">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Track daily habits effortlessly</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Build and maintain streaks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Visualize your progress</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default WelcomeScreen;
