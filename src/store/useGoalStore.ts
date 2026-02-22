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
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'completedAt'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    deleteGoal: (id: string) => void;
    toggleComplete: (id: string, notes?: string) => void;

    // Selectors as simple state reads (can also just filter at the component level)
    getCompletedGoals: () => Goal[];
    getPendingGoals: () => Goal[];
}

// Initial mock data to show something visually in the UI until user adds their own
const INITIAL_GOALS: Goal[] = [
    {
        id: '1',
        title: 'Trip to Japan',
        description: 'Explore the neon streets of Tokyo and the temples of Kyoto.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc3ZG704nmOa3EVc3srBQLDvJcDMR-NXgwf-Ts1BbcmseRtAnWaJGwaMycgQ0k9raeLtVGwPOCY9dq-gVnws5lRW3wRPUv4pFlh0S3hc9TNP6PI32LumQ7RDuF_pj19JVCjIVbc9T5awgK6UCOIQQauC0AZ3vVZBiQbrGlbuyZ400jUvHCetPJkE2xno6fEkEZYg1eZt-WFbB8M-sUh4_IUW0vPoFe9_KNs0N5I4YeGfUU-uERXktolnf9jHnoCpEe6UHvEoRYf6Q',
        category: 'Travel',
        createdAt: new Date().toISOString(),
        timelineDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(),
        completed: false,
        completedAt: null,
        notes: '',
        location: {
            latitude: 35.6762,
            longitude: 139.6503,
            city: 'Tokyo',
            country: 'Japan',
        }
    },
    {
        id: '2',
        title: 'Scuba Diving',
        description: 'Get PADI certified and dive in the Great Barrier Reef.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN2lHRAjplzGwkhMUdbMXs4lAU3xrcbip_s1VT8BPq4Jn5BRlj_Y4v9OJ6S5LSZ9bkqzlOGEVXrhO-Y-mXRO6g1s47T15sqC6LFgWc7KnjnPzwWEBwa0Om2g7d7w1cux0vRuFH_8OWe8qhWR8o0PzlCxaaKpC5Jx_6afYXtxS02HxoAZ3dk-phmD7Qud-lJktyRIZGoVDVuJ249ZXr8l-pbXs0TRoOyP9yvm833GP5ZIbe2jIpkeQOT7nf4BsvPzB5duRe_PKrNew',
        category: 'Adventures',
        createdAt: new Date().toISOString(),
        timelineDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
        completed: false,
        completedAt: null,
        notes: '',
        location: {
            latitude: -18.2871,
            longitude: 147.6992,
            city: 'Queensland',
            country: 'Australia',
        }
    },
    {
        id: '3',
        title: 'Paris Nights',
        description: 'Drink wine under the Eiffel Tower.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt3pWIbvV8Y9AGyrrFl4WY8qE7xnILeTfQ9cu-6hC0Qb9y1Rb2p5qo19cTS64uLvuNMhRI_LOwDLRl2sZm50Iw_l0R5fubyez_XA1XJfcm1TwMBYEh1MYtcv3xw4CqTkWcRZNu7GT0dtjAPuAX6AbzpuNrO5LRrS-w2Rwh5Ca3Gj2GQFSNAVmp7nN74PMQlI_HSAQVkvngoVjvbGSnRp6JDqCPZ-F93eQYJ8d98y580Yw4dL4erG3yGFnPFDlBdn3pXSNSYtaO2Lk',
        category: 'Travel',
        createdAt: new Date().toISOString(),
        timelineDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
        completed: true,
        completedAt: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
        notes: 'It was magical.',
        location: {
            latitude: 48.8566,
            longitude: 2.3522,
            city: 'Paris',
            country: 'France',
        }
    }
];

export const useGoalStore = create<GoalState>()(
    persist(
        (set, get) => ({
            goals: INITIAL_GOALS, // Start with some beautiful defaults

            addGoal: (goalData) => set((state) => ({
                goals: [
                    ...state.goals,
                    {
                        ...goalData,
                        id: uuid.v4() as string,
                        createdAt: new Date().toISOString(),
                        completed: false,
                        completedAt: null,
                    }
                ]
            })),

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
            }
        }),
        {
            name: 'atlas-goal-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
