/**
 * notificationUtils.web.ts
 * Web stub — expo-notifications is not supported on web.
 * All functions are no-ops that resolve gracefully.
 */

export async function requestNotificationPermission(): Promise<boolean> {
    return false;
}

interface ScheduleOptions {
    goalId: string;
    goalTitle: string;
    targetDate: Date;
}

export async function scheduleGoalReminders(_opts: ScheduleOptions): Promise<string[]> {
    return [];
}

export async function cancelGoalReminders(_ids: string[]): Promise<void> {
    // no-op on web
}
