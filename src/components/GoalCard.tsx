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
        // #32 - 3D tilt effect
        const rotateX = useSharedValue(0);
        const rotateY = useSharedValue(0);

        const cardScaleStyle = useAnimatedStyle(() => ({
            transform: [
                { scale: cardScale.value },
                { rotateX: `${rotateX.value}deg` },
                { rotateY: `${rotateY.value}deg` },
            ],
        }));

        const checkScaleStyle = useAnimatedStyle(() => ({
            transform: [{ scale: checkScale.value }],
        }));

        return (
            <Animated.View style={[{ zIndex: 20 }, animatedStyle, cardScaleStyle]}>
                <TouchableOpacity
                    activeOpacity={0.95}
                    style={cardShadow}
                    className="relative w-[300px] h-[420px] rounded-[24px] overflow-hidden"
                    onPress={onPress}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`View goal: ${goal.title}`}
                    disabled={!isInteractive}
                    onPressIn={() => {
                        // #32 - 3D tilt on press
                        rotateX.value = withSpring(3, { damping: 15, stiffness: 200 });
                        rotateY.value = withSpring(2, { damping: 15, stiffness: 200 });
                    }}
                    onPressOut={() => {
                        rotateX.value = withSpring(0, { damping: 15, stiffness: 200 });
                        rotateY.value = withSpring(0, { damping: 15, stiffness: 200 });
                    }}
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
                            colors={[
                                'transparent',
                                'transparent',
                                'rgba(0,0,0,0.3)',
                                'rgba(0,0,0,0.72)',
                            ]}
                            className="absolute inset-0 pointer-events-none"
                        />

                        {/* Badges */}
                        <View
                            style={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                flexDirection: 'row',
                                gap: 6,
                                alignItems: 'center',
                            }}
                        >
                            {/* #14 - Category Badge */}
                            <View
                                style={{
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

                            {/* Priority Badge */}
                            {goal.priority && (
                                <View
                                    style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: 6,
                                        backgroundColor:
                                            goal.priority === 'high'
                                                ? '#ef4444'
                                                : goal.priority === 'medium'
                                                  ? '#eab308'
                                                  : '#22c55e',
                                        borderWidth: 1.5,
                                        borderColor: 'rgba(255,255,255,0.8)',
                                    }}
                                />
                            )}
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
                                        {goal.tags && goal.tags.length > 0 && (
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    flexWrap: 'wrap',
                                                    gap: 4,
                                                    marginTop: 6,
                                                }}
                                            >
                                                {goal.tags.slice(0, 3).map((tag, i) => (
                                                    <View
                                                        key={i}
                                                        style={{
                                                            backgroundColor: 'rgba(96,165,250,0.2)',
                                                            borderRadius: 99,
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 2,
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                color: '#93c5fd',
                                                                fontSize: 10,
                                                                fontWeight: '600',
                                                            }}
                                                        >
                                                            #{tag}
                                                        </Text>
                                                    </View>
                                                ))}
                                                {goal.tags.length > 3 && (
                                                    <Text
                                                        style={{
                                                            color: 'rgba(255,255,255,0.3)',
                                                            fontSize: 10,
                                                            alignSelf: 'center',
                                                        }}
                                                    >
                                                        +{goal.tags.length - 3}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
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
