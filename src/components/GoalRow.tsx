/**
 * GoalRow
 * Replaces SwipeableGoalRow with a design-thinking focused card.
 *
 * Design principles applied:
 * - Visual hierarchy: image thumbnail → title → location → urgency
 * - Emotional cues: colour coding urgency without being alarming
 * - Progressive disclosure: category icon + days, not a data dump
 * - Affordance: right chevron is discoverable, doesn't clutter
 */

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Goal } from '../store/useGoalStore';
import { getDaysUntil } from '../utils/dateUtils';
import { getCategoryIcon } from '../utils/Icons';

interface GoalRowProps {
    goal: Goal;
    onPress: () => void;
    onComplete: () => void;
}

export function GoalRow({ goal, onPress, onComplete }: GoalRowProps) {
    const daysLeft = getDaysUntil(goal.timelineDate);
    const isOverdue = daysLeft < 0 && !goal.completed;
    const isUrgent = daysLeft <= 7 && daysLeft >= 0 && !goal.completed;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 200,
                friction: 10,
            }),
        ]).start(() => onPress());
        Haptics.selectionAsync();
    };

    const daysLabel = () => {
        if (goal.completed) return 'Done';
        if (daysLeft < 0) return `${Math.abs(daysLeft)}d late`;
        if (daysLeft === 0) return 'Today';
        if (daysLeft === 1) return 'Tomorrow';
        if (daysLeft <= 30) return `${daysLeft}d`;
        return `${Math.round(daysLeft / 30)}mo`;
    };

    const urgencyColor = goal.completed
        ? '#4ade80'
        : isOverdue
          ? '#f87171'
          : isUrgent
            ? '#fbbf24'
            : '#60a5fa';

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 12 }}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={handlePress}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isOverdue
                        ? 'rgba(248,113,113,0.05)'
                        : 'rgba(255,255,255,0.04)',
                    borderWidth: 1,
                    borderColor: isOverdue ? 'rgba(248,113,113,0.35)' : 'rgba(255,255,255,0.08)',
                    borderRadius: 20,
                    overflow: 'hidden',
                    padding: 12,
                }}
            >
                {/* Thumbnail */}
                <View
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 14,
                        overflow: 'hidden',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        marginRight: 14,
                    }}
                >
                    {goal.image ? (
                        <Image
                            source={{ uri: goal.image }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialIcons
                                name={getCategoryIcon(goal.category) as any}
                                size={28}
                                color="rgba(255,255,255,0.2)"
                            />
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={{ flex: 1, marginRight: 12 }}>
                    <Text
                        style={{
                            color: goal.completed ? 'rgba(255,255,255,0.4)' : 'white',
                            fontSize: 15,
                            fontWeight: '700',
                            letterSpacing: -0.2,
                            marginBottom: 3,
                        }}
                        numberOfLines={1}
                    >
                        {goal.title}
                    </Text>

                    {(goal.location.city || goal.location.country) && (
                        <View
                            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
                        >
                            <MaterialIcons name="place" size={12} color="rgba(255,255,255,0.3)" />
                            <Text
                                style={{
                                    color: 'rgba(255,255,255,0.35)',
                                    fontSize: 12,
                                    marginLeft: 3,
                                }}
                                numberOfLines={1}
                            >
                                {[goal.location.city, goal.location.country]
                                    .filter(Boolean)
                                    .join(', ')}
                            </Text>
                        </View>
                    )}

                    {/* Category chip */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                borderRadius: 8,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <MaterialIcons
                                name={getCategoryIcon(goal.category) as any}
                                size={10}
                                color="rgba(255,255,255,0.3)"
                            />
                            <Text
                                style={{
                                    color: 'rgba(255,255,255,0.3)',
                                    fontSize: 11,
                                    marginLeft: 4,
                                    fontWeight: '600',
                                }}
                            >
                                {goal.category}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Right — countdown + complete button */}
                <View style={{ alignItems: 'center', gap: 8 }}>
                    {/* Countdown */}
                    <View
                        style={{
                            backgroundColor: `${urgencyColor}15`,
                            borderWidth: 1,
                            borderColor: `${urgencyColor}30`,
                            borderRadius: 10,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            minWidth: 48,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: urgencyColor, fontSize: 12, fontWeight: '700' }}>
                            {daysLabel()}
                        </Text>
                    </View>

                    {/* Complete toggle */}
                    <TouchableOpacity
                        onPress={e => {
                            e.stopPropagation?.();
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            onComplete();
                        }}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: goal.completed
                                ? 'rgba(74,222,128,0.15)'
                                : 'rgba(255,255,255,0.06)',
                            borderWidth: 1,
                            borderColor: goal.completed
                                ? 'rgba(74,222,128,0.4)'
                                : 'rgba(255,255,255,0.12)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <MaterialIcons
                            name={goal.completed ? 'check-circle' : 'radio-button-unchecked'}
                            size={18}
                            color={goal.completed ? '#4ade80' : 'rgba(255,255,255,0.25)'}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
