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
export const categoryMeta: Record<GoalCategory, { label: string; emoji: string }> = {
    travel: { label: 'Travel', emoji: '✈️' },
    adventure: { label: 'Adventure', emoji: '🏔️' },
    culture: { label: 'Culture', emoji: '🎭' },
    food: { label: 'Food & Drink', emoji: '🍽️' },
    nature: { label: 'Nature', emoji: '🌿' },
    personal: { label: 'Personal', emoji: '💫' },
    creative: { label: 'Creative', emoji: '🎨' },
    career: { label: 'Career', emoji: '💼' },
    wellness: { label: 'Wellness', emoji: '🧘' },
    social: { label: 'Social', emoji: '👥' },
    learning: { label: 'Learning', emoji: '📚' },
    other: { label: 'Other', emoji: '⭐' },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function getGoalStatus(goal: Goal): GoalStatus {
    if (goal.completed) return 'completed';
    if (!goal.timelineDate || goal.timelineDate > new Date()) return 'wishlist';
    return 'planned';
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
