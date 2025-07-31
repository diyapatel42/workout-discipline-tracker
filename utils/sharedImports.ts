/**
 * Centralized imports for the Workout Discipline Tracker
 * 
 * This file provides a single source of imports for commonly used
 * React hooks, components, and utilities across the application.
 */

// React imports
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// Next.js imports
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Export common React hooks
export {
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  useCallback,
  Link,
  Image,
  useRouter
};

// App-specific utility functions
export function useFormattedDate() {
  return () => new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

// Workout timer hook
export function useWorkoutTimer() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  const startTimer = useCallback(() => {
    if (!isActive) {
      const startTime = Date.now() - elapsedTime * 1000;
      setIsActive(true);
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
  }, [elapsedTime, isActive]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsActive(false);
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsedTime(0);
  }, [stopTimer]);

  // Format time as mm:ss or hh:mm:ss
  const formatTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    elapsedTime,
    isActive,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime
  };
}
