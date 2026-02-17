/**
 * Atlas — Goals Store (Zustand)
 * State management for bucket list goals
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, GoalCategory, generateGoalId, normalizeGoalDates, PersistedGoal, serializeGoalDates } from './types';

// ============================================
// STORE INTERFACE
// ============================================
interface GoalsState {
    goals: Goal[];

    // CRUD Operations
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => string;
    updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
    deleteGoal: (id: string) => void;

    // Completion
    markComplete: (id: string, notes?: string) => void;
    markIncomplete: (id: string) => void;

    // Selectors
    getGoalById: (id: string) => Goal | undefined;
    getGoalsByCategory: (category: GoalCategory) => Goal[];
    getGoalsByYear: (year: number) => Goal[];
    getCompletedGoals: () => Goal[];
    getActiveGoals: () => Goal[];
    getGoalsWithLocation: () => Goal[];

    // Stats
    getTotalCount: () => number;
    getCompletedCount: () => number;
    getCategories: () => GoalCategory[];
}

interface PersistedGoalsState {
    goals: PersistedGoal[];
}

// ============================================
// STORE IMPLEMENTATION
// ============================================
export const useGoalsStore = create<GoalsState>()(
    persist(
        (set, get) => ({
            goals: [],

            // ============================================
            // CRUD OPERATIONS
            // ============================================
            addGoal: (goalData) => {
                const id = generateGoalId();
                const newGoal: Goal = {
                    ...goalData,
                    id,
                    createdAt: new Date(),
                };

                set(state => ({
                    goals: [...state.goals, newGoal],
                }));

                return id;
            },

            updateGoal: (id, updates) => {
                set(state => ({
                    goals: state.goals.map(goal =>
                        goal.id === id ? { ...goal, ...updates } : goal
                    ),
                }));
            },

            deleteGoal: (id) => {
                set(state => ({
                    goals: state.goals.filter(goal => goal.id !== id),
                }));
            },

            // ============================================
            // COMPLETION
            // ============================================
            markComplete: (id, notes) => {
                set(state => ({
                    goals: state.goals.map(goal =>
                        goal.id === id
                            ? {
                                ...goal,
                                completed: true,
                                completedAt: new Date(),
                                notes: notes ?? goal.notes,
                            }
                            : goal
                    ),
                }));
            },

            markIncomplete: (id) => {
                set(state => ({
                    goals: state.goals.map(goal =>
                        goal.id === id
                            ? { ...goal, completed: false, completedAt: null }
                            : goal
                    ),
                }));
            },

            // ============================================
            // SELECTORS
            // ============================================
            getGoalById: (id) => {
                return get().goals.find(goal => goal.id === id);
            },

            getGoalsByCategory: (category) => {
                return get().goals.filter(goal => goal.category === category);
            },

            getGoalsByYear: (year) => {
                return get().goals.filter(goal => {
                    const goalYear = new Date(goal.timelineDate).getFullYear();
                    return goalYear === year;
                });
            },

            getCompletedGoals: () => {
                return get().goals.filter(goal => goal.completed);
            },

            getActiveGoals: () => {
                return get().goals.filter(goal => !goal.completed);
            },

            getGoalsWithLocation: () => {
                return get().goals.filter(goal => goal.location !== null);
            },

            // ============================================
            // STATS
            // ============================================
            getTotalCount: () => get().goals.length,

            getCompletedCount: () => get().goals.filter(g => g.completed).length,

            getCategories: () => {
                const categories = new Set(get().goals.map(g => g.category));
                return Array.from(categories);
            },
        }),
        {
            name: 'atlas-goals-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                goals: state.goals.map(serializeGoalDates),
            }),
            merge: (persistedState, currentState) => {
                const typedPersistedState = persistedState as PersistedGoalsState | undefined;

                if (!typedPersistedState?.goals) {
                    return currentState;
                }

                return {
                    ...currentState,
                    goals: typedPersistedState.goals.map(normalizeGoalDates),
                };
            },
        }
    )
);

// ============================================
// SELECTOR HOOKS
// ============================================
export const useGoals = () => useGoalsStore(state => state.goals);
export const useGoal = (id: string) => useGoalsStore(state => state.goals.find(goal => goal.id === id));
export const useCompletedGoals = () => useGoalsStore(useShallow(state => state.goals.filter(goal => goal.completed)));
export const useActiveGoals = () => useGoalsStore(useShallow(state => state.goals.filter(goal => !goal.completed)));
export const useGoalsWithLocation = () => useGoalsStore(useShallow(state => state.goals.filter(goal => goal.location !== null)));
