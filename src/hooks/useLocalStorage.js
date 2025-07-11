import { useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storageUtils';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = loadFromStorage(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      saveToStorage(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export const useLocalStorageSync = (key, initialValue) => {
  const [storedValue, setStoredValue] = useLocalStorage(key, initialValue);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, setStoredValue]);

  return [storedValue, setStoredValue];
};

export const useStorageState = (key, initialValue) => {
  const [value, setValue] = useLocalStorage(key, initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const item = loadFromStorage(key);
      if (item !== null) {
        setValue(item);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [key, setValue]);

  const updateValue = (newValue) => {
    try {
      setValue(newValue);
      setError(null);
    } catch (err) {
      setError(err);
    }
  };

  return { value, setValue: updateValue, loading, error };
};