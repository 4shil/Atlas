import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export interface Location {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    placeId?: string;
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    image: string; // URI
    category: string;
    createdAt: string; // ISO string 
    timelineDate: string; // ISO string
    completed: boolean;
    completedAt: string | null;
    notes: string;
    location: Location;
}

interface GoalState {
    goals: Goal[];
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'completedAt'>) => string;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    deleteGoal: (id: string) => void;
    toggleComplete: (id: string, notes?: string) => void;

    // Selectors as simple state reads (can also just filter at the component level)
    getCompletedGoals: () => Goal[];
    getPendingGoals: () => Goal[];
    clearGoals: () => void;
}

// Initial state is an empty array so users start blank
const INITIAL_GOALS: Goal[] = [];

export const useGoalStore = create<GoalState>()(
    persist(
        (set, get) => ({
            goals: INITIAL_GOALS, // Start with empty defaults

            addGoal: (goalData) => {
                const id = uuid.v4() as string;
                set((state) => ({
                    goals: [
                        ...state.goals,
                        {
                            ...goalData,
                            id,
                            createdAt: new Date().toISOString(),
                            completed: false,
                            completedAt: null,
                        }
                    ]
                }));
                return id;
            },

            updateGoal: (id, updates) => set((state) => ({
                goals: state.goals.map(goal =>
                    goal.id === id ? { ...goal, ...updates } : goal
                )
            })),

            deleteGoal: (id) => set((state) => ({
                goals: state.goals.filter(goal => goal.id !== id)
            })),

            toggleComplete: (id, notes) => set((state) => ({
                goals: state.goals.map(goal => {
                    if (goal.id === id) {
                        const isNowCompleted = !goal.completed;
                        return {
                            ...goal,
                            completed: isNowCompleted,
                            completedAt: isNowCompleted ? new Date().toISOString() : null,
                            notes: notes !== undefined ? notes : goal.notes,
                        };
                    }
                    return goal;
                })
            })),

            getCompletedGoals: () => {
                return get().goals.filter(g => g.completed);
            },

            getPendingGoals: () => {
                return get().goals.filter(g => !g.completed);
            },

            clearGoals: () => set({ goals: [] }),
        }),
        {
            name: 'atlas-goal-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
