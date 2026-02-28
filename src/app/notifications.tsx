import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useGoalStore } from '../store/useGoalStore';
import { getDaysUntil } from '../utils/dateUtils';
import { getCategoryIcon } from '../utils/Icons';

export default function Notifications() {
    const router = useRouter();
    const { getPendingGoals } = useGoalStore();
    const pendingGoals = getPendingGoals();

    // Goals with reminders = upcoming goals within 30 days or overdue
    const upcomingGoals = pendingGoals
        .map(g => ({ ...g, daysLeft: getDaysUntil(g.timelineDate) }))
        .sort((a, b) => a.daysLeft - b.daysLeft);

    const overdueGoals = upcomingGoals.filter(g => g.daysLeft < 0);
    const soonGoals = upcomingGoals.filter(g => g.daysLeft >= 0 && g.daysLeft <= 30);
    const futureGoals = upcomingGoals.filter(g => g.daysLeft > 30);

    const renderGoalRow = (goal: typeof upcomingGoals[0]) => {
        const isOverdue = goal.daysLeft < 0;
        const isSoon = goal.daysLeft >= 0 && goal.daysLeft <= 7;

        return (
            <TouchableOpacity
                key={goal.id}
                className="flex-row items-center bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 mb-3"
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/goal-detail', params: { id: goal.id } });
                }}
                activeOpacity={0.7}
            >
                <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3">
                    <MaterialIcons name={getCategoryIcon(goal.category) as any} size={18} color="rgba(255,255,255,0.6)" />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-semibold text-sm" numberOfLines={1}>{goal.title}</Text>
                    <Text className="text-white/40 text-xs mt-0.5">
                        {goal.location.city ? `${goal.location.city}, ${goal.location.country}` : 'No location'}
                    </Text>
                </View>
                <View className="items-end">
                    <Text
                        className={`text-xs font-semibold ${isOverdue ? 'text-red-400' : isSoon ? 'text-amber-400' : 'text-blue-400'}`}
                    >
                        {isOverdue
                            ? `${Math.abs(goal.daysLeft)}d overdue`
                            : goal.daysLeft === 0
                                ? 'Today!'
                                : `${goal.daysLeft}d left`}
                    </Text>
                    <MaterialIcons name="notifications-active" size={14} color={isOverdue ? '#f87171' : isSoon ? '#fbbf24' : '#60a5fa'} style={{ marginTop: 4 }} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper bgClass="bg-black">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-white/10">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center mr-4"
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-semibold text-lg">Notifications</Text>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                {upcomingGoals.length === 0 ? (
                    <View className="flex-1 items-center justify-center pt-20">
                        <MaterialIcons name="notifications-none" size={48} color="rgba(255,255,255,0.2)" />
                        <Text className="text-white/40 text-base mt-4">No upcoming goals</Text>
                        <Text className="text-white/20 text-sm mt-1 text-center">Add goals with target dates to get reminders</Text>
                    </View>
                ) : (
                    <>
                        {overdueGoals.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-3">Overdue</Text>
                                {overdueGoals.map(renderGoalRow)}
                            </View>
                        )}

                        {soonGoals.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">Coming Up (30 days)</Text>
                                {soonGoals.map(renderGoalRow)}
                            </View>
                        )}

                        {futureGoals.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Scheduled</Text>
                                {futureGoals.map(renderGoalRow)}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}
