import React, { useState, useEffect } from 'react';
import { HabitProvider, useHabit } from './context';
import { ThemeProvider } from './context';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import AddHabitForm from './components/AddHabitForm';
import EditHabitModal from './components/EditHabitModal';
import ProgressView from './components/ProgressView';
import posthog from 'posthog-js';

const AppContent = () => {
  const { user, currentView, setCurrentView, deleteHabit, loading } = useHabit();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const handleAddHabit = () => {
    setShowAddForm(true);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
  };

  const handleDeleteHabit = (habitId) => {
    deleteHabit(habitId);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };

  const handleCloseEditModal = () => {
    setEditingHabit(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-screen">
      {currentView === 'dashboard' && (
        <Dashboard
          onAddHabit={handleAddHabit}
          onEditHabit={handleEditHabit}
          onDeleteHabit={handleDeleteHabit}
        />
      )}
      
      {currentView === 'progress' && (
        <ProgressView onBack={handleBackToDashboard} />
      )}

      {showAddForm && (
        <AddHabitForm onClose={handleCloseAddForm} />
      )}

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};

const App = () => {
return (
    <ThemeProvider>
      <HabitProvider>
        <AppContent />
      </HabitProvider>
    </ThemeProvider>
  );
};

export default App;
