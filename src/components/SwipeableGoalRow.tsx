/**
 * SwipeableGoalRow
 * Swipe right to reveal a "Mark Complete" action.
 * Uses Reanimated 3 + Gesture Handler.
 */
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Goal } from '../store/useGoalStore';

interface Props {
    goal: Goal;
    categoryIcon: string;
    isOverdue: boolean;
    isUrgent: boolean;
    days: number;
    onPress: () => void;
    onComplete: () => void;
}

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 72;

export default function SwipeableGoalRow({
    goal,
    categoryIcon,
    isOverdue,
    isUrgent,
    days,
    onPress,
    onComplete,
}: Props) {
    const translateX = useSharedValue(0);
    const actionOpacity = useSharedValue(0);
    const actionScale = useSharedValue(0.7);

    const triggerComplete = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete();
    }, [onComplete]);

    const resetRow = useCallback(() => {
        translateX.value = withSpring(0, { damping: 20 });
        actionOpacity.value = withTiming(0);
        actionScale.value = withTiming(0.7);
    }, []);

    const panGesture = Gesture.Pan()
        .activeOffsetX([10, 10000]) // only activate on horizontal right swipe
        .failOffsetY([-15, 15])
        .onUpdate(e => {
            if (e.translationX > 0) {
                translateX.value = Math.min(e.translationX, ACTION_WIDTH + 20);
                const progress = Math.min(e.translationX / SWIPE_THRESHOLD, 1);
                actionOpacity.value = progress;
                actionScale.value = 0.7 + progress * 0.3;
            }
        })
        .onEnd(e => {
            if (e.translationX >= SWIPE_THRESHOLD) {
                translateX.value = withTiming(0, { duration: 250 });
                actionOpacity.value = withTiming(0, { duration: 200 });
                actionScale.value = withTiming(0.7, { duration: 200 });
                runOnJS(triggerComplete)();
            } else {
                runOnJS(resetRow)();
            }
        });

    const rowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const actionStyle = useAnimatedStyle(() => ({
        opacity: actionOpacity.value,
        transform: [{ scale: actionScale.value }],
    }));

    return (
        <View className="mb-3 relative">
            {/* Background action (revealed on swipe) */}
            <View className="absolute left-0 top-0 bottom-0 w-20 items-center justify-center rounded-2xl bg-green-700/80">
                <Animated.View style={actionStyle} className="items-center justify-center">
                    <MaterialIcons name="check-circle" size={28} color="white" />
                    <Text className="text-white text-[10px] mt-0.5 font-semibold">Done!</Text>
                </Animated.View>
            </View>

            {/* Swipeable row */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={rowStyle}>
                    <TouchableOpacity
                        className="bg-black/40 p-4 rounded-2xl flex-row items-center justify-between border border-gray-800"
                        activeOpacity={0.7}
                        onPress={onPress}
                    >
                        <View className="flex-row items-center flex-1 mr-3">
                            <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${isOverdue ? 'bg-red-950 border border-red-900' : isUrgent ? 'bg-amber-950 border border-amber-900' : 'bg-gray-900 border border-gray-700'}`}>
                                <MaterialIcons
                                    name={categoryIcon as any}
                                    size={20}
                                    color={isOverdue ? '#f87171' : isUrgent ? '#fbbf24' : 'white'}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-white" numberOfLines={1}>{goal.title}</Text>
                                <View className="flex-row items-center mt-0.5">
                                    {goal.location.city ? (
                                        <>
                                            <MaterialIcons name="place" size={11} color="#6b7280" />
                                            <Text className="text-xs text-gray-500 ml-0.5" numberOfLines={1}>{goal.location.city}</Text>
                                            <Text className="text-gray-700 mx-1">·</Text>
                                        </>
                                    ) : null}
                                    <Text className={`text-xs font-medium ${isOverdue ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-gray-500'}`}>
                                        {isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today!' : `${days}d left`}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View className="items-end">
                            <View className="bg-black/40 border border-white/5 px-2.5 py-1 rounded-full mb-1">
                                <Text className="text-gray-500 text-[10px]">{goal.category}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={18} color="#374151" />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}
