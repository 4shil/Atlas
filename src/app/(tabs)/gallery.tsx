import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useGoalStore } from '../../store/useGoalStore';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    runOnJS,
    Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDaysUntil } from '../../utils/dateUtils';
import { CATEGORIES } from '../../utils/constants';

const { width, height } = Dimensions.get('window');
const CARD_W = width * 0.82;
const CARD_H = height * 0.62;
const SWIPE_THRESHOLD = 80;

const CATEGORY_ALL = 'All';

export default function Gallery() {
    const { goals, toggleComplete } = useGoalStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState(CATEGORY_ALL);

    const translateX = useSharedValue(0);
    const cardRotate = useSharedValue(0);

    const filtered = useMemo(() => {
        if (activeCategory === CATEGORY_ALL) return goals;
        return goals.filter(g => g.category === activeCategory);
    }, [goals, activeCategory]);

    const current = filtered[activeIndex] ?? null;
    const next = filtered[(activeIndex + 1) % filtered.length] ?? null;
    const prev = filtered[(activeIndex - 1 + filtered.length) % filtered.length] ?? null;

    const goNext = useCallback(() => {
        if (filtered.length < 2) return;
        setActiveIndex(i => (i + 1) % filtered.length);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        translateX.value = 0;
        cardRotate.value = 0;
    }, [filtered.length]);

    const goPrev = useCallback(() => {
        if (filtered.length < 2) return;
        setActiveIndex(i => (i - 1 + filtered.length) % filtered.length);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        translateX.value = 0;
        cardRotate.value = 0;
    }, [filtered.length]);

    const swipe = Gesture.Pan()
        .onUpdate(e => {
            translateX.value = e.translationX;
            cardRotate.value = interpolate(
                e.translationX,
                [-width, width],
                [-12, 12],
                Extrapolation.CLAMP
            );
        })
        .onEnd(e => {
            if (e.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withTiming(-width * 1.2, { duration: 260 }, () =>
                    runOnJS(goNext)()
                );
            } else if (e.translationX > SWIPE_THRESHOLD) {
                translateX.value = withTiming(width * 1.2, { duration: 260 }, () =>
                    runOnJS(goPrev)()
                );
            } else {
                translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
                cardRotate.value = withSpring(0);
            }
        });

    const frontStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { rotate: `${cardRotate.value}deg` },
            {
                scale: interpolate(
                    Math.abs(translateX.value),
                    [0, 200],
                    [1, 0.96],
                    Extrapolation.CLAMP
                ),
            },
        ],
        zIndex: 30,
    }));

    const backStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: interpolate(
                    Math.abs(translateX.value),
                    [0, 200],
                    [0.94, 1],
                    Extrapolation.CLAMP
                ),
            },
            {
                translateY: interpolate(
                    Math.abs(translateX.value),
                    [0, 200],
                    [20, 0],
                    Extrapolation.CLAMP
                ),
            },
        ],
        opacity: interpolate(Math.abs(translateX.value), [0, 200], [0.5, 1], Extrapolation.CLAMP),
        zIndex: 20,
    }));

    const handleCategoryChange = (cat: string) => {
        Haptics.selectionAsync();
        setActiveCategory(cat);
        setActiveIndex(0);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#050508' }}>
            <StatusBar barStyle="light-content" />

            {/* Full-bleed blurred background from current card image */}
            {current?.image && (
                <Image
                    source={current.image}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    contentFit="cover"
                    blurRadius={60}
                />
            )}
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(5,5,8,0.82)' }} />

            {/* Header */}
            <View
                style={{
                    paddingTop: insets.top + 12,
                    paddingHorizontal: 24,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <View>
                    <Text
                        style={{
                            color: 'rgba(255,255,255,0.35)',
                            fontSize: 10,
                            fontWeight: '700',
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                        }}
                    >
                        Collection
                    </Text>
                    <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', marginTop: 2 }}>
                        Gallery
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/notifications');
                        }}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(255,255,255,0.07)',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.1)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <MaterialIcons
                            name="notifications-none"
                            size={20}
                            color="rgba(255,255,255,0.8)"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            router.push('/add-goal');
                        }}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#2563eb',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <MaterialIcons name="add" size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Category Filter Rail */}
            <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingVertical: 16 }}
            >
                {[CATEGORY_ALL, ...CATEGORIES.filter(c => c !== 'All')].map(cat => {
                    const active = activeCategory === cat;
                    const count =
                        cat === CATEGORY_ALL
                            ? goals.length
                            : goals.filter(g => g.category === cat).length;
                    return (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => handleCategoryChange(cat)}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 99,
                                backgroundColor: active ? '#2563eb' : 'rgba(255,255,255,0.06)',
                                borderWidth: 1,
                                borderColor: active ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 5,
                            }}
                        >
                            <Text
                                style={{
                                    color: active ? 'white' : 'rgba(255,255,255,0.45)',
                                    fontSize: 12,
                                    fontWeight: '600',
                                }}
                            >
                                {cat}
                            </Text>
                            {count > 0 && (
                                <View
                                    style={{
                                        backgroundColor: active
                                            ? 'rgba(255,255,255,0.2)'
                                            : 'rgba(255,255,255,0.07)',
                                        borderRadius: 99,
                                        paddingHorizontal: 6,
                                        paddingVertical: 1,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: active ? 'white' : 'rgba(255,255,255,0.3)',
                                            fontSize: 9,
                                            fontWeight: '700',
                                        }}
                                    >
                                        {count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </Animated.ScrollView>

            {/* Card Stack */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {filtered.length === 0 ? (
                    <View style={{ alignItems: 'center', gap: 12 }}>
                        <View
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: 36,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <MaterialIcons
                                name="photo-library"
                                size={32}
                                color="rgba(255,255,255,0.2)"
                            />
                        </View>
                        <Text
                            style={{
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: 15,
                                fontWeight: '600',
                            }}
                        >
                            No goals in {activeCategory}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                router.push('/add-goal');
                            }}
                            style={{
                                marginTop: 8,
                                backgroundColor: '#2563eb',
                                paddingHorizontal: 24,
                                paddingVertical: 12,
                                borderRadius: 99,
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
                                Add a dream
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Back card (next) */}
                        {filtered.length > 1 && next && (
                            <Animated.View
                                style={[
                                    { position: 'absolute', width: CARD_W, height: CARD_H },
                                    backStyle,
                                ]}
                            >
                                <GalleryCard
                                    goal={next}
                                    interactive={false}
                                    onPress={() => {}}
                                    onComplete={() => {}}
                                />
                            </Animated.View>
                        )}

                        {/* Front card (current) */}
                        {current && (
                            <GestureDetector gesture={swipe}>
                                <Animated.View
                                    style={[{ width: CARD_W, height: CARD_H }, frontStyle]}
                                >
                                    <GalleryCard
                                        goal={current}
                                        interactive
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            router.push({
                                                pathname: '/goal-detail',
                                                params: { id: current.id },
                                            });
                                        }}
                                        onComplete={() => {
                                            Haptics.notificationAsync(
                                                Haptics.NotificationFeedbackType.Success
                                            );
                                            toggleComplete(current.id);
                                        }}
                                    />
                                </Animated.View>
                            </GestureDetector>
                        )}
                    </>
                )}
            </View>

            {/* Bottom Bar */}
            {filtered.length > 0 && (
                <View
                    style={{
                        paddingBottom: insets.bottom + 80,
                        paddingHorizontal: 32,
                        alignItems: 'center',
                        gap: 16,
                    }}
                >
                    {/* Dots */}
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        {filtered.slice(0, 12).map((_, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => {
                                    setActiveIndex(i);
                                    Haptics.selectionAsync();
                                }}
                            >
                                <View
                                    style={{
                                        width: i === activeIndex ? 22 : 6,
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor:
                                            i === activeIndex
                                                ? '#3b82f6'
                                                : 'rgba(255,255,255,0.15)',
                                    }}
                                />
                            </TouchableOpacity>
                        ))}
                        {filtered.length > 12 && (
                            <Text
                                style={{
                                    color: 'rgba(255,255,255,0.3)',
                                    fontSize: 10,
                                    marginLeft: 4,
                                }}
                            >
                                +{filtered.length - 12}
                            </Text>
                        )}
                    </View>

                    {/* Nav arrows + counter */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                        <TouchableOpacity
                            onPress={goPrev}
                            disabled={filtered.length < 2}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: 'rgba(255,255,255,0.07)',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.1)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <MaterialIcons
                                name="chevron-left"
                                size={24}
                                color="rgba(255,255,255,0.5)"
                            />
                        </TouchableOpacity>
                        <Text
                            style={{
                                color: 'rgba(255,255,255,0.35)',
                                fontSize: 12,
                                fontWeight: '600',
                                minWidth: 50,
                                textAlign: 'center',
                            }}
                        >
                            {activeIndex + 1} / {filtered.length}
                        </Text>
                        <TouchableOpacity
                            onPress={goNext}
                            disabled={filtered.length < 2}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: 'rgba(255,255,255,0.07)',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.1)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <MaterialIcons
                                name="chevron-right"
                                size={24}
                                color="rgba(255,255,255,0.5)"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

// ─── Gallery Card ────────────────────────────────────────────────────────────

interface GalleryCardProps {
    goal: import('../../store/useGoalStore').Goal;
    interactive: boolean;
    onPress: () => void;
    onComplete: () => void;
}

function GalleryCard({ goal, interactive, onPress, onComplete }: GalleryCardProps) {
    const daysLeft = getDaysUntil(goal.timelineDate);
    const isOverdue = daysLeft < 0 && !goal.completed;

    const countdownColor = goal.completed
        ? '#4ade80'
        : isOverdue
          ? '#f87171'
          : daysLeft <= 7
            ? '#fbbf24'
            : '#60a5fa';

    const countdownLabel = goal.completed
        ? 'Completed ✓'
        : isOverdue
          ? `${Math.abs(daysLeft)}d overdue`
          : daysLeft === 0
            ? 'Today!'
            : `${daysLeft}d left`;

    return (
        <TouchableOpacity
            activeOpacity={interactive ? 0.92 : 1}
            onPress={interactive ? onPress : undefined}
            style={{
                width: '100%',
                height: '100%',
                borderRadius: 28,
                overflow: 'hidden',
                backgroundColor: '#111',
            }}
        >
            {/* Full-bleed image */}
            <Image
                source={goal.image}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                contentFit="cover"
                transition={400}
            />

            {/* Gradient overlay */}
            <LinearGradient
                colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.88)']}
                locations={[0, 0.4, 1]}
                style={{ position: 'absolute', inset: 0 }}
            />

            {/* Top row: category + status */}
            <View
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    right: 20,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                }}
            >
                {/* Category chip */}
                <BlurView
                    intensity={30}
                    tint="dark"
                    style={{ borderRadius: 99, overflow: 'hidden' }}
                >
                    <View
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 99,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                        }}
                    >
                        <MaterialIcons
                            name={
                                goal.category === 'Foodie'
                                    ? 'restaurant'
                                    : goal.category === 'Stays'
                                      ? 'hotel'
                                      : goal.category === 'Milestone'
                                        ? 'star'
                                        : goal.category === 'Adventures'
                                          ? 'hiking'
                                          : 'flight'
                            }
                            size={12}
                            color="rgba(255,255,255,0.7)"
                        />
                        <Text
                            style={{
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: 11,
                                fontWeight: '600',
                            }}
                        >
                            {goal.category}
                        </Text>
                    </View>
                </BlurView>

                {/* Complete toggle (interactive only) */}
                {interactive && (
                    <TouchableOpacity
                        onPress={e => {
                            e.stopPropagation?.();
                            onComplete();
                        }}
                        style={{ borderRadius: 99, overflow: 'hidden' }}
                    >
                        <BlurView
                            intensity={30}
                            tint="dark"
                            style={{ borderRadius: 99, overflow: 'hidden' }}
                        >
                            <View
                                style={{
                                    backgroundColor: goal.completed
                                        ? 'rgba(74,222,128,0.2)'
                                        : 'rgba(0,0,0,0.3)',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 99,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 5,
                                }}
                            >
                                <MaterialIcons
                                    name={
                                        goal.completed ? 'check-circle' : 'radio-button-unchecked'
                                    }
                                    size={14}
                                    color={goal.completed ? '#4ade80' : 'rgba(255,255,255,0.5)'}
                                />
                                <Text
                                    style={{
                                        color: goal.completed ? '#4ade80' : 'rgba(255,255,255,0.5)',
                                        fontSize: 11,
                                        fontWeight: '600',
                                    }}
                                >
                                    {goal.completed ? 'Done' : 'Mark done'}
                                </Text>
                            </View>
                        </BlurView>
                    </TouchableOpacity>
                )}
            </View>

            {/* Bottom info */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24 }}>
                {/* Countdown badge */}
                <View
                    style={{
                        backgroundColor: `${countdownColor}18`,
                        borderWidth: 1,
                        borderColor: `${countdownColor}35`,
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        alignSelf: 'flex-start',
                        marginBottom: 12,
                    }}
                >
                    <Text style={{ color: countdownColor, fontSize: 11, fontWeight: '700' }}>
                        {countdownLabel}
                    </Text>
                </View>

                <Text
                    style={{
                        color: 'white',
                        fontSize: 26,
                        fontWeight: '800',
                        lineHeight: 30,
                        marginBottom: 8,
                    }}
                    numberOfLines={2}
                >
                    {goal.title}
                </Text>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                        <MaterialIcons name="place" size={13} color="rgba(255,255,255,0.45)" />
                        <Text
                            style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}
                            numberOfLines={1}
                        >
                            {goal.location.city
                                ? `${goal.location.city}, ${goal.location.country}`
                                : 'No location set'}
                        </Text>
                    </View>

                    {interactive && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                                View
                            </Text>
                            <MaterialIcons
                                name="arrow-forward-ios"
                                size={10}
                                color="rgba(255,255,255,0.3)"
                            />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
