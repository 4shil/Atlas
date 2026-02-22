import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useGoalStore, Goal } from '../../store/useGoalStore';

export default function DarkInspirationArchive() {
    const { getCompletedGoals } = useGoalStore();
    const completedGoals = getCompletedGoals();

    return (
        <SafeAreaView className="flex-1 bg-black relative" edges={['top', 'bottom']}>
            <StatusBar style="light" />

            {/* Approximated Radial Gradients from Stitch code using Absolute Views */}
            <View className="absolute inset-0 z-0 overflow-hidden" pointerEvents="none">
                <View className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-indigo-900 rounded-full opacity-30" />
                <View className="absolute top-[10%] right-[10%] w-[250px] h-[250px] bg-red-900 rounded-full opacity-20" />
                <View className="absolute bottom-[20%] left-[30%] w-[350px] h-[350px] bg-blue-900 rounded-full opacity-20" />
            </View>

            <ScrollView className="flex-1 z-10 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Header section (Menu, Likes, Settings) */}
                <View className="px-6 flex-row justify-between items-center mb-6">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Open menu"
                    >
                        <MaterialIcons name="menu" size={20} color="white" />
                    </TouchableOpacity>
                    <View className="bg-black/60 border border-white/10 px-4 py-1.5 rounded-full flex-row items-center space-x-2">
                        <MaterialIcons name="inventory-2" size={14} color="#60a5fa" />
                        <Text className="text-xs font-medium text-white/90 ml-1.5">Archive</Text>
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Settings"
                    >
                        <MaterialIcons name="settings" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Hero Section */}
                <View className="px-6 items-center mt-12 mb-10 text-center">
                    <Text className="text-gray-400 text-sm mb-3 font-medium uppercase tracking-wider text-center">Memories</Text>
                    <Text className="text-4xl font-bold text-white mb-10 tracking-tight leading-tight text-center">
                        Relive The{"\n"}Moments
                    </Text>

                    {/* Categories */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible px-2 -mx-2">
                        {/* Travel */}
                        <TouchableOpacity className="bg-black/60 border border-white/10 px-5 py-2.5 rounded-full flex-row items-center mr-3 active:bg-white/10">
                            <MaterialIcons name="flight" size={16} color="white" />
                            <Text className="text-xs font-medium text-gray-200 ml-2 whitespace-nowrap">Travel</Text>
                        </TouchableOpacity>

                        {/* Adventures */}
                        <TouchableOpacity className="bg-black/60 border border-white/10 px-5 py-2.5 rounded-full flex-row items-center mr-3 active:bg-white/10">
                            <MaterialIcons name="hiking" size={16} color="white" />
                            <Text className="text-xs font-medium text-gray-200 ml-2 whitespace-nowrap">Adventures</Text>
                        </TouchableOpacity>

                        {/* Foodie */}
                        <TouchableOpacity className="bg-black/60 border border-white/10 px-5 py-2.5 rounded-full flex-row items-center mr-3 active:bg-white/10">
                            <MaterialIcons name="restaurant" size={16} color="white" />
                            <Text className="text-xs font-medium text-gray-200 ml-2 whitespace-nowrap">Foodie</Text>
                        </TouchableOpacity>

                        {/* Stays */}
                        <TouchableOpacity className="bg-black/60 border border-white/10 px-5 py-2.5 rounded-full flex-row items-center active:bg-white/10">
                            <MaterialIcons name="hotel" size={16} color="white" />
                            <Text className="text-xs font-medium text-gray-200 ml-2 whitespace-nowrap">Stays</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Completed Goals */}
                <View className="px-6 pb-20 mt-4">
                    <View className="flex-row items-center justify-between mb-5">
                        <Text className="text-lg font-semibold text-white">Completed Goals</Text>
                        <Text className="text-xs text-gray-400">View all</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="overflow-visible pb-6 relative">
                        {completedGoals.length === 0 ? (
                            <Text className="text-gray-500 text-center mt-4">No completed goals yet.</Text>
                        ) : (
                            completedGoals.map((goal: Goal) => (
                                <View key={goal.id} className="w-full h-40 rounded-[24px] p-5 relative overflow-hidden mb-4 bg-gray-900 border border-white/10 shadow-lg shadow-black/50">
                                    <Image source={{ uri: goal.image }} className="absolute inset-0 w-full h-full opacity-50" resizeMode="cover" />
                                    <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.8)']} className="absolute inset-0 z-0" />

                                    <View className="relative z-20 h-full flex-row items-center justify-between">
                                        <View className="flex-1 justify-center">
                                            <Text className="text-xl font-bold text-white leading-tight mb-1">{goal.title}</Text>
                                            <View className="flex-row items-center mt-1">
                                                <MaterialIcons name="place" size={14} color="#9ca3af" />
                                                <Text className="text-xs text-gray-400 ml-1">{goal.location.city}, {goal.location.country}</Text>
                                            </View>
                                        </View>
                                        <View className="w-12 h-12 rounded-full bg-green-500/20 items-center justify-center border border-green-500/30">
                                            <MaterialIcons name="check-circle" size={24} color="#4ade80" />
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
