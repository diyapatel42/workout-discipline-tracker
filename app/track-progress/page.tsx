"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import AuthCheck from "@/components/AuthCheck";

type SetRep = {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
};

type Exercise = {
  id: string;
  name: string;
  notes?: string;
  setsReps: SetRep[];
};

type WorkoutSet = {
  id: string;
  name: string;
  exercises: Exercise[];
};

export default function TrackProgress() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Timer and active workout states
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Workout summary states
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<{
    duration: number;
    totalExercises: number;
    totalSets: number;
    totalReps: number;
    totalWeight: number;
    completedExercises: {
      name: string;
      sets: number;
      reps: number;
      weight: number;
      formatted: string;
    }[];
  }>({
    duration: 0,
    totalExercises: 0,
    totalSets: 0,
    totalReps: 0,
    totalWeight: 0,
    completedExercises: [],
  });
  
  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Import the auth utility here to avoid SSR issues
      const { auth } = await import('@/utils/auth');
      
      // Call logout method
      await auth.logout();
      
      // Redirect to the logout page
      router.push('/logout');
    } catch (error) {
      console.error('Error during logout:', error);
      // If there's an error, still redirect to home
      router.push('/');
    }
  };
  
  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Start workout timer
  const startWorkout = (workoutId: string) => {
    if (activeWorkoutId) return; // Don't start if already active
    
    const startTime = Date.now();
    setWorkoutStartTime(startTime);
    setActiveWorkoutId(workoutId);
    setElapsedTime(0);
    
    // Start interval to update timer
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    setTimerInterval(interval);
  };

  // End workout timer and calculate workout summary
  const finishWorkout = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Keep the final time displayed
    const finalTime = elapsedTime;
    
    // Calculate workout statistics
    let totalExercises = 0;
    let totalSets = 0;
    let totalReps = 0;
    let totalWeight = 0;
    const completedExercises: { 
      name: string; 
      sets: number; 
      reps: number; 
      weight: number;
      formatted: string;
    }[] = [];
    
    // Find the active workout set
    const activeWorkout = workoutSets.find(set => set.id === activeWorkoutId);
    
    if (activeWorkout) {
      // Process each exercise
      activeWorkout.exercises.forEach(exercise => {
        // Only count exercises with at least one completed set
        const completedSets = exercise.setsReps.filter(set => set.completed);
        
        if (completedSets.length > 0) {
          totalExercises++;
          
          // Calculate stats for this exercise
          const exerciseSets = completedSets.length;
          
          // Calculate total weight for each completed set individually
          let exerciseTotalWeight = 0;
          let exerciseTotalReps = 0;
          
          // Handle potentially different weights and reps across sets
          completedSets.forEach(set => {
            exerciseTotalReps += set.reps;
            exerciseTotalWeight += set.reps * set.weight;
          });
          
          // Use the first set's values for the formatted display
          // (this is just for display in the format: SetsXRepsXWeight)
          const exerciseReps = completedSets[0].reps;
          const exerciseWeight = completedSets[0].weight;
          
          // Format the exercise summary
          // Always use the format: SetsXRepsXWeight
          let formattedExercise = '';
          
          // Check if all sets have the same reps and weight
          const allSetsEqual = completedSets.every(
            set => set.reps === completedSets[0].reps && set.weight === completedSets[0].weight
          );
          
          if (allSetsEqual) {
            formattedExercise = `${exerciseSets} X ${exerciseReps} X ${exerciseWeight}lb`;
          } else {
            // Calculate average reps and weight per set for non-uniform sets
            const avgReps = Math.round(exerciseTotalReps / exerciseSets);
            const avgWeight = Math.round(exerciseTotalWeight / exerciseTotalReps);
            formattedExercise = `${exerciseSets} X ${avgReps} X ${avgWeight}lb`;
          }
          
          // Add to completed exercises
          completedExercises.push({
            name: exercise.name,
            sets: exerciseSets,
            reps: exerciseReps,
            weight: exerciseWeight,
            formatted: formattedExercise
          });
          
          // Update totals
          totalSets += exerciseSets;
          totalReps += exerciseTotalReps;
          totalWeight += exerciseTotalWeight;
        }
      });
    }
    
    // Update workout summary
    setWorkoutSummary({
      duration: finalTime,
      totalExercises,
      totalSets,
      totalReps,
      totalWeight,
      completedExercises
    });
    
    // Show summary modal
    setShowWorkoutSummary(true);
    
    // Reset all checkboxes (mark all sets as not completed)
    const resetWorkoutSets = workoutSets.map(workoutSet => {
      if (workoutSet.id === activeWorkoutId) {
        const resetExercises = workoutSet.exercises.map(exercise => {
          const resetSets = exercise.setsReps.map(setRep => ({
            ...setRep,
            completed: false
          }));
          return { ...exercise, setsReps: resetSets };
        });
        return { ...workoutSet, exercises: resetExercises };
      }
      return workoutSet;
    });
    setWorkoutSets(resetWorkoutSets);
    
    // Reset workout state
    setActiveWorkoutId(null);
    setWorkoutStartTime(null);
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>([
    {
      id: "default",
      name: "Leg Day",
      exercises: [
        {
          id: "ex1",
          name: "Squats",
          setsReps: [
            { id: "sr1", setNumber: 1, weight: 60, reps: 10, completed: false },
            { id: "sr2", setNumber: 2, weight: 70, reps: 8, completed: false },
          ],
        },
        {
          id: "ex2",
          name: "Leg Press",
          setsReps: [
            { id: "sr3", setNumber: 1, weight: 100, reps: 12, completed: false },
            { id: "sr4", setNumber: 2, weight: 120, reps: 10, completed: false },
          ],
        },
        {
          id: "ex3",
          name: "Lunges",
          setsReps: [
            { id: "sr5", setNumber: 1, weight: 20, reps: 15, completed: false },
          ],
        },
        {
          id: "ex4",
          name: "Calf Raises",
          setsReps: [
            { id: "sr6", setNumber: 1, weight: 30, reps: 20, completed: false },
          ],
        },
      ],
    },
  ]);

  const [selectedWorkoutSetId, setSelectedWorkoutSetId] = useState<string>(
    "default"
  );

  const addWorkoutSet = () => {
    const newWorkoutSet: WorkoutSet = {
      id: Date.now().toString(),
      name: "New Workout",
      exercises: [],
    };
    setWorkoutSets([...workoutSets, newWorkoutSet]);
    setSelectedWorkoutSetId(newWorkoutSet.id);
  };

  const addExercise = (workoutSetId: string) => {
    const updatedWorkoutSets = workoutSets.map((workoutSet) => {
      if (workoutSet.id === workoutSetId) {
        return {
          ...workoutSet,
          exercises: [
            ...workoutSet.exercises,
            {
              id: Date.now().toString(),
              name: "",
              setsReps: [
                {
                  id: Date.now().toString(),
                  setNumber: 1,
                  weight: 50,
                  reps: 10,
                  completed: false,
                },
              ],
            },
          ],
        };
      }
      return workoutSet;
    });
    setWorkoutSets(updatedWorkoutSets);
  };

  const updateWorkoutSetName = (workoutSetId: string, name: string) => {
    const updatedWorkoutSets = workoutSets.map((workoutSet) => {
      if (workoutSet.id === workoutSetId) {
        return { ...workoutSet, name };
      }
      return workoutSet;
    });
    setWorkoutSets(updatedWorkoutSets);
  };

  const updateExerciseName = (
    workoutSetId: string,
    exerciseId: string,
    name: string
  ) => {
    const updatedWorkoutSets = workoutSets.map((workoutSet) => {
      if (workoutSet.id === workoutSetId) {
        const updatedExercises = workoutSet.exercises.map((exercise) => {
          if (exercise.id === exerciseId) {
            return { ...exercise, name };
          }
          return exercise;
        });
        return { ...workoutSet, exercises: updatedExercises };
      }
      return workoutSet;
    });
    setWorkoutSets(updatedWorkoutSets);
  };
  
  // Update exercise notes
  const updateExerciseNotes = (
    workoutSetId: string,
    exerciseId: string,
    notes: string
  ) => {
    const updatedWorkoutSets = workoutSets.map((workoutSet) => {
      if (workoutSet.id === workoutSetId) {
        const updatedExercises = workoutSet.exercises.map((exercise) => {
          if (exercise.id === exerciseId) {
            return { ...exercise, notes };
          }
          return exercise;
        });
        return { ...workoutSet, exercises: updatedExercises };
      }
      return workoutSet;
    });
    setWorkoutSets(updatedWorkoutSets);
  };

  const addSetRep = (workoutSetId: string, exerciseId: string) => {
    const updatedWorkoutSets = workoutSets.map((workoutSet) => {
      if (workoutSet.id === workoutSetId) {
        const updatedExercises = workoutSet.exercises.map((exercise) => {
          if (exercise.id === exerciseId) {
            const nextSetNumber = exercise.setsReps.length + 1;
            const prevWeight =
              exercise.setsReps.length > 0
                ? exercise.setsReps[exercise.setsReps.length - 1].weight
                : 50;
            return {
              ...exercise,
              setsReps: [
                ...exercise.setsReps,
                {
                  id: Date.now().toString(),
                  setNumber: nextSetNumber,
                  weight: prevWeight,
                  reps: 10,
                  completed: false,
                },
              ],
            };
          }
          return exercise;
        });
        return { ...workoutSet, exercises: updatedExercises };
      }
      return workoutSet;
    });
    setWorkoutSets(updatedWorkoutSets);
  };

  const updateSetRep = (
    workoutSetId: string,
    exerciseId: string,
    setRepId: string,
    field: "weight" | "reps" | "completed",
    value: number | boolean
  ) => {
    // If trying to update completion status, check if workout is active
    if (field === "completed" && !activeWorkoutId) {
      // Don't allow toggling completion if no workout is active
      alert("Please start a workout before marking sets as completed.");
      return;
    }
    
    // If trying to update completion status and workout is active,
    // but trying to update a different workout than the active one
    if (field === "completed" && activeWorkoutId && workoutSetId !== activeWorkoutId) {
      alert("You can only mark sets as completed in your active workout.");
      return;
    }
    
    const updatedWorkoutSets = workoutSets.map((workoutSet) => {
      if (workoutSet.id === workoutSetId) {
        const updatedExercises = workoutSet.exercises.map((exercise) => {
          if (exercise.id === exerciseId) {
            const updatedSetsReps = exercise.setsReps.map((setRep) => {
              if (setRep.id === setRepId) {
                return { ...setRep, [field]: value } as SetRep;
              }
              return setRep;
            });
            return { ...exercise, setsReps: updatedSetsReps };
          }
          return exercise;
        });
        return { ...workoutSet, exercises: updatedExercises };
      }
      return workoutSet;
    });
    setWorkoutSets(updatedWorkoutSets);
  };

  const removeSetRep = (
    workoutSetId: string,
    exerciseId: string,
    setRepId: string
  ) => {
    const updatedWorkoutSets = workoutSets.map((workoutSet) => {
      if (workoutSet.id === workoutSetId) {
        const updatedExercises = workoutSet.exercises.map((exercise) => {
          if (exercise.id === exerciseId) {
            return {
              ...exercise,
              setsReps: exercise.setsReps.filter((setRep) => setRep.id !== setRepId),
            };
          }
          return exercise;
        });
        return { ...workoutSet, exercises: updatedExercises };
      }
      return workoutSet;
    });
    setWorkoutSets(updatedWorkoutSets);
  };

  const removeExercise = (workoutSetId: string, exerciseId: string) => {
    const updatedWorkoutSets = workoutSets.map((workoutSet) => {
      if (workoutSet.id === workoutSetId) {
        return {
          ...workoutSet,
          exercises: workoutSet.exercises.filter((ex) => ex.id !== exerciseId),
        };
      }
      return workoutSet;
    });
    setWorkoutSets(updatedWorkoutSets);
  };

  const [deletingWorkoutSetId, setDeletingWorkoutSetId] =
    useState<string | null>(null);
  const [deletingExercise, setDeletingExercise] = useState<
    { workoutSetId: string; exerciseId: string } | null
  >(null);

  const confirmWorkoutSetDeletion = (workoutSetId: string) => {
    setDeletingWorkoutSetId(workoutSetId);
  };

  const confirmExerciseDeletion = (workoutSetId: string, exerciseId: string) => {
    setDeletingExercise({ workoutSetId, exerciseId });
  };

  const cancelDeletion = () => {
    setDeletingWorkoutSetId(null);
    setDeletingExercise(null);
  };

  const removeWorkoutSet = (workoutSetId: string) => {
    const remaining = workoutSets.filter((ws) => ws.id !== workoutSetId);
    setWorkoutSets(remaining);
    if (selectedWorkoutSetId === workoutSetId && remaining.length > 0) {
      setSelectedWorkoutSetId(remaining[0].id);
    }
    setDeletingWorkoutSetId(null);
  };

  return (
    <AuthCheck>
      <div className="flex min-h-screen flex-col items-center">
        {/* Header with Logout Button */}
        <div className="w-full bg-white dark:bg-gray-800 shadow-md mb-8">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                  <line x1="6" y1="1" x2="6" y2="4"></line>
                  <line x1="10" y1="1" x2="10" y2="4"></line>
                  <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white text-lg">Workout Tracker</span>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg transition-colors"
            >
              {isLoggingOut ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing out...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="w-full px-4 flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-6">Track Your Progress</h1>
          <p className="text-xl mb-8">Create and manage your workout sets</p>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-5xl w-full">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex flex-col gap-4">
            <h2 className="font-bold text-lg border-b pb-2 mb-2">Workout Sets</h2>
            <div className="space-y-2">
              {workoutSets.map((workoutSet) => (
                <div key={workoutSet.id} className="relative group">
                  <button
                    onClick={() => setSelectedWorkoutSetId(workoutSet.id)}
                    className={`w-full text-left p-3 pr-10 rounded-lg transition-colors flex justify-between items-center ${
                      selectedWorkoutSetId === workoutSet.id
                        ? "bg-green-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="font-medium truncate">{workoutSet.name}</span>
                      {activeWorkoutId === workoutSet.id && (
                        <span className="ml-2 flex h-2 w-2">
                          <span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                          <span className="rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedWorkoutSetId === workoutSet.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}>
                      {workoutSet.exercises.length} {workoutSet.exercises.length === 1 ? 'exercise' : 'exercises'}
                    </span>
                  </button>
                  {workoutSets.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmWorkoutSetDeletion(workoutSet.id);
                      }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full border ${
                        selectedWorkoutSetId === workoutSet.id
                          ? "bg-white/10 hover:bg-white/20 text-white/90 border-white/20"
                          : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                      }`}
                      aria-label="Delete workout set"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addWorkoutSet}
              className="flex items-center justify-center gap-2 w-full p-3 mt-2 border-2 border-dashed border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Workout Set
            </button>
            <div className="mt-auto pt-4">
              <Link
                href="/"
                className="inline-block w-full text-center px-6 py-3 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
          <div className="flex-1 border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6">
            {workoutSets.map((workoutSet) => (
              <div
                key={workoutSet.id}
                className={
                  selectedWorkoutSetId === workoutSet.id ? "block" : "hidden"
                }
              >
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={workoutSet.name}
                        onChange={(e) =>
                          updateWorkoutSetName(workoutSet.id, e.target.value)
                        }
                        className="text-2xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none py-1 w-full"
                        placeholder="Enter workout set name"
                      />
                    </div>
                    {workoutSets.length > 1 && (
                      <button
                        onClick={() => confirmWorkoutSetDeletion(workoutSet.id)}
                        className="ml-4 p-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Remove workout set"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Workout Timer and Start/Finish buttons */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {activeWorkoutId === workoutSet.id && (
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/40 px-4 py-2 rounded-lg border border-green-100 dark:border-green-800 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-base font-medium text-green-700 dark:text-green-300">{formatTime(elapsedTime)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      {activeWorkoutId === workoutSet.id ? (
                        <button
                          onClick={finishWorkout}
                          className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Finish Workout
                        </button>
                      ) : activeWorkoutId ? (
                        <span className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700">Workout in progress...</span>
                      ) : (
                        <button
                          onClick={() => startWorkout(workoutSet.id)}
                          className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Start Workout
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  {workoutSet.exercises.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No exercises added yet.
                      </p>
                      <button
                        onClick={() => addExercise(workoutSet.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Add Your First Exercise
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {workoutSet.exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 p-4 border-b border-green-200 dark:border-green-800">
                            <div className="flex justify-between items-center">
                              <input
                                type="text"
                                value={exercise.name}
                                onChange={(e) =>
                                  updateExerciseName(
                                    workoutSet.id,
                                    exercise.id,
                                    e.target.value
                                  )
                                }
                                className="text-xl font-semibold bg-transparent border-b-2 border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 focus:outline-none py-1 text-green-800 dark:text-green-200"
                                placeholder="Enter exercise name"
                                autoFocus={exercise.name === ""}
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    confirmExerciseDeletion(workoutSet.id, exercise.id)
                                  }
                                  className="p-1.5 rounded-full border border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                                  aria-label="Remove exercise"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            {/* Exercise notes section */}
                            {exercise.notes && (
                              <div className="mt-2 flex items-start gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <input 
                                  type="text"
                                  value={exercise.notes}
                                  onChange={(e) => updateExerciseNotes(workoutSet.id, exercise.id, e.target.value)}
                                  className="text-sm italic flex-1 bg-transparent border-b border-green-100 dark:border-green-800 focus:border-green-400 dark:focus:border-green-500 focus:outline-none py-0.5 text-gray-600 dark:text-gray-300"
                                  placeholder="Add form notes (optional)"
                                />
                              </div>
                            )}
                            
                            {!exercise.notes && (
                              <button
                                onClick={() => updateExerciseNotes(workoutSet.id, exercise.id, "")}
                                className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Add form notes
                              </button>
                            )}
                          </div>
                          <div className="p-4">
                            <table className="w-full">
                              <thead>
                                <tr className="text-left border-b-2 border-gray-200 dark:border-gray-700">
                                  <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-16">
                                    Set
                                  </th>
                                  <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Previous
                                  </th>
                                  <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-20">
                                    Weight
                                  </th>
                                  <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-20">
                                    Reps
                                  </th>
                                  <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-12 text-center">✓</th>
                                  <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-10"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {exercise.setsReps.map((setRep) => (
                                  <tr
                                    key={setRep.id}
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-900 ${
                                      setRep.completed
                                        ? "bg-green-50 dark:bg-green-900/20"
                                        : ""
                                    }`}
                                  >
                                    <td className="p-2 text-center font-medium">
                                      {setRep.setNumber}
                                    </td>
                                    <td className="p-2 text-sm text-gray-500 dark:text-gray-400">
                                      {setRep.weight} lb × {setRep.reps}
                                    </td>
                                    <td className="p-2">
                                      <input
                                        type="number"
                                        min="0"
                                        value={setRep.weight}
                                        onChange={(e) =>
                                          updateSetRep(
                                            workoutSet.id,
                                            exercise.id,
                                            setRep.id,
                                            "weight",
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        className="w-full p-1 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 dark:focus:border-green-500 dark:focus:ring-green-500 transition-colors"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <input
                                        type="number"
                                        min="1"
                                        value={setRep.reps}
                                        onChange={(e) =>
                                          updateSetRep(
                                            workoutSet.id,
                                            exercise.id,
                                            setRep.id,
                                            "reps",
                                            parseInt(e.target.value) || 1
                                          )
                                        }
                                        className="w-full p-1 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 dark:focus:border-green-500 dark:focus:ring-green-500 transition-colors"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <button
                                        onClick={() =>
                                          updateSetRep(
                                            workoutSet.id,
                                            exercise.id,
                                            setRep.id,
                                            "completed",
                                            !setRep.completed
                                          )
                                        }
                                        disabled={!activeWorkoutId || activeWorkoutId !== workoutSet.id}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center 
                                          ${!activeWorkoutId || activeWorkoutId !== workoutSet.id
                                            ? "opacity-50 cursor-not-allowed border border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600"
                                            : setRep.completed
                                              ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                                              : "border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                                          }`}
                                        title={!activeWorkoutId 
                                          ? "Start workout to mark sets as completed" 
                                          : activeWorkoutId !== workoutSet.id
                                            ? "Only active workout sets can be marked as completed"
                                            : setRep.completed
                                              ? "Mark as incomplete"
                                              : "Mark as complete"
                                        }
                                        aria-label={
                                          setRep.completed
                                            ? "Mark as incomplete"
                                            : "Mark as complete"
                                        }
                                      >
                                        {setRep.completed ? (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        ) : (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        )}
                                      </button>
                                    </td>
                                    <td className="p-2 text-center">
                                      <button
                                        onClick={() => removeSetRep(workoutSet.id, exercise.id, setRep.id)}
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        aria-label="Remove set"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <line x1="18" y1="6" x2="6" y2="18"></line>
                                          <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <button
                              onClick={() =>
                                addSetRep(workoutSet.id, exercise.id)
                              }
                              className="flex items-center justify-center gap-2 w-full p-2 mt-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-800/30 rounded-md transition-colors text-green-700 dark:text-green-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Add Set
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addExercise(workoutSet.id)}
                        className="flex items-center justify-center gap-2 w-full p-3 mt-4 border-2 border-dashed border-green-300 dark:border-green-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-green-700 dark:text-green-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add Exercise
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {deletingWorkoutSetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the "
              {workoutSets.find((ws) => ws.id === deletingWorkoutSetId)?.name}
              " workout set? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeletion}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => removeWorkoutSet(deletingWorkoutSetId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {deletingExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4">Confirm Exercise Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete "
              {workoutSets
                .find((ws) => ws.id === deletingExercise.workoutSetId)
                ?.exercises.find((ex) => ex.id === deletingExercise.exerciseId)
                ?.name || "this exercise"}
              "? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeletion}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deletingExercise) {
                    removeExercise(
                      deletingExercise.workoutSetId,
                      deletingExercise.exerciseId
                    );
                    setDeletingExercise(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Workout Summary Report Card */}
      {showWorkoutSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 max-w-sm w-full shadow-xl relative">
            {/* Close button */}
            <button 
              onClick={() => setShowWorkoutSummary(false)} 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Header with compact icon */}
            <div className="text-center mb-3">
              <div className="bg-green-100 dark:bg-green-900/30 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Workout Complete!</h3>
            </div>
            
            {/* Workout statistics */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 mb-3">
              <div className="text-center">
                <p className="text-gray-900 dark:text-white flex items-center justify-center gap-4">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(workoutSummary.duration)}
                  </span>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    {workoutSummary.totalWeight}lb
                  </span>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    0 PR
                  </span>
                </p>
              </div>
            </div>
            
            {/* Completed exercises */}
            {workoutSummary.completedExercises.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Exercises Completed:</h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
                  <div className="flex justify-between pb-1 px-1 border-b border-gray-200 dark:border-gray-700 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Exercise</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sets X Reps X Weight</span>
                  </div>
                  <div className="space-y-1">
                    {workoutSummary.completedExercises.map((exercise, index) => (
                      <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div className="flex items-center text-gray-800 dark:text-gray-300 text-sm">
                          <div className="h-2 w-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="font-medium">{exercise.name}</span>
                        </div>
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {exercise.formatted}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setShowWorkoutSummary(false)}
                className="flex-1 py-1.5 px-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Here you could implement sharing or saving the workout data
                  setShowWorkoutSummary(false);
                  // For demo purposes, just show an alert
                  alert('Workout saved to your history!');
                }}
                className="flex-1 py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Save Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </AuthCheck>
  );
}