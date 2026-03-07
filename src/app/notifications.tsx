import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    StyleSheet,
    AppState,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useGoalStore } from '../store/useGoalStore';
import { getDaysUntil } from '../utils/dateUtils';
import { getCategoryIcon } from '../utils/Icons';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
    if (notificationsModulePromise) return notificationsModulePromise;

    notificationsModulePromise = (async () => {
        // On web SSR there is no browser localStorage/window; skip loading notifications module.
        if (Platform.OS === 'web' && typeof window === 'undefined') return null;
        try {
            return await import('expo-notifications');
        } catch {
            return null;
        }
    })();

    return notificationsModulePromise;
}

async function requestNotificationsPermission(): Promise<boolean> {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return false;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

async function getNotificationsPermissionStatus(): Promise<'granted' | string> {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return 'denied';
    const { status } = await Notifications.getPermissionsAsync();
    return status;
}

async function scheduleNotification(args: {
    identifier: string;
    content: {
        title: string;
        body: string;
        data: { goalId: string };
    };
    trigger: Date;
}) {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;
    await Notifications.scheduleNotificationAsync(args as any);
}

async function getAllScheduledNotifications() {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return [];
    return Notifications.getAllScheduledNotificationsAsync();
}

async function cancelScheduledNotification(id: string) {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync(id);
}

// Smart scheduling: schedule push notifications based on deadline proximity
async function scheduleGoalNotification(goalId: string, goalTitle: string, daysLeft: number) {
    if (daysLeft < 0) {
        // Overdue: schedule for tomorrow morning
        const trigger = new Date();
        trigger.setDate(trigger.getDate() + 1);
        trigger.setHours(9, 0, 0, 0);
        await scheduleNotification({
            identifier: `goal-overdue-${goalId}`,
            content: {
                title: 'You still have time! 💪',
                body: `"${goalTitle}" is overdue. Don't give up — start today!`,
                data: { goalId },
            },
            trigger,
        });
    } else if (daysLeft === 1) {
        // Due tomorrow: notify today at 6pm
        const trigger = new Date();
        trigger.setHours(18, 0, 0, 0);
        if (trigger < new Date()) trigger.setDate(trigger.getDate() + 1);
        await scheduleNotification({
            identifier: `goal-due-soon-${goalId}`,
            content: {
                title: 'Last chance! ⏰',
                body: `"${goalTitle}" is due tomorrow. Time to make it happen!`,
                data: { goalId },
            },
            trigger,
        });
    } else if (daysLeft <= 7) {
        // Due within a week: every 2 days
        const trigger = new Date();
        trigger.setDate(trigger.getDate() + 2);
        trigger.setHours(9, 0, 0, 0);
        await scheduleNotification({
            identifier: `goal-week-${goalId}`,
            content: {
                title: 'Goal deadline approaching 🎯',
                body: `"${goalTitle}" is due in ${daysLeft} days. Keep going!`,
                data: { goalId },
            },
            trigger,
        });
    } else if (daysLeft <= 30) {
        // Due within a month: weekly
        const trigger = new Date();
        trigger.setDate(trigger.getDate() + 7);
        trigger.setHours(9, 0, 0, 0);
        await scheduleNotification({
            identifier: `goal-month-${goalId}`,
            content: {
                title: 'Goal check-in 📋',
                body: `"${goalTitle}" — ${daysLeft} days to go. How's the progress?`,
                data: { goalId },
            },
            trigger,
        });
    }
}

async function rescheduleAllGoals(goals: any[]) {
    const status = await getNotificationsPermissionStatus();
    if (status !== 'granted') return;

    // Cancel all existing goal notifications
    const scheduled = await getAllScheduledNotifications();
    for (const n of scheduled) {
        if (String(n.identifier).startsWith('goal-')) {
            await cancelScheduledNotification(String(n.identifier));
        }
    }

    // Reschedule pending goals
    for (const goal of goals) {
        if (goal.completed) continue;
        const daysLeft = getDaysUntil(goal.timelineDate);
        if (daysLeft <= 30) {
            try {
                await scheduleGoalNotification(goal.id, goal.title, daysLeft);
            } catch {
                // Ignore scheduling errors
            }
        }
    }
}

type NotificationItem = {
    id: string;
    goalId: string;
    title: string;
    body: string;
    time: string;
    group: 'Today' | 'This Week' | 'Earlier' | 'Overdue';
    isRead: boolean;
    daysLeft: number;
    category: string;
};

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const goals = useGoalStore(s => s.goals);
    const pendingGoals = goals.filter(g => !g.completed);

    const [mutedGoals, setMutedGoals] = useState<Set<string>>(new Set());
    const [readItems, setReadItems] = useState<Set<string>>(new Set());
    const [notifGranted, setNotifGranted] = useState(false);

    // Build notification items from pending goals
    const items: NotificationItem[] = pendingGoals
        .map(g => {
            const daysLeft = getDaysUntil(g.timelineDate);
            let group: NotificationItem['group'] = 'Earlier';
            let body = '';
            if (daysLeft < 0) {
                group = 'Overdue';
                body = `You still have time! This goal is ${Math.abs(daysLeft)} days overdue.`;
            } else if (daysLeft === 0) {
                group = 'Today';
                body = "Today's the day! 🎯 Make it happen.";
            } else if (daysLeft <= 7) {
                group = 'Today';
                body = `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. You're almost there!`;
            } else if (daysLeft <= 30) {
                group = 'This Week';
                body = `${daysLeft} days remaining. Stay on track!`;
            } else {
                group = 'Earlier';
                body = `${daysLeft} days to go. Keep dreaming big! ✨`;
            }
            return {
                id: `notif-${g.id}`,
                goalId: g.id,
                title: g.title,
                body,
                time: daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft}d left`,
                group,
                isRead: readItems.has(g.id),
                daysLeft,
                category: g.category,
            };
        })
        .sort((a, b) => a.daysLeft - b.daysLeft);

    const unreadCount = items.filter(i => !i.isRead && !mutedGoals.has(i.goalId)).length;

    const grouped: Record<string, NotificationItem[]> = {};
    for (const item of items) {
        if (!grouped[item.group]) grouped[item.group] = [];
        grouped[item.group].push(item);
    }
    const groupOrder: NotificationItem['group'][] = ['Overdue', 'Today', 'This Week', 'Earlier'];

    useEffect(() => {
        requestNotificationsPermission().then(setNotifGranted);
    }, []);

    // Reschedule on foreground
    useEffect(() => {
        const sub = AppState.addEventListener('change', state => {
            if (state === 'active') {
                rescheduleAllGoals(goals);
            }
        });
        // Also run immediately
        rescheduleAllGoals(goals);
        return () => sub.remove();
    }, [goals]);

    const markAllRead = useCallback(() => {
        setReadItems(new Set(items.map(i => i.goalId)));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [items]);

    const toggleMute = useCallback((id: string) => {
        Haptics.selectionAsync();
        setMutedGoals(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const groupColors: Record<string, string> = {
        Overdue: '#ef4444',
        Today: '#f59e0b',
        'This Week': '#3b82f6',
        Earlier: 'rgba(255,255,255,0.3)',
    };

    return (
        <ScreenWrapper bgClass="dark:bg-black bg-slate-50">
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtn}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <MaterialIcons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity
                        onPress={markAllRead}
                        accessibilityLabel="Mark all as read"
                        accessibilityRole="button"
                    >
                        <Text style={styles.markReadBtn}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Permission prompt */}
            {!notifGranted && (
                <View style={styles.permissionBanner}>
                    <MaterialIcons name="notifications-off" size={16} color="#fbbf24" />
                    <Text style={styles.permissionText}>
                        Enable notifications for deadline reminders
                    </Text>
                    <TouchableOpacity
                        onPress={() => requestNotificationsPermission().then(setNotifGranted)}
                        accessibilityRole="button"
                    >
                        <Text style={styles.permissionAction}>Enable</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {items.length === 0 ? (
                    <View style={styles.empty}>
                        <MaterialIcons
                            name="notifications-none"
                            size={56}
                            color="rgba(255,255,255,0.1)"
                        />
                        <Text style={styles.emptyTitle}>No notifications</Text>
                        <Text style={styles.emptySubtitle}>
                            Add goals with target dates to receive smart reminders
                        </Text>
                    </View>
                ) : (
                    groupOrder.map(group => {
                        const groupItems = grouped[group];
                        if (!groupItems?.length) return null;
                        return (
                            <View key={group} style={styles.group}>
                                <Text style={[styles.groupLabel, { color: groupColors[group] }]}>
                                    {group}
                                </Text>
                                {groupItems.map(item => {
                                    const isMuted = mutedGoals.has(item.goalId);
                                    const isRead = readItems.has(item.goalId);
                                    const isOverdue = item.daysLeft < 0;
                                    const isSoon = item.daysLeft >= 0 && item.daysLeft <= 7;
                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() => {
                                                setReadItems(
                                                    prev => new Set([...prev, item.goalId])
                                                );
                                                Haptics.impactAsync(
                                                    Haptics.ImpactFeedbackStyle.Light
                                                );
                                                router.push({
                                                    pathname: '/goal-detail',
                                                    params: { id: item.goalId },
                                                });
                                            }}
                                            style={[
                                                styles.notifCard,
                                                isRead && styles.notifCardRead,
                                            ]}
                                            activeOpacity={0.75}
                                            accessibilityLabel={`Notification: ${item.title}`}
                                            accessibilityRole="button"
                                        >
                                            {/* Unread indicator */}
                                            {!isRead && !isMuted && (
                                                <View
                                                    style={[
                                                        styles.unreadDot,
                                                        { backgroundColor: groupColors[group] },
                                                    ]}
                                                />
                                            )}
                                            <View
                                                style={[
                                                    styles.iconWrap,
                                                    {
                                                        backgroundColor: isOverdue
                                                            ? '#ef444420'
                                                            : isSoon
                                                              ? '#f59e0b20'
                                                              : 'rgba(255,255,255,0.06)',
                                                    },
                                                ]}
                                            >
                                                <MaterialIcons
                                                    name={getCategoryIcon(item.category) as any}
                                                    size={18}
                                                    color={
                                                        isOverdue
                                                            ? '#ef4444'
                                                            : isSoon
                                                              ? '#f59e0b'
                                                              : 'rgba(255,255,255,0.5)'
                                                    }
                                                />
                                            </View>
                                            <View style={styles.notifContent}>
                                                <Text
                                                    style={[
                                                        styles.notifTitle,
                                                        isMuted && styles.mutedText,
                                                    ]}
                                                    numberOfLines={1}
                                                >
                                                    {item.title}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.notifBody,
                                                        isMuted && styles.mutedText,
                                                    ]}
                                                    numberOfLines={2}
                                                >
                                                    {item.body}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.notifTime,
                                                        { color: groupColors[group] },
                                                    ]}
                                                >
                                                    {item.time}
                                                </Text>
                                            </View>
                                            <Switch
                                                value={!isMuted}
                                                onValueChange={() => toggleMute(item.goalId)}
                                                trackColor={{
                                                    false: 'rgba(255,255,255,0.08)',
                                                    true: isOverdue
                                                        ? '#ef4444'
                                                        : isSoon
                                                          ? '#f59e0b'
                                                          : '#3b82f6',
                                                }}
                                                thumbColor="white"
                                                accessibilityLabel={
                                                    isMuted ? 'Unmute reminder' : 'Mute reminder'
                                                }
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12, gap: 8 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
    badge: {
        backgroundColor: '#ef4444',
        borderRadius: 99,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    badgeText: { color: 'white', fontSize: 11, fontWeight: '800' },
    markReadBtn: { color: '#3b82f6', fontSize: 13, fontWeight: '600' },
    permissionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(251,191,36,0.08)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(251,191,36,0.15)',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    permissionText: { flex: 1, color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    permissionAction: { color: '#fbbf24', fontSize: 13, fontWeight: '700' },
    scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 80 },
    empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 18, fontWeight: '700' },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 18,
    },
    group: { marginBottom: 24 },
    groupLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
    notifCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 18,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        position: 'relative',
    },
    notifCardRead: { opacity: 0.6 },
    unreadDot: { position: 'absolute', top: 14, left: 8, width: 6, height: 6, borderRadius: 3 },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    notifContent: { flex: 1, marginRight: 8 },
    notifTitle: { color: 'white', fontSize: 14, fontWeight: '700', marginBottom: 3 },
    notifBody: { color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 16, marginBottom: 5 },
    notifTime: { fontSize: 11, fontWeight: '600' },
    mutedText: { opacity: 0.35 },
});
