export const STORAGE_KEYS = {
  USER: 'habit-tracker-user',
  HABITS: 'habit-tracker-habits',
  COMPLETIONS: 'habit-tracker-completions',
  SETTINGS: 'habit-tracker-settings',
  USER_REGISTRY: 'habit-tracker-user-registry' // Track all users who have logged in
};

export const loadFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error loading from storage for key ${key}:`, error);
    return null;
  }
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to storage for key ${key}:`, error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from storage for key ${key}:`, error);
    return false;
  }
};

export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

export const exportData = () => {
  const data = {};
  Object.values(STORAGE_KEYS).forEach(key => {
    data[key] = loadFromStorage(key);
  });
  
  return {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    data
  };
};

export const importData = (exportedData) => {
  try {
    if (!exportedData.data) {
      throw new Error('Invalid export data format');
    }
    
    Object.entries(exportedData.data).forEach(([key, value]) => {
      if (Object.values(STORAGE_KEYS).includes(key) && value !== null) {
        saveToStorage(key, value);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export const getStorageSize = () => {
  let total = 0;
  Object.values(STORAGE_KEYS).forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      total += item.length;
    }
  });
  return total;
};

export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// User registry functions for tracking new vs returning users
export const getUserRegistry = () => {
  return loadFromStorage(STORAGE_KEYS.USER_REGISTRY) || {};
};

export const registerUser = (email, userData) => {
  const registry = getUserRegistry();
  const emailKey = email.toLowerCase().trim();
  
  if (!registry[emailKey]) {
    registry[emailKey] = {
      email: emailKey,
      firstLoginAt: new Date().toISOString(),
      sessionCount: 0,
      lastLoginAt: null,
      ...userData
    };
  }
  
  // Update session info
  registry[emailKey].sessionCount += 1;
  registry[emailKey].lastLoginAt = new Date().toISOString();
  registry[emailKey] = { ...registry[emailKey], ...userData };
  
  saveToStorage(STORAGE_KEYS.USER_REGISTRY, registry);
  return registry[emailKey];
};

export const getUserData = (email) => {
  const registry = getUserRegistry();
  const emailKey = email.toLowerCase().trim();
  return registry[emailKey] || null;
};

export const isNewUser = (email) => {
  const userData = getUserData(email);
  return !userData;
};

export const calculateDaysSinceLastLogin = (userData) => {
  if (!userData || !userData.lastLoginAt) return 0;
  
  const lastLogin = new Date(userData.lastLoginAt);
  const now = new Date();
  const diffTime = Math.abs(now - lastLogin);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getSessionStartTime = () => {
  return loadFromStorage('habit-tracker-session-start') || new Date().toISOString();
};

export const setSessionStartTime = (timestamp = new Date().toISOString()) => {
  saveToStorage('habit-tracker-session-start', timestamp);
};

export const calculateSessionDuration = () => {
  const startTime = getSessionStartTime();
  if (!startTime) return 0;
  
  const start = new Date(startTime);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  return Math.floor(diffTime / (1000 * 60)); // duration in minutes
};