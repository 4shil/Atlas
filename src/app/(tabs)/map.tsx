import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, Pattern, Rect, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useGoalStore, Goal } from '../../store/useGoalStore';

export default function DarkAdventureMap() {
    const { goals } = useGoalStore();

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />

            {/* Top Map Area 60% */}
            <View className="relative h-[60%] w-full bg-[#050505] z-10 overflow-hidden">

                {/* SVG Map Lines and Dots Pattern */}
                <View className="absolute inset-0 z-0 bg-[#0f0f13]">

                    <Svg width="100%" height="100%" className="absolute inset-0 opacity-20">
                        <Path d="M-10 100 Q 150 150 200 50 T 400 100" fill="none" stroke="#333" strokeWidth="8" />
                        <Path d="M-10 300 Q 100 250 200 350 T 400 300" fill="none" stroke="#333" strokeWidth="6" />
                        <Path d="M150 0 L 150 800" fill="none" stroke="#2a2a2a" strokeWidth="12" />
                        <Path d="M280 0 L 250 800" fill="none" stroke="#2a2a2a" strokeWidth="10" />
                    </Svg>

                    <Svg width="100%" height="100%" className="absolute inset-0 opacity-20">
                        <Defs>
                            <Pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
                                <Circle cx="2" cy="2" r="1.5" fill="#555" />
                            </Pattern>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#dots)" />
                    </Svg>

                </View>

                <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.9)']} className="absolute inset-0 pointer-events-none z-10" />
                <View className="absolute inset-0 bg-blue-900/10 pointer-events-none z-10" />

                <View className="absolute top-1/3 left-1/2 -ml-8 -mt-8 z-20 items-center text-center">
                    <View className="bg-black/80 px-4 py-1.5 rounded-full shadow-lg mb-3 border border-white/10">
                        <Text className="text-[10px] uppercase tracking-widest font-bold text-white">Current</Text>
                    </View>
                    <View className="relative w-16 h-16 items-center justify-center">
                        <View className="w-4 h-4 bg-blue-500 rounded-full border-[3px] border-black shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10" />
                    </View>
                </View>

                {goals.map((goal: Goal, index: number) => {
                    // Quick pseudo-random positioning for mockup purposes 
                    // until react-native-maps is fully integrated.
                    const top = 20 + (index * 15) % 30;
                    const left = 15 + (index * 25) % 70;

                    let IconName = 'place';
                    if (goal.category === 'Travel') IconName = 'flight';
                    if (goal.category === 'Adventures') IconName = 'hiking';
                    if (goal.category === 'Foodie') IconName = 'restaurant';
                    if (goal.category === 'Stays') IconName = 'hotel';

                    return (
                        <View key={goal.id} className="absolute z-20" style={{ top: `${top}%`, left: `${left}%` }}>
                            <View className={`w-10 h-10 rounded-full shadow-2xl items-center justify-center border border-white/20 ${goal.completed ? 'bg-green-900/60' : 'bg-[#111]'}`}>
                                <MaterialIcons name={IconName as any} size={18} color={goal.completed ? '#4ade80' : 'white'} />
                            </View>
                        </View>
                    );
                })}

                {/* Top Floating Buttons */}
                <View className="absolute top-0 left-0 right-0 pt-16 px-6 flex-row justify-between items-start z-30 pointer-events-box-none">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-black/50 items-center justify-center shadow-lg border border-white/10"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <MaterialIcons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-black/50 items-center justify-center shadow-lg border border-white/10"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Filter map"
                    >
                        <MaterialIcons name="tune" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Sheet 48% */}
            <View className="relative flex-1 -mt-10 w-full z-20 rounded-t-[32px] bg-black/90 border-t border-white/10 overflow-hidden flex-col shadow-[0_-10px_60px_rgba(0,0,0,0.8)]">
                <View className="w-full items-center pt-4 pb-2">
                    <View className="w-10 h-1 bg-white/20 rounded-full" />
                </View>

                <ScrollView className="flex-1 px-6 pb-8 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Current Location */}
                    <View className="mb-8">
                        <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Currently In</Text>
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-3xl font-bold text-white tracking-tight">Tokyo, Japan</Text>
                                <View className="flex-row items-center mt-2 space-x-2">
                                    <MaterialIcons name="cloud" size={18} color="#60a5fa" />
                                    <Text className="text-sm font-medium text-blue-400 ml-2">18°C • Night</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/5 items-center justify-center"
                                activeOpacity={0.7}
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                accessibilityRole="button"
                                accessibilityLabel="Recenter map"
                            >
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Next Goals */}
                    <View>
                        <View className="flex-row justify-between items-end mb-5">
                            <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Next Goals</Text>
                            <Text className="text-xs text-blue-400 font-semibold">See all</Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible pb-4" contentContainerStyle={{ paddingRight: 16 }}>
                            {goals.length === 0 ? (
                                <Text className="text-gray-500">No remaining goals.</Text>
                            ) : (
                                goals.slice(0, 5).map((goal: Goal) => (
                                    <View key={goal.id} className="w-[260px] h-[170px] relative rounded-3xl overflow-hidden shadow-black/50 shadow-lg mr-4 border border-white/5 bg-gray-900">
                                        <Image source={{ uri: goal.image }} className="absolute inset-0 w-full h-full opacity-60" resizeMode="cover" />
                                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,1)']} className="absolute inset-0" />

                                        <View className="absolute inset-0 p-5 flex-col justify-between">
                                            <View className="self-end hidden">
                                                <View className="w-8 h-8 rounded-full bg-white/10 border border-white/20 items-center justify-center">
                                                    <MaterialIcons name="bookmark-border" size={16} color="white" />
                                                </View>
                                            </View>
                                            <View className="flex-1 justify-end flex-row items-end">
                                                <View className="flex-1">
                                                    <Text className="text-white font-bold text-xl leading-tight mb-1" numberOfLines={1}>{goal.title}</Text>
                                                    <View className="flex-row items-center">
                                                        <MaterialIcons name="near-me" size={14} color="#3b82f6" />
                                                        <Text className="text-gray-400 text-xs font-medium ml-1">{goal.location.city}, {goal.location.country}</Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center shadow-lg shadow-blue-900/40"
                                                    onPress={() => Haptics.selectionAsync()}
                                                >
                                                    <MaterialIcons name="arrow-forward" size={20} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </ScrollView >
            </View >
        </View >
    );
}
