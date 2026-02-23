import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { Goal } from '../store/useGoalStore';

interface GoalCardProps {
    goal: Goal;
    onPress: () => void;
    onToggleComplete: () => void;
    onNext?: () => void; // Optional next button logic for center card
    animatedStyle?: any;
    isInteractive?: boolean;
}

export function GoalCard({ goal, onPress, onToggleComplete, onNext, animatedStyle, isInteractive = true }: GoalCardProps) {
    return (
        <Animated.View style={[{ zIndex: 20 }, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.95}
                className="relative w-[300px] h-[440px] bg-gray-900 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden"
                onPress={onPress}
                disabled={!isInteractive}
            >
                <View className="h-full w-full relative">
                    <Image source={{ uri: goal.image }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} className="absolute inset-0 pointer-events-none" />

                    {isInteractive && (
                        <TouchableOpacity
                            className="absolute top-4 right-4 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 flex-row items-center"
                            onPress={(e) => { e.stopPropagation?.(); onToggleComplete(); }}
                        >
                            {goal.completed ? (
                                <MaterialIcons name="check-circle" size={14} color="#10b981" />
                            ) : (
                                <MaterialIcons name="schedule" size={14} color="#60a5fa" />
                            )}
                        </TouchableOpacity>
                    )}

                    <View className="absolute bottom-0 left-0 right-0 p-5 bg-black/40 border-t border-white/10">
                        <View className="flex-row justify-between items-end">
                            <View className="flex-1 mr-4">
                                <Text className="text-2xl font-bold text-white leading-none mb-2" numberOfLines={1}>{goal.title}</Text>
                                <View className="flex-row items-center mt-1">
                                    <MaterialIcons name="place" size={16} color="rgba(255,255,255,0.7)" />
                                    <Text className="text-sm font-light text-gray-300 ml-1 tracking-wide" numberOfLines={1}>
                                        {goal.location.city || 'No location'}
                                        {goal.location.country ? `, ${goal.location.country}` : ''}
                                    </Text>
                                </View>
                            </View>

                            {isInteractive && onNext && (
                                <TouchableOpacity
                                    className="w-10 h-10 rounded-full bg-white/10 border border-white/20 items-center justify-center"
                                    onPress={(e) => { e.stopPropagation?.(); onNext(); }}
                                >
                                    <MaterialIcons name="arrow-forward" size={18} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
