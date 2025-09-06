"use client";

import { useState, useEffect, useCallback } from "react";

// This hook is designed to be safe for server-side rendering by delaying localStorage access until the component has mounted on the client.
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // useEffect only runs on the client, so we can safely access localStorage here.
  useEffect(() => {
    let currentValue;

    try {
      currentValue = JSON.parse(
        window.localStorage.getItem(key) || String(initialValue)
      );
    } catch (error) {
      currentValue = initialValue;
    }
    
    setStoredValue(currentValue);
  }, [key, initialValue]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  }, [key, storedValue]);

  return [storedValue, setValue];
}
