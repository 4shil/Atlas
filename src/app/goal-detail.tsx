import React, { useState } from 'react';
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    Alert, Share, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGoalStore } from '../store/useGoalStore';

export default function GoalDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { goals, toggleComplete, deleteGoal } = useGoalStore();

    const goal = goals.find(g => g.id === id);

    if (!goal) {
        return (
            <SafeAreaView className="flex-1 bg-black items-center justify-center">
                <Text className="text-gray-400">Goal not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-blue-400">← Go back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const targetDate = new Date(goal.timelineDate);
    const now = new Date();
    const daysLeft = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0 && !goal.completed;

    const handleDelete = () => {
        Alert.alert(
            'Delete Goal',
            `Are you sure you want to delete "${goal.title}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        deleteGoal(goal.id);
                        router.back();
                    },
                },
            ]
        );
    };

    const handleToggleComplete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toggleComplete(goal.id);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                title: goal.title,
                message: `🌍 Bucket List: ${goal.title}\n📍 ${goal.location.city}, ${goal.location.country}\n📅 Target: ${targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n\nShared from Atlas`,
            });
        } catch (e) {
            // Share dismissed
        }
    };

    const categoryIcon = (cat: string) => {
        switch (cat) {
            case 'Travel': return 'flight';
            case 'Adventures': return 'hiking';
            case 'Foodie': return 'restaurant';
            case 'Stays': return 'hotel';
            case 'Milestone': return 'star';
            default: return 'place';
        }
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />

            {/* Hero Image */}
            <View className="h-[45%] relative">
                <Image
                    source={{ uri: goal.image }}
                    className="absolute inset-0 w-full h-full"
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.9)']}
                    className="absolute inset-0"
                />

                {/* Top Bar */}
                <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-10">
                    <View className="flex-row justify-between items-center px-5 pt-2">
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-black/50 items-center justify-center border border-white/20"
                            onPress={() => router.back()}
                        >
                            <MaterialIcons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-black/50 items-center justify-center border border-white/20"
                                onPress={handleShare}
                            >
                                <MaterialIcons name="share" size={20} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-black/50 items-center justify-center border border-white/20"
                                onPress={() => router.push({ pathname: '/add-goal', params: { editId: goal.id } })}
                            >
                                <MaterialIcons name="edit" size={20} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-red-900/70 items-center justify-center border border-red-500/30"
                                onPress={handleDelete}
                            >
                                <MaterialIcons name="delete-outline" size={20} color="#f87171" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>

                {/* Hero bottom info */}
                <View className="absolute bottom-0 left-0 right-0 px-6 pb-6">
                    <View className="flex-row items-center mb-2">
                        <View className="bg-white/10 border border-white/20 px-3 py-1 rounded-full flex-row items-center mr-2">
                            <MaterialIcons name={categoryIcon(goal.category) as any} size={12} color="white" />
                            <Text className="text-white text-xs ml-1 font-medium">{goal.category}</Text>
                        </View>
                        {goal.completed && (
                            <View className="bg-green-900/60 border border-green-500/30 px-3 py-1 rounded-full flex-row items-center">
                                <MaterialIcons name="check-circle" size={12} color="#4ade80" />
                                <Text className="text-green-400 text-xs ml-1 font-medium">Completed</Text>
                            </View>
                        )}
                        {isOverdue && (
                            <View className="bg-red-900/60 border border-red-500/30 px-3 py-1 rounded-full">
                                <Text className="text-red-400 text-xs font-medium">Overdue</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-3xl font-bold text-white leading-tight">{goal.title}</Text>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 bg-[#0a0a0a]"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Location & Date Row */}
                <View className="flex-row px-6 pt-6 pb-4 border-b border-white/5">
                    <View className="flex-1">
                        <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">Location</Text>
                        <View className="flex-row items-center">
                            <MaterialIcons name="place" size={16} color="#60a5fa" />
                            <Text className="text-white font-semibold ml-1">
                                {goal.location.latitude === 0 ? 'No location set' : `${goal.location.city}, ${goal.location.country}`}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-1 items-end">
                        <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">Target</Text>
                        <Text className="text-white font-semibold">
                            {targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Text>
                        {!goal.completed && (
                            <Text className={`text-xs mt-0.5 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                                {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Description */}
                {goal.description ? (
                    <View className="px-6 pt-5 pb-4">
                        <Text className="text-gray-500 text-xs uppercase tracking-widest mb-2">About</Text>
                        <Text className="text-gray-200 text-base leading-7">{goal.description}</Text>
                    </View>
                ) : null}

                {/* Notes */}
                {goal.notes ? (
                    <View className="mx-6 mt-2 bg-white/5 border border-white/10 rounded-2xl p-4">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons name="sticky-note-2" size={16} color="#facc15" />
                            <Text className="text-yellow-400 text-xs uppercase tracking-widest ml-2">Notes</Text>
                        </View>
                        <Text className="text-gray-300 text-sm leading-6">{goal.notes}</Text>
                    </View>
                ) : null}

                {/* Completion info */}
                {goal.completed && goal.completedAt && (
                    <View className="mx-6 mt-4 bg-green-950/40 border border-green-500/20 rounded-2xl p-4 flex-row items-center">
                        <MaterialIcons name="check-circle" size={20} color="#4ade80" />
                        <View className="ml-3">
                            <Text className="text-green-400 text-sm font-semibold">Goal Achieved!</Text>
                            <Text className="text-gray-400 text-xs mt-0.5">
                                Completed {new Date(goal.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Created at */}
                <View className="px-6 mt-6">
                    <Text className="text-gray-600 text-xs">
                        Added {new Date(goal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-4 bg-black/90 border-t border-white/10">
                <TouchableOpacity
                    className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${goal.completed ? 'bg-gray-800 border border-gray-600' : 'bg-blue-600'}`}
                    onPress={handleToggleComplete}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name={goal.completed ? 'replay' : 'check-circle-outline'}
                        size={22}
                        color={goal.completed ? '#9ca3af' : 'white'}
                    />
                    <Text className={`font-bold text-base ml-2 ${goal.completed ? 'text-gray-400' : 'text-white'}`}>
                        {goal.completed ? 'Mark as Pending' : 'Mark as Complete 🎉'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
