/**
 * NextDreamHero
 * The most important design-thinking element — surfaces the user's
 * single closest upcoming goal as the emotional centrepiece of the app.
 * "What are you working towards?" is always answered above the fold.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Goal } from '../store/useGoalStore';
import { getDaysUntil } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

interface Props {
    goal: Goal;
    totalGoals: number;
    completedCount: number;
    onPress: () => void;
    onAddGoal: () => void;
}

export function NextDreamHero({ goal, totalGoals, completedCount, onPress, onAddGoal }: Props) {
    const daysLeft = getDaysUntil(goal.timelineDate);
    const progress = totalGoals > 0 ? completedCount / totalGoals : 0;
    const shimmer = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Subtle shimmer on progress bar
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        ).start();

        // Pulse the countdown if urgent
        if (daysLeft > 0 && daysLeft <= 7) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, { toValue: 1.06, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [daysLeft]);

    const urgencyColor = daysLeft < 0 ? '#f87171' : daysLeft <= 7 ? '#fbbf24' : '#60a5fa';

    const countdownLabel = () => {
        if (goal.completed) return 'Completed ✓';
        if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
        if (daysLeft === 0) return 'Today is the day!';
        if (daysLeft === 1) return 'Tomorrow';
        if (daysLeft <= 7) return `${daysLeft} days left`;
        if (daysLeft <= 30) return `${daysLeft} days to go`;
        const months = Math.round(daysLeft / 30);
        return `${months} month${months !== 1 ? 's' : ''} away`;
    };

    return (
        <View className="mx-6 mt-6 mb-2">
            {/* Hero Card */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onPress();
                }}
                style={{ borderRadius: 28, overflow: 'hidden', height: 260 }}
            >
                <ImageBackground
                    source={{
                        uri:
                            goal.image ||
                            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
                    }}
                    style={{ flex: 1 }}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={[
                            'transparent',
                            'transparent',
                            'rgba(0,0,0,0.7)',
                            'rgba(0,0,0,0.95)',
                        ]}
                        style={{ flex: 1, padding: 20, justifyContent: 'flex-end' }}
                    >
                        {/* Urgency badge */}
                        <Animated.View
                            style={{
                                transform: [{ scale: pulse }],
                                alignSelf: 'flex-start',
                                marginBottom: 12,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: `${urgencyColor}20`,
                                    borderWidth: 1,
                                    borderColor: `${urgencyColor}50`,
                                    borderRadius: 20,
                                    paddingHorizontal: 12,
                                    paddingVertical: 5,
                                }}
                            >
                                <MaterialIcons
                                    name={
                                        daysLeft < 0
                                            ? 'warning'
                                            : daysLeft <= 7
                                              ? 'local-fire-department'
                                              : 'schedule'
                                    }
                                    size={12}
                                    color={urgencyColor}
                                />
                                <Text
                                    style={{
                                        color: urgencyColor,
                                        fontSize: 12,
                                        fontWeight: '700',
                                        marginLeft: 5,
                                        letterSpacing: 0.3,
                                    }}
                                >
                                    {countdownLabel()}
                                </Text>
                            </View>
                        </Animated.View>

                        <Text
                            style={{
                                color: 'white',
                                fontSize: 26,
                                fontWeight: '800',
                                letterSpacing: -0.5,
                                lineHeight: 32,
                            }}
                            numberOfLines={2}
                        >
                            {goal.title}
                        </Text>

                        {/* Location */}
                        {(goal.location.city || goal.location.country) && (
                            <View
                                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
                            >
                                <MaterialIcons
                                    name="place"
                                    size={14}
                                    color="rgba(255,255,255,0.5)"
                                />
                                <Text
                                    style={{
                                        color: 'rgba(255,255,255,0.5)',
                                        fontSize: 13,
                                        marginLeft: 4,
                                    }}
                                >
                                    {[goal.location.city, goal.location.country]
                                        .filter(Boolean)
                                        .join(', ')}
                                </Text>
                            </View>
                        )}
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>

            {/* Progress bar — your journey at a glance */}
            <View style={{ marginTop: 16, marginBottom: 4 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                    }}
                >
                    <Text
                        style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: 11,
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: 0.8,
                        }}
                    >
                        Your Journey
                    </Text>
                    <Text
                        style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600' }}
                    >
                        {completedCount} / {totalGoals} dreams lived
                    </Text>
                </View>
                <View
                    style={{
                        height: 6,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderRadius: 3,
                        overflow: 'hidden',
                    }}
                >
                    <Animated.View
                        style={{
                            height: '100%',
                            width: `${progress * 100}%`,
                            borderRadius: 3,
                            backgroundColor: '#60a5fa',
                            opacity: shimmer.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.7, 1],
                            }),
                        }}
                    />
                </View>
            </View>

            {/* Goal Gradient Effect — momentum row */}
            {totalGoals > 0 && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    {/* Goals left */}
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.08)',
                            borderRadius: 16,
                            padding: 12,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>
                            {totalGoals - completedCount}
                        </Text>
                        <Text
                            style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}
                        >
                            dreams ahead
                        </Text>
                    </View>
                    {/* Completed */}
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(74,222,128,0.06)',
                            borderWidth: 1,
                            borderColor: 'rgba(74,222,128,0.15)',
                            borderRadius: 16,
                            padding: 12,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: '#4ade80', fontSize: 22, fontWeight: '800' }}>
                            {completedCount}
                        </Text>
                        <Text style={{ color: 'rgba(74,222,128,0.5)', fontSize: 11, marginTop: 2 }}>
                            lived ✓
                        </Text>
                    </View>
                    {/* Completion % */}
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(96,165,250,0.06)',
                            borderWidth: 1,
                            borderColor: 'rgba(96,165,250,0.15)',
                            borderRadius: 16,
                            padding: 12,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: '#60a5fa', fontSize: 22, fontWeight: '800' }}>
                            {totalGoals > 0 ? Math.round((completedCount / totalGoals) * 100) : 0}%
                        </Text>
                        <Text style={{ color: 'rgba(96,165,250,0.5)', fontSize: 11, marginTop: 2 }}>
                            complete
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}

// Shown when no goals exist yet
export function HeroEmpty({
    onAddGoal,
    hasCompleted = false,
}: {
    onAddGoal: () => void;
    hasCompleted?: boolean;
}) {
    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideUp, {
                toValue: 0,
                useNativeDriver: true,
                tension: 60,
                friction: 10,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={{
                opacity: fadeIn,
                transform: [{ translateY: slideUp }],
                marginHorizontal: 24,
                marginTop: 24,
                marginBottom: 8,
            }}
        >
            <View
                style={{
                    borderRadius: 28,
                    overflow: 'hidden',
                    height: 260,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 32,
                }}
            >
                <Text style={{ fontSize: 52, marginBottom: 16 }}>🌍</Text>
                <Text
                    style={{
                        color: 'white',
                        fontSize: 22,
                        fontWeight: '800',
                        textAlign: 'center',
                        letterSpacing: -0.3,
                        marginBottom: 10,
                    }}
                >
                    Every great journey{'\n'}starts with a dream
                </Text>
                <Text
                    style={{
                        color: 'rgba(255,255,255,0.35)',
                        fontSize: 14,
                        textAlign: 'center',
                        lineHeight: 20,
                        marginBottom: 24,
                    }}
                >
                    {hasCompleted
                        ? 'All dreams complete! Time to add the next chapter of your life.'
                        : 'Add your first bucket list goal and start building the life you imagined.'}
                </Text>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#2563eb',
                        paddingHorizontal: 28,
                        paddingVertical: 13,
                        borderRadius: 20,
                    }}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        onAddGoal();
                    }}
                    activeOpacity={0.85}
                >
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                        {hasCompleted ? 'Add Next Dream' : 'Add Your First Dream'}
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}
