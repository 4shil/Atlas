import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Goal } from '../store/useGoalStore';
import { getThumbnailUrl } from '../utils/imageUtils';

// #14 - Category badge colors
const CATEGORY_COLORS: Record<string, string> = {
    adventure: '#f97316',
    travel: '#3b82f6',
    food: '#22c55e',
    culture: '#a855f7',
    nature: '#10b981',
    sports: '#ef4444',
    default: '#6366f1',
};

interface GoalCardProps {
    goal: Goal;
    onPress: () => void;
    onToggleComplete: () => void;
    onNext?: () => void;
    animatedStyle?: any;
    isInteractive?: boolean;
}

export const GoalCard = React.memo(
    function GoalCard({
        goal,
        onPress,
        onToggleComplete,
        onNext,
        animatedStyle,
        isInteractive = true,
    }: GoalCardProps) {
        // #15 - Completion button scale
        const checkScale = useSharedValue(1);
        // #16 - Card long-press scale
        const cardScale = useSharedValue(1);

        const cardScaleStyle = useAnimatedStyle(() => ({
            transform: [{ scale: cardScale.value }],
        }));

        const checkScaleStyle = useAnimatedStyle(() => ({
            transform: [{ scale: checkScale.value }],
        }));

        return (
            <Animated.View style={[{ zIndex: 20 }, animatedStyle, cardScaleStyle]}>
                <TouchableOpacity
                    activeOpacity={0.95}
                    style={cardShadow}
                    className="relative w-[300px] h-[440px] rounded-[28px] overflow-hidden"
                    onPress={onPress}
                    disabled={!isInteractive}
                    onLongPress={() => {
                        // #16
                        cardScale.value = withSequence(withSpring(0.97), withSpring(1.0));
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                >
                    <View className="h-full w-full relative">
                        <Image
                            source={{ uri: getThumbnailUrl(goal.image, 400) }}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                            contentFit="cover"
                            transition={300}
                            placeholder={{ blurhash: 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.' }}
                            recyclingKey={goal.id}
                            accessibilityLabel={goal.title}
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.85)']}
                            className="absolute inset-0 pointer-events-none"
                        />

                        {/* #14 - Category Badge */}
                        <View
                            style={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                backgroundColor:
                                    CATEGORY_COLORS[goal.category.toLowerCase()] ??
                                    CATEGORY_COLORS.default,
                                borderRadius: 99,
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
                                {goal.category}
                            </Text>
                        </View>

                        {isInteractive && (
                            // #15 - Completion button with scale animation
                            <Animated.View
                                style={[
                                    { position: 'absolute', top: 4, right: 4 },
                                    checkScaleStyle,
                                ]}
                            >
                                <TouchableOpacity
                                    className="rounded-full overflow-hidden"
                                    onPress={e => {
                                        e.stopPropagation?.();
                                        checkScale.value = withSequence(
                                            withSpring(1.35),
                                            withSpring(1.0)
                                        );
                                        onToggleComplete();
                                    }}
                                >
                                    <BlurView
                                        intensity={40}
                                        tint="dark"
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingHorizontal: 12,
                                            paddingVertical: 7,
                                            borderRadius: 20,
                                        }}
                                    >
                                        <View
                                            style={{
                                                ...StyleSheet.absoluteFillObject,
                                                backgroundColor: 'rgba(255,255,255,0.08)',
                                                borderRadius: 20,
                                            }}
                                        />
                                        {goal.completed ? (
                                            <MaterialIcons
                                                name="check-circle"
                                                size={14}
                                                color="#34d399"
                                            />
                                        ) : (
                                            <MaterialIcons
                                                name="schedule"
                                                size={14}
                                                color="#93c5fd"
                                            />
                                        )}
                                    </BlurView>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* Glassmorphic bottom info panel */}
                        <View className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-[28px]">
                            <BlurView intensity={50} tint="dark" style={{ padding: 20 }}>
                                <View
                                    style={{
                                        ...StyleSheet.absoluteFillObject,
                                        backgroundColor: 'rgba(0,0,0,0.25)',
                                    }}
                                />
                                <View className="flex-row justify-between items-end">
                                    <View className="flex-1 mr-4">
                                        <Text
                                            className="text-2xl font-bold text-white leading-none mb-2"
                                            numberOfLines={1}
                                        >
                                            {goal.title}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <MaterialIcons
                                                name="place"
                                                size={16}
                                                color="rgba(255,255,255,0.6)"
                                            />
                                            <Text
                                                className="text-sm font-light text-white/60 ml-1 tracking-wide"
                                                numberOfLines={1}
                                            >
                                                {goal.location.city || 'No location'}
                                                {goal.location.country
                                                    ? `, ${goal.location.country}`
                                                    : ''}
                                            </Text>
                                        </View>
                                    </View>

                                    {isInteractive && onNext && (
                                        <TouchableOpacity
                                            className="w-10 h-10 rounded-full bg-white/15 border border-white/20 items-center justify-center"
                                            onPress={e => {
                                                e.stopPropagation?.();
                                                onNext();
                                            }}
                                        >
                                            <MaterialIcons
                                                name="arrow-forward"
                                                size={18}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </BlurView>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    },
    (prev, next) =>
        prev.goal.id === next.goal.id &&
        prev.goal.completed === next.goal.completed &&
        prev.goal.completedAt === next.goal.completedAt &&
        prev.goal.title === next.goal.title
);

const cardShadow = Platform.select({
    ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    android: { elevation: 14 },
}) as any;
