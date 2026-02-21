/**
 * Atlas — Goal Data Model
 * Core data structure for bucket list items
 */

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
    image: string | null; // URI
    category: GoalCategory;
    createdAt: Date;
    timelineDate: Date;
    completed: boolean;
    completedAt: Date | null;
    notes: string;
    location: Location | null;
}

export interface PersistedGoal extends Omit<Goal, 'createdAt' | 'timelineDate' | 'completedAt'> {
    createdAt: string;
    timelineDate: string;
    completedAt: string | null;
}

export type GoalCategory =
    | 'travel'
    | 'adventure'
    | 'culture'
    | 'food'
    | 'nature'
    | 'personal'
    | 'creative'
    | 'career'
    | 'wellness'
    | 'social'
    | 'learning'
    | 'other';

export type GoalStatus = 'planned' | 'completed' | 'wishlist';

// ============================================
// CATEGORY METADATA
// ============================================
export const categoryMeta: Record<GoalCategory, { label: string; icon: string }> = {
    travel: { label: 'Travel', icon: 'airplane' },
    adventure: { label: 'Adventure', icon: 'compass' },
    culture: { label: 'Culture', icon: 'color-palette' },
    food: { label: 'Food & Drink', icon: 'restaurant' },
    nature: { label: 'Nature', icon: 'leaf' },
    personal: { label: 'Personal', icon: 'sparkles' },
    creative: { label: 'Creative', icon: 'brush' },
    career: { label: 'Career', icon: 'briefcase' },
    wellness: { label: 'Wellness', icon: 'fitness' },
    social: { label: 'Social', icon: 'people' },
    learning: { label: 'Learning', icon: 'book' },
    other: { label: 'Other', icon: 'star' },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function getGoalStatus(goal: Goal): GoalStatus {
    if (goal.completed) return 'completed';
    if (!goal.timelineDate || goal.timelineDate > new Date()) return 'wishlist';
    return 'planned';
}

export function normalizeGoalDates(goal: Goal | PersistedGoal): Goal {
    return {
        ...goal,
        createdAt: new Date(goal.createdAt),
        timelineDate: new Date(goal.timelineDate),
        completedAt: goal.completedAt ? new Date(goal.completedAt) : null,
    };
}

export function serializeGoalDates(goal: Goal): PersistedGoal {
    return {
        ...goal,
        createdAt: goal.createdAt.toISOString(),
        timelineDate: goal.timelineDate.toISOString(),
        completedAt: goal.completedAt ? goal.completedAt.toISOString() : null,
    };
}

export function createEmptyGoal(): Omit<Goal, 'id' | 'createdAt'> {
    return {
        title: '',
        description: '',
        image: null,
        category: 'personal',
        timelineDate: new Date(),
        completed: false,
        completedAt: null,
        notes: '',
        location: null,
    };
}

export function generateGoalId(): string {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
