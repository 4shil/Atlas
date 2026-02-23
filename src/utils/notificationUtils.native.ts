/**
 * notificationUtils.ts
 * Schedules local push notifications for upcoming goals.
 * Requests permission on first use and schedules a reminder
 * 7 days before and 1 day before the goal's target date.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/** Configure default notification handler (show alert + sound) */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/** Request permission and return whether it was granted */
export async function requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

interface ScheduleOptions {
    goalId: string;
    goalTitle: string;
    targetDate: Date;
}

/**
 * Schedule reminder notifications for a goal:
 * - 7 days before the target date
 * - 1 day before the target date
 * Returns the scheduled notification IDs (for cancellation later).
 */
export async function scheduleGoalReminders({
    goalId,
    goalTitle,
    targetDate,
}: ScheduleOptions): Promise<string[]> {
    if (Platform.OS === 'web') return [];

    const granted = await requestNotificationPermission();
    if (!granted) return [];

    const now = Date.now();
    const ids: string[] = [];

    const reminders = [
        {
            offsetDays: 7,
            body: `7 days to go! Don't forget: "${goalTitle}" is coming up.`,
        },
        {
            offsetDays: 1,
            body: `Tomorrow's the day! "${goalTitle}" is almost here. ✈️`,
        },
    ];

    for (const { offsetDays, body } of reminders) {
        const triggerMs = targetDate.getTime() - offsetDays * 24 * 60 * 60 * 1000;
        if (triggerMs <= now) continue; // already passed

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🌍 Atlas Reminder',
                    body,
                    data: { goalId },
                },
                trigger: { date: new Date(triggerMs) } as any,
            });
            ids.push(id);
        } catch (e) {
            // silently skip if scheduling fails (e.g., simulator)
        }
    }

    return ids;
}

/** Cancel all notifications for a goal (by stored notification IDs) */
export async function cancelGoalReminders(notificationIds: string[]): Promise<void> {
    for (const id of notificationIds) {
        try {
            await Notifications.cancelScheduledNotificationAsync(id);
        } catch (_) { }
    }
}
