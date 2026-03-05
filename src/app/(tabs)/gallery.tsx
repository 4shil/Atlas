import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    StyleSheet,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    withRepeat,
    withSequence,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDaysUntil } from '../../utils/dateUtils';
import { GoalCardSkeleton as SkeletonCard } from '../../components/GoalCardSkeleton';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 70;

export default function Gallery() {
    const { goals, toggleComplete } = useGoalStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeIndex, setActiveIndex] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // #31 - Notification badge count
    const notifBadgeCount = React.useMemo(() => {
        const now = Date.now();
        return goals.filter(
            g => !g.completed && new Date(g.timelineDate).getTime() <= now + 7 * 86400000
        ).length;
    }, [goals]);
    const badgeScale = useSharedValue(1);
    React.useEffect(() => {
        if (notifBadgeCount > 0) {
            badgeScale.value = withRepeat(
                withSequence(
                    withTiming(1.25, { duration: 700 }),
                    withTiming(1.0, { duration: 700 })
                ),
                -1,
                true
            );
        }
    }, [notifBadgeCount]);
    const badgeScaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: badgeScale.value }],
    }));

    React.useEffect(() => {
        // Simulate initial data load — goals already in store
        const t = setTimeout(() => setIsInitialLoad(false), 600);
        return () => clearTimeout(t);
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Re-fetch from Supabase by re-triggering the store listener
        await new Promise(r => setTimeout(r, 800));
        setRefreshing(false);
    }, []);

    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);

    const current = goals[activeIndex] ?? null;
    const nextGoal = goals[(activeIndex + 1) % goals.length] ?? null;

    const goNext = useCallback(() => {
        if (goals.length < 2) return;
        setActiveIndex(i => (i + 1) % goals.length);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        translateX.value = 0;
        rotate.value = 0;
    }, [goals.length, rotate, translateX]);

    const goPrev = useCallback(() => {
        if (goals.length < 2) return;
        setActiveIndex(i => (i - 1 + goals.length) % goals.length);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        translateX.value = 0;
        rotate.value = 0;
    }, [goals.length, rotate, translateX]);

    const swipe = Gesture.Pan()
        .onUpdate(e => {
            translateX.value = e.translationX;
            rotate.value = interpolate(
                e.translationX,
                [-width, width],
                [-10, 10],
                Extrapolation.CLAMP
            );
        })
        .onEnd(e => {
            if (e.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withTiming(-width * 1.3, { duration: 250 }, () =>
                    runOnJS(goNext)()
                );
            } else if (e.translationX > SWIPE_THRESHOLD) {
                translateX.value = withTiming(width * 1.3, { duration: 250 }, () =>
                    runOnJS(goPrev)()
                );
            } else {
                translateX.value = withSpring(0, { damping: 20 });
                rotate.value = withSpring(0);
            }
        });

    const frontAnim = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { rotate: `${rotate.value}deg` }],
        zIndex: 10,
    }));

    const backAnim = useAnimatedStyle(() => ({
        transform: [
            {
                scale: interpolate(
                    Math.abs(translateX.value),
                    [0, 200],
                    [0.93, 1],
                    Extrapolation.CLAMP
                ),
            },
        ],
        opacity: interpolate(Math.abs(translateX.value), [0, 150], [0.4, 1], Extrapolation.CLAMP),
        zIndex: 5,
    }));

    if (isInitialLoad) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <View>
                        <Text style={styles.overline}>COLLECTION</Text>
                        <Text style={styles.title}>Gallery</Text>
                    </View>
                </View>
                <View style={styles.skeletonContainer}>
                    {[0, 1, 2].map(i => (
                        <SkeletonCard key={i} />
                    ))}
                </View>
            </View>
        );
    }

    if (goals.length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <View>
                        <Text style={styles.overline}>COLLECTION</Text>
                        <Text style={styles.title}>Gallery</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/add-goal')}
                        style={styles.addBtn}
                    >
                        <MaterialIcons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="photo-library" size={48} color="rgba(255,255,255,0.15)" />
                    <Text style={styles.emptyText}>No goals yet</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/add-goal')}
                        style={styles.emptyBtn}
                    >
                        <Text style={styles.emptyBtnText}>Add your first dream</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Ambient blurred background */}
            {current?.image && (
                <Image
                    source={current.image}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    blurRadius={50}
                />
            )}
            <View
                style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(4,4,10,0.85)' }]}
            />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <View>
                    <Text style={styles.overline}>COLLECTION</Text>
                    <Text style={styles.title}>Gallery</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/search');
                        }}
                        style={styles.iconBtn}
                        accessibilityLabel="Search goals"
                        accessibilityRole="button"
                    >
                        <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.75)" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/notifications')}
                        style={[styles.iconBtn, { position: 'relative' }]}
                        accessibilityLabel="Notifications"
                        accessibilityRole="button"
                    >
                        <MaterialIcons
                            name="notifications-none"
                            size={20}
                            color="rgba(255,255,255,0.75)"
                        />
                        {notifBadgeCount > 0 && (
                            <Animated.View
                                style={[
                                    {
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: '#ef4444',
                                    },
                                    badgeScaleStyle,
                                ]}
                            />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            router.push('/add-goal');
                        }}
                        style={styles.addBtn}
                    >
                        <MaterialIcons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Card Stack */}
            <View style={styles.cardArea}>
                {/* Back card */}
                {goals.length > 1 && nextGoal && (
                    <Animated.View style={[styles.card, backAnim]}>
                        <CardView
                            goal={nextGoal}
                            interactive={false}
                            onPress={() => {}}
                            onComplete={() => {}}
                        />
                    </Animated.View>
                )}

                {/* Front card */}
                {current && (
                    <GestureDetector gesture={swipe}>
                        <Animated.View style={[styles.card, frontAnim]}>
                            <CardView
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
            </View>

            {/* Bottom: dots + counter */}
            <View style={[styles.bottom, { paddingBottom: insets.bottom + 72 }]}>
                {/* Dot indicators */}
                <View style={styles.dots}>
                    {goals.slice(0, 10).map((_, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => {
                                setActiveIndex(i);
                                Haptics.selectionAsync();
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                        >
                            <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
                        </TouchableOpacity>
                    ))}
                    {goals.length > 10 && <Text style={styles.moreText}>+{goals.length - 10}</Text>}
                </View>

                {/* Counter + arrows */}
                <View style={styles.nav}>
                    <TouchableOpacity onPress={goPrev} style={styles.navBtn}>
                        <MaterialIcons
                            name="chevron-left"
                            size={22}
                            color="rgba(255,255,255,0.5)"
                        />
                    </TouchableOpacity>
                    <Text style={styles.counter}>
                        {activeIndex + 1} / {goals.length}
                    </Text>
                    <TouchableOpacity onPress={goNext} style={styles.navBtn}>
                        <MaterialIcons
                            name="chevron-right"
                            size={22}
                            color="rgba(255,255,255,0.5)"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardViewProps {
    goal: import('../../store/useGoalStore').Goal;
    interactive: boolean;
    onPress: () => void;
    onComplete: () => void;
}

function CardView({ goal, interactive, onPress, onComplete }: CardViewProps) {
    const daysLeft = getDaysUntil(goal.timelineDate);
    const isOverdue = daysLeft < 0 && !goal.completed;
    const badgeColor = goal.completed
        ? '#4ade80'
        : isOverdue
          ? '#f87171'
          : daysLeft <= 7
            ? '#fbbf24'
            : '#60a5fa';
    const badgeLabel = goal.completed
        ? '✓ Completed'
        : isOverdue
          ? `${Math.abs(daysLeft)}d overdue`
          : daysLeft === 0
            ? 'Today!'
            : `${daysLeft}d left`;

    return (
        <TouchableOpacity
            activeOpacity={interactive ? 0.94 : 1}
            onPress={interactive ? onPress : undefined}
            style={cardStyles.root}
        >
            {/* Image */}
            <Image
                source={goal.image}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={350}
            />

            {/* Gradient */}
            <LinearGradient
                colors={['transparent', 'transparent', 'rgba(0,0,0,0.92)']}
                locations={[0, 0.45, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Complete button top-right (interactive only) */}
            {interactive && (
                <TouchableOpacity
                    onPress={e => {
                        e.stopPropagation?.();
                        onComplete();
                    }}
                    style={cardStyles.completeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialIcons
                        name={goal.completed ? 'check-circle' : 'radio-button-unchecked'}
                        size={26}
                        color={goal.completed ? '#4ade80' : 'rgba(255,255,255,0.6)'}
                    />
                </TouchableOpacity>
            )}

            {/* Bottom info */}
            <View style={cardStyles.info}>
                {/* Countdown badge */}
                <View
                    style={[
                        cardStyles.badge,
                        { borderColor: `${badgeColor}40`, backgroundColor: `${badgeColor}15` },
                    ]}
                >
                    <Text style={[cardStyles.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
                </View>

                <Text style={cardStyles.goalTitle} numberOfLines={2}>
                    {goal.title}
                </Text>

                <View style={cardStyles.locationRow}>
                    <MaterialIcons name="place" size={12} color="rgba(255,255,255,0.4)" />
                    <Text style={cardStyles.locationText} numberOfLines={1}>
                        {goal.location.city
                            ? `${goal.location.city}${goal.location.country ? `, ${goal.location.country}` : ''}`
                            : 'No location'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#04040a' },
    skeletonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 40,
        gap: 16,
        marginTop: 60,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    overline: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
    title: { color: 'white', fontSize: 24, fontWeight: '800', marginTop: 2 },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: {
        position: 'absolute',
        width: width * 0.84,
        height: height * 0.6,
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: '#111',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 16,
    },
    bottom: { alignItems: 'center', gap: 14, paddingHorizontal: 24 },
    dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
    dotActive: { width: 22, backgroundColor: '#3b82f6' },
    moreText: { color: 'rgba(255,255,255,0.25)', fontSize: 10, marginLeft: 2 },
    nav: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    navBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    counter: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 13,
        fontWeight: '600',
        minWidth: 48,
        textAlign: 'center',
    },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    emptyText: { color: 'rgba(255,255,255,0.35)', fontSize: 16, fontWeight: '600' },
    emptyBtn: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 99,
        marginTop: 8,
    },
    emptyBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
});

const cardStyles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#111' },
    completeBtn: { position: 'absolute', top: 20, right: 20, zIndex: 10 },
    info: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24 },
    badge: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    badgeText: { fontSize: 11, fontWeight: '700' },
    goalTitle: { color: 'white', fontSize: 26, fontWeight: '800', lineHeight: 32, marginBottom: 8 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, flex: 1 },
});
