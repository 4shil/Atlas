import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Goal } from '../store/useGoalStore';
import { ProgressRing } from './ProgressRing';

interface DashboardOverviewProps {
    completedGoals: Goal[];
    allPending: Goal[];
    totalGoals: number;
}

export function DashboardOverview({ completedGoals, allPending, totalGoals }: DashboardOverviewProps) {
    return (
        <View className="px-6 mt-10">
            <Text className="text-sm font-semibold text-gray-300 mb-4">Overview</Text>
            <View className="flex-row items-center gap-3">
                {/* Completed */}
                <View className="flex-1 bg-black/60 rounded-[2rem] p-5 border border-gray-700 overflow-hidden relative">
                    <Text className="text-base font-medium text-white">Completed</Text>
                    <Text className="text-gray-400 text-xs mt-1 mb-4">Great job!</Text>
                    <View className="flex-row items-baseline">
                        <View className="w-1 h-7 bg-green-500 rounded-full mr-2" />
                        <Text className="text-3xl font-semibold text-white">{completedGoals.length}</Text>
                    </View>
                    <View className="absolute top-4 right-4 opacity-15">
                        <MaterialIcons name="check-circle-outline" size={36} color="#4ade80" style={{ transform: [{ rotate: '12deg' }] }} />
                    </View>
                </View>

                {/* Progress Ring */}
                <ProgressRing completed={completedGoals.length} total={totalGoals} />

                {/* Pending */}
                <View className="flex-1 bg-black/60 rounded-[2rem] p-5 border border-gray-700 overflow-hidden relative">
                    <Text className="text-base font-medium text-white">Pending</Text>
                    <Text className="text-gray-400 text-xs mt-1 mb-4">Keep going</Text>
                    <View className="flex-row items-baseline">
                        <View className="w-1 h-7 bg-gray-500 rounded-full mr-2" />
                        <Text className="text-3xl font-semibold text-white">{allPending.length}</Text>
                    </View>
                    <View className="absolute top-4 right-4 opacity-15">
                        <MaterialIcons name="hourglass-empty" size={36} color="white" style={{ transform: [{ rotate: '-12deg' }] }} />
                    </View>
                </View>
            </View>
        </View>
    );
}
