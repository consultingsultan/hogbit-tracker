import React, { useState } from 'react';
import { X, Palette, Target, Type, FileText } from 'lucide-react';
import { useHabit } from '../context';
import { usePostHog } from '../hooks/usePostHog';

const HABIT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

const AddHabitForm = ({ onClose }) => {
  const { addHabit, user } = useHabit();
  const { capture } = usePostHog();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: HABIT_COLORS[0],
    targetFrequency: 'daily'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Habit name must be at least 2 characters long';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Habit name must be less than 50 characters';
    }
    
    if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const habitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        targetFrequency: formData.targetFrequency
      };
      
      await addHabit(habitData);
      
      // Track habit creation
      capture('habit_created', {
        user_id: user?.id,
        habit_name: habitData.name,
        habit_color: habitData.color,
        habit_frequency: habitData.targetFrequency,
        has_description: habitData.description.length > 0,
        description_length: habitData.description.length,
        created_at: new Date().toISOString()
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding habit:', error);
      setErrors({ submit: 'Failed to add habit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl dark:shadow-slate-900/30 max-w-md w-full max-h-[90vh] overflow-y-auto border dark:border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Add New Habit</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-dark-muted hover:text-gray-600 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Habit Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              <Type className="w-4 h-4" />
              Habit Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-muted ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
              }`}
              placeholder="e.g., Drink 8 glasses of water"
              maxLength={50}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              <FileText className="w-4 h-4" />
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-muted ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
              }`}
              placeholder="Add a description to help you remember why this habit matters"
              rows={3}
              maxLength={200}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-dark-muted ml-auto">
                {formData.description.length}/200
              </p>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              <Palette className="w-4 h-4" />
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {HABIT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                    formData.color === color
                      ? 'border-gray-900 dark:border-dark-text scale-110'
                      : 'border-gray-300 dark:border-dark-border hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>

          {/* Target Frequency */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              <Target className="w-4 h-4" />
              Target Frequency
            </label>
            <select
              name="targetFrequency"
              value={formData.targetFrequency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
              disabled={isSubmitting}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </>
              ) : (
                'Add Habit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitForm;