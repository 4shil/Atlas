export interface ScheduleOptions {
    goalId: string;
    goalTitle: string;
    targetDate: Date;
}

export declare function requestNotificationPermission(): Promise<boolean>;
export declare function scheduleGoalReminders(options: ScheduleOptions): Promise<string[]>;
export declare function cancelGoalReminders(notificationIds: string[]): Promise<void>;
