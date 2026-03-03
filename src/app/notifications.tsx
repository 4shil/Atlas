import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useGoalStore } from '../store/useGoalStore';
import { getDaysUntil } from '../utils/dateUtils';
import { getCategoryIcon } from '../utils/Icons';

export default function Notifications() {
    const router = useRouter();
    const { getPendingGoals, goals } = useGoalStore();
    const pendingGoals = getPendingGoals();
    const [mutedGoals, setMutedGoals] = useState<Set<string>>(new Set());

    // Goals with reminders = upcoming goals within 30 days or overdue
    const upcomingGoals = pendingGoals
        .map(g => ({ ...g, daysLeft: getDaysUntil(g.timelineDate) }))
        .sort((a, b) => a.daysLeft - b.daysLeft);

    const overdueGoals = upcomingGoals.filter(g => g.daysLeft < 0);
    const soonGoals = upcomingGoals.filter(g => g.daysLeft >= 0 && g.daysLeft <= 30);
    const futureGoals = upcomingGoals.filter(g => g.daysLeft > 30);

    const toggleMute = (id: string) => {
        Haptics.selectionAsync();
        setMutedGoals(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleClearAll = () => {
        Alert.alert('Clear All Reminders', 'This will mute all goal reminders for this session.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear All',
                style: 'destructive',
                onPress: () => {
                    setMutedGoals(new Set(upcomingGoals.map(g => g.id)));
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                },
            },
        ]);
    };

    const renderGoalRow = (goal: (typeof upcomingGoals)[0]) => {
        const isOverdue = goal.daysLeft < 0;
        const isSoon = goal.daysLeft >= 0 && goal.daysLeft <= 7;
        const isMuted = mutedGoals.has(goal.id);

        return (
            <TouchableOpacity
                key={goal.id}
                className="flex-row items-center dark:bg-white/[0.05] bg-black/[0.04] border dark:border-white/[0.08] border-black/[0.08] rounded-2xl p-4 mb-3"
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/goal-detail', params: { id: goal.id } });
                }}
                activeOpacity={0.7}
            >
                <View className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 items-center justify-center mr-3">
                    <MaterialIcons
                        name={getCategoryIcon(goal.category) as any}
                        size={18}
                        color={isMuted ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)'}
                    />
                </View>
                <View className="flex-1">
                    <Text
                        className="text-white font-semibold text-sm"
                        numberOfLines={1}
                        style={{ opacity: isMuted ? 0.4 : 1 }}
                    >
                        {goal.title}
                    </Text>
                    <Text className="dark:text-white/40 text-gray-400 text-xs mt-0.5">
                        {isOverdue
                            ? `${Math.abs(goal.daysLeft)}d overdue`
                            : goal.daysLeft === 0
                              ? 'Today!'
                              : `${goal.daysLeft}d left`}
                    </Text>
                </View>
                <Switch
                    value={!isMuted}
                    onValueChange={() => toggleMute(goal.id)}
                    trackColor={{
                        false: 'rgba(255,255,255,0.1)',
                        true: isOverdue ? '#ef4444' : isSoon ? '#f59e0b' : '#3b82f6',
                    }}
                    thumbColor="white"
                />
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper bgClass="bg-black dark:bg-black bg-slate-50">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b dark:border-white/10 border-black/10">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-white/5 border dark:border-white/10 border-black/10 items-center justify-center mr-4"
                        onPress={() => router.back()}
                    >
                        <MaterialIcons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-semibold text-lg">Notifications</Text>
                </View>
                {upcomingGoals.length > 0 && (
                    <TouchableOpacity onPress={handleClearAll}>
                        <Text className="text-red-400 text-sm font-semibold">Clear all</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                {upcomingGoals.length === 0 ? (
                    <View className="flex-1 items-center justify-center pt-20">
                        <MaterialIcons
                            name="notifications-none"
                            size={48}
                            color="rgba(255,255,255,0.2)"
                        />
                        <Text className="dark:text-white/40 text-gray-400 text-base mt-4">
                            No upcoming goals
                        </Text>
                        <Text className="text-white/20 text-sm mt-1 text-center">
                            Add goals with target dates to get reminders
                        </Text>
                    </View>
                ) : (
                    <>
                        {overdueGoals.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-3">
                                    Overdue
                                </Text>
                                {overdueGoals.map(renderGoalRow)}
                            </View>
                        )}

                        {soonGoals.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
                                    Coming Up (30 days)
                                </Text>
                                {soonGoals.map(renderGoalRow)}
                            </View>
                        )}

                        {futureGoals.length > 0 && (
                            <View className="mb-6">
                                <Text className="dark:text-white/40 text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
                                    Scheduled
                                </Text>
                                {futureGoals.map(renderGoalRow)}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}
