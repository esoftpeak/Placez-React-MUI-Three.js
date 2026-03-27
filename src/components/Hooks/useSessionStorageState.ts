import { useState, useEffect } from 'react';

export function useSessionStorageState(key, defaultValue) {
  // Initialize state from session storage or use a default value
  const [state, setState] = useState(() => {
    try {
      const storedValue = sessionStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    } catch (e) {
      console.error('Could not read from local storage', e);
      return defaultValue;
    }
  });

  // Update session storage whenever the state changes
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error('Could not write to local storage', e);
    }
  }, [key, state]);

  return [state, setState];
}
