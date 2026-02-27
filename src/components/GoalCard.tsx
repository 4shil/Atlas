import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { Goal } from '../store/useGoalStore';

interface GoalCardProps {
    goal: Goal;
    onPress: () => void;
    onToggleComplete: () => void;
    onNext?: () => void; 
    animatedStyle?: any;
    isInteractive?: boolean;
}

export function GoalCard({ goal, onPress, onToggleComplete, onNext, animatedStyle, isInteractive = true }: GoalCardProps) {
    return (
        <Animated.View style={[{ zIndex: 20 }, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.95}
                style={cardShadow}
                className="relative w-[300px] h-[440px] rounded-[28px] overflow-hidden"
                onPress={onPress}
                disabled={!isInteractive}
            >
                <View className="h-full w-full relative">
                    <Image source={{ uri: goal.image }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} className="absolute inset-0 pointer-events-none" />

                    {isInteractive && (
                        <TouchableOpacity
                            className="absolute top-4 right-4 rounded-full overflow-hidden"
                            onPress={(e) => { e.stopPropagation?.(); onToggleComplete(); }}
                        >
                            <BlurView intensity={40} tint="dark" style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 }}>
                                <View style={{ position: 'absolute', ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20 }} />
                                {goal.completed ? (
                                    <MaterialIcons name="check-circle" size={14} color="#34d399" />
                                ) : (
                                    <MaterialIcons name="schedule" size={14} color="#93c5fd" />
                                )}
                            </BlurView>
                        </TouchableOpacity>
                    )}

                    {/* Glassmorphic bottom info panel */}
                    <View className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-[28px]">
                        <BlurView intensity={50} tint="dark" style={{ padding: 20 }}>
                            <View style={{ position: 'absolute', ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' }} />
                            <View className="flex-row justify-between items-end">
                                <View className="flex-1 mr-4">
                                    <Text className="text-2xl font-bold text-white leading-none mb-2" numberOfLines={1}>{goal.title}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <MaterialIcons name="place" size={16} color="rgba(255,255,255,0.6)" />
                                        <Text className="text-sm font-light text-white/60 ml-1 tracking-wide" numberOfLines={1}>
                                            {goal.location.city || 'No location'}
                                            {goal.location.country ? `, ${goal.location.country}` : ''}
                                        </Text>
                                    </View>
                                </View>

                                {isInteractive && onNext && (
                                    <TouchableOpacity
                                        className="w-10 h-10 rounded-full bg-white/15 border border-white/20 items-center justify-center"
                                        onPress={(e) => { e.stopPropagation?.(); onNext(); }}
                                    >
                                        <MaterialIcons name="arrow-forward" size={18} color="white" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </BlurView>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const cardShadow = Platform.select({
    ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    android: { elevation: 14 },
}) as any;
