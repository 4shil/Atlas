import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    Animated,
    Dimensions,
    Modal,
} from 'react-native';
import AnimatedReanimated, {
    useSharedValue,
    useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useGoalStore, Goal } from '../../store/useGoalStore';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../../store/useProfileStore';
import { ProfileHeader } from '../../components/ProfileHeader';
import { NextDreamHero, HeroEmpty } from '../../components/NextDreamHero';
import { GoalRow } from '../../components/GoalRow';
import { EmptyState } from '../../components/EmptyState';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { StatRing } from '../../components/StatRing';
import { hapticImpact, hapticSelect } from '../../utils/haptics';
import { Confetti } from '../../components/Confetti';
import { isOverdue } from '../../utils/dateUtils';

type SortMode = 'date' | 'category' | 'name' | 'priority';

const SORT_LABELS: Record<SortMode, string> = {
    date: 'By Date',
    category: 'By Category',
    name: 'By Name',
    priority: 'By Priority',
};

export default function DashboardDark() {
    const {
        getCompletedGoals,
        getPendingGoals,
        goals,
        toggleComplete,
        syncFromCloud,
        deleteGoal,
        getMonthlyCompletionStreak,
        getWeeklyActivity,
    } = useGoalStore();
    const { profile } = useProfileStore();
    const router = useRouter();
    const [refreshing, setRefreshing] = React.useState(false);
    const [showOverdueBanner, setShowOverdueBanner] = useState(true);

    const [showConfetti, setShowConfetti] = useState(false);

    const handleToggleComplete = (goalId: string) => {
        const goal = goals.find(g => g.id === goalId);
        const wasCompleted = goal?.completed;
        toggleComplete(goalId, 'Completed via Dashboard');
        if (!wasCompleted) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2500);
        }
    };

    const onRefresh = React.useCallback(async () => {
        hapticImpact();
        setRefreshing(true);
        await syncFromCloud();
        setRefreshing(false);
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [sortMode, setSortMode] = useState<SortMode>('date');
    const [showSortMenu, setShowSortMenu] = useState(false);

    // #5 - Overdue Banner Slide Animation
    const bannerAnim = useRef(new Animated.Value(-50)).current;

    const completedGoals = getCompletedGoals();
    const allPending = getPendingGoals();

    // Sorted once — used for both hero and list (no double sort)
    const pendingByDate = React.useMemo(
        () =>
            [...allPending].sort(
                (a, b) => new Date(a.timelineDate).getTime() - new Date(b.timelineDate).getTime()
            ),
        [allPending]
    );
    const nextGoal = pendingByDate[0] ?? null;
    const overdueGoals = pendingByDate.filter(g => isOverdue(g.timelineDate));

    // #5 - Spring animation for overdue banner
    useEffect(() => {
        if (overdueGoals.length > 0 && showOverdueBanner) {
            bannerAnim.setValue(-50);
            Animated.spring(bannerAnim, { toValue: 0, useNativeDriver: true }).start();
        }
    }, [overdueGoals.length, showOverdueBanner]);

    // #24 - Custom Pull-to-Refresh spin animation
    const spinAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (refreshing) {
            Animated.loop(
                Animated.timing(spinAnim, { toValue: 1, duration: 800, useNativeDriver: true })
            ).start();
        } else {
            spinAnim.stopAnimation();
            spinAnim.setValue(0);
        }
    }, [refreshing]);

    const spinInterpolate = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const sortedPending = useMemo(() => {
        const list = [...allPending];
        if (sortMode === 'date')
            return list.sort(
                (a, b) => new Date(a.timelineDate).getTime() - new Date(b.timelineDate).getTime()
            );
        if (sortMode === 'category')
            return list.sort((a, b) => a.category.localeCompare(b.category));
        if (sortMode === 'name') return list.sort((a, b) => a.title.localeCompare(b.title));
        if (sortMode === 'priority') {
            const order = { high: 0, medium: 1, low: 2 };
            return list.sort(
                (a, b) => order[a.priority ?? 'medium'] - order[b.priority ?? 'medium']
            );
        }
        return list;
    }, [allPending, sortMode]);

    const allTags = useMemo(() => [...new Set(goals.flatMap(g => g.tags ?? []))], [goals]);

    const filteredGoals = useMemo(() => {
        let list = sortedPending;
        if (activeTag) list = list.filter(g => g.tags?.includes(activeTag));
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(
            g =>
                g.title.toLowerCase().includes(q) ||
                g.description.toLowerCase().includes(q) ||
                g.location.city.toLowerCase().includes(q) ||
                g.location.country.toLowerCase().includes(q) ||
                g.category.toLowerCase().includes(q) ||
                (g.tags ?? []).some(t => t.toLowerCase().includes(q))
        );
    }, [sortedPending, searchQuery, activeTag]);

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: event => {
            scrollY.value = event.contentOffset.y;
        },
    });

    return (
        <>
            <ScreenWrapper bgClass="dark:bg-black bg-slate-50">
                {/* Sticky Header */}
                <ProfileHeader
                    scrollY={scrollY}
                    rightActions={
                        <>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 border dark:border-white/[0.08] border-black/[0.08] items-center justify-center"
                                onPress={() => {
                                    hapticImpact();
                                    router.push('/inspiration');
                                }}
                            >
                                <MaterialIcons name="lightbulb-outline" size={22} color="#fbbf24" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 border dark:border-white/[0.08] border-black/[0.08] items-center justify-center"
                                onPress={() => {
                                    hapticImpact();
                                    setShowSearch(v => !v);
                                    setSearchQuery('');
                                }}
                            >
                                <MaterialIcons
                                    name={showSearch ? 'close' : 'search'}
                                    size={22}
                                    color="rgba(255,255,255,0.8)"
                                />
                            </TouchableOpacity>
                        </>
                    }
                />

                <AnimatedReanimated.ScrollView
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="rgba(255,255,255,0.5)"
                        />
                    }
                    className="flex-1 relative z-10"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* #24 - Custom refresh indicator */}
                    {refreshing && (
                        <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
                            <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
                                <MaterialIcons
                                    name="explore"
                                    size={24}
                                    color="rgba(96,165,250,0.8)"
                                />
                            </Animated.View>
                        </View>
                    )}

                    {/* Stats strip */}
                    {!showSearch && (
                        <View
                            style={{
                                flexDirection: 'row',
                                gap: 10,
                                paddingHorizontal: 24,
                                marginTop: 12,
                                marginBottom: 4,
                            }}
                        >
                            <StatRing
                                value={getMonthlyCompletionStreak()}
                                maxValue={10}
                                color="#ef4444"
                                title="Monthly"
                                subtitle="completed"
                            />
                            <StatRing
                                value={getWeeklyActivity()}
                                maxValue={7}
                                color="#eab308"
                                title="Weekly"
                                subtitle="activity"
                            />
                        </View>
                    )}

                    {/* #5 - Overdue nudge banner with slide animation */}
                    {!showSearch && showOverdueBanner && overdueGoals.length > 0 && (
                        <Animated.View
                            style={{
                                transform: [{ translateY: bannerAnim }],
                                marginHorizontal: 24,
                                marginTop: 12,
                                backgroundColor: 'rgba(251,191,36,0.1)',
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: 'rgba(251,191,36,0.25)',
                                padding: 14,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#fbbf24',
                                    fontSize: 13,
                                    fontWeight: '600',
                                    marginBottom: 8,
                                }}
                            >
                                🕐 {overdueGoals.length} overdue dream
                                {overdueGoals.length !== 1 ? 's' : ''} — want to reschedule?
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        hapticSelect();
                                        router.push('/(tabs)/archive');
                                    }}
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'rgba(251,191,36,0.15)',
                                        borderRadius: 10,
                                        padding: 8,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#fbbf24',
                                            fontSize: 12,
                                            fontWeight: '600',
                                        }}
                                    >
                                        Reschedule
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        hapticSelect();
                                        setShowOverdueBanner(false);
                                    }}
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderRadius: 10,
                                        padding: 8,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: 'rgba(255,255,255,0.4)',
                                            fontSize: 12,
                                            fontWeight: '600',
                                        }}
                                    >
                                        Dismiss
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}

                    {/* Animated Travel Gallery Strip — all goals with images */}
                    {!showSearch && goals.length > 0 && (
                        <View className="mt-4 mb-2">
                            <View className="flex-row items-center justify-between px-6 mb-3">
                                <Text className="text-sm font-semibold dark:text-white/40 text-gray-500">
                                    Recent
                                </Text>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/gallery')}>
                                    <Text className="text-xs text-blue-400 font-semibold">
                                        See all
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
                            >
                                {goals
                                    .filter(g => g.image)
                                    .map((goal, i) => (
                                        <TouchableOpacity
                                            key={goal.id}
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                hapticImpact();
                                                router.push({
                                                    pathname: '/goal-detail',
                                                    params: { id: goal.id },
                                                });
                                            }}
                                            style={{
                                                width: 100,
                                                height: i % 2 === 0 ? 120 : 140,
                                                borderRadius: 18,
                                                overflow: 'hidden',
                                                borderWidth: 1,
                                                borderColor: goal.completed
                                                    ? 'rgba(74,222,128,0.3)'
                                                    : 'rgba(255,255,255,0.08)',
                                            }}
                                        >
                                            <Image
                                                source={goal.image}
                                                style={{ width: '100%', height: '100%' }}
                                                contentFit="cover"
                                                transition={300}
                                            />
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: 60,
                                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                                }}
                                            />
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    padding: 8,
                                                }}
                                            >
                                                {goal.completed && (
                                                    <View
                                                        style={{
                                                            backgroundColor: 'rgba(74,222,128,0.9)',
                                                            borderRadius: 99,
                                                            paddingHorizontal: 6,
                                                            paddingVertical: 2,
                                                            alignSelf: 'flex-start',
                                                            marginBottom: 3,
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                color: '#000',
                                                                fontSize: 8,
                                                                fontWeight: '700',
                                                            }}
                                                        >
                                                            ✓ DONE
                                                        </Text>
                                                    </View>
                                                )}
                                                <Text
                                                    style={{
                                                        color: 'white',
                                                        fontSize: 10,
                                                        fontWeight: '600',
                                                    }}
                                                    numberOfLines={2}
                                                >
                                                    {goal.title}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                {/* Add new goal tile */}
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        hapticImpact();
                                        router.push('/add-goal');
                                    }}
                                    style={{
                                        width: 100,
                                        height: 130,
                                        borderRadius: 18,
                                        borderWidth: 1.5,
                                        borderColor: 'rgba(96,165,250,0.3)',
                                        borderStyle: 'dashed',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'rgba(96,165,250,0.04)',
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 18,
                                            backgroundColor: 'rgba(96,165,250,0.15)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <MaterialIcons name="add" size={22} color="#60a5fa" />
                                    </View>
                                    <Text
                                        style={{
                                            color: 'rgba(96,165,250,0.7)',
                                            fontSize: 10,
                                            marginTop: 6,
                                            fontWeight: '600',
                                        }}
                                    >
                                        Add Dream
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    )}

                    {/* Search Bar */}
                    {showSearch && (
                        <View className="px-6 mt-4">
                            <View className="flex-row items-center bg-white/[0.06] border dark:border-white/[0.08] border-black/[0.08] rounded-2xl px-4 py-3">
                                <MaterialIcons
                                    name="search"
                                    size={20}
                                    color="rgba(255,255,255,0.35)"
                                />
                                <TextInput
                                    className="flex-1 dark:text-white text-gray-900 text-base ml-3"
                                    placeholder="Search goals, places, categories..."
                                    placeholderTextColor="rgba(255,255,255,0.25)"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                    returnKeyType="search"
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <MaterialIcons
                                            name="cancel"
                                            size={18}
                                            color="rgba(255,255,255,0.3)"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Next Dream Hero */}
                    {!showSearch &&
                        (nextGoal ? (
                            <NextDreamHero
                                goal={nextGoal}
                                totalGoals={goals.length}
                                completedCount={completedGoals.length}
                                scrollY={scrollY}
                                onPress={() =>
                                    router.push({
                                        pathname: '/goal-detail',
                                        params: { id: nextGoal.id },
                                    })
                                }
                                onAddGoal={() => router.push('/add-goal')}
                            />
                        ) : (
                            <HeroEmpty
                                onAddGoal={() => router.push('/add-goal')}
                                hasCompleted={completedGoals.length > 0}
                            />
                        ))}

                    {/* Goal List */}
                    <View className="px-6 mt-8">
                        {/* Header row with sort */}
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-sm font-semibold dark:text-white/50 text-gray-500">
                                {showSearch && searchQuery
                                    ? `${filteredGoals.length} result${filteredGoals.length !== 1 ? 's' : ''} for "${searchQuery}"`
                                    : overdueGoals.length > 0
                                      ? `${overdueGoals.length} overdue · ${allPending.length - overdueGoals.length} upcoming`
                                      : `${allPending.length} dream${allPending.length !== 1 ? 's' : ''} ahead`}
                            </Text>
                            {!showSearch && (
                                <TouchableOpacity
                                    className="flex-row items-center bg-white/[0.06] border dark:border-white/[0.08] border-black/[0.08] px-3 py-1.5 rounded-full"
                                    onPress={() => setShowSortMenu(true)}
                                >
                                    <MaterialIcons
                                        name="sort"
                                        size={14}
                                        color="rgba(255,255,255,0.4)"
                                    />
                                    <Text className="dark:text-white/40 text-gray-400 text-xs ml-1">
                                        {SORT_LABELS[sortMode]}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {filteredGoals.length === 0 ? (
                            <View className="items-center py-12">
                                <MaterialIcons
                                    name={showSearch ? 'search-off' : 'check-circle'}
                                    size={44}
                                    color="#374151"
                                />
                                <Text className="text-gray-500 text-sm mt-3 text-center">
                                    {showSearch && searchQuery
                                        ? `No goals matching "${searchQuery}"`
                                        : 'Nothing here yet'}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredGoals}
                                keyExtractor={(goal: Goal) => goal.id}
                                initialNumToRender={10}
                                onEndReachedThreshold={0.5}
                                scrollEnabled={false}
                                renderItem={({ item: goal }: { item: Goal }) => (
                                    <GoalRow
                                        goal={goal}
                                        onPress={() =>
                                            router.push({
                                                pathname: '/goal-detail',
                                                params: { id: goal.id },
                                            })
                                        }
                                        onComplete={() => handleToggleComplete(goal.id)}
                                        onDelete={() => deleteGoal(goal.id)}
                                    />
                                )}
                            />
                        )}
                    </View>
                </AnimatedReanimated.ScrollView>

                {/* #6 - Sort Menu Bottom Sheet Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showSortMenu}
                    onRequestClose={() => setShowSortMenu(false)}
                >
                    <TouchableOpacity
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                        activeOpacity={1}
                        onPress={() => setShowSortMenu(false)}
                    />
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: '#1a1a2e',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            paddingTop: 12,
                            paddingBottom: 34,
                            borderTopWidth: 1,
                            borderColor: 'rgba(255,255,255,0.1)',
                        }}
                    >
                        <View
                            style={{
                                width: 36,
                                height: 4,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: 2,
                                alignSelf: 'center',
                                marginBottom: 16,
                            }}
                        />
                        <Text
                            style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: 11,
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                paddingHorizontal: 20,
                                marginBottom: 8,
                            }}
                        >
                            Sort By
                        </Text>
                        {(Object.keys(SORT_LABELS) as SortMode[]).map(mode => (
                            <TouchableOpacity
                                key={mode}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 20,
                                    paddingVertical: 14,
                                    backgroundColor:
                                        sortMode === mode
                                            ? 'rgba(255,255,255,0.07)'
                                            : 'transparent',
                                }}
                                onPress={() => {
                                    hapticSelect();
                                    setSortMode(mode);
                                    setShowSortMenu(false);
                                }}
                            >
                                <Text
                                    style={{
                                        flex: 1,
                                        color:
                                            sortMode === mode ? 'white' : 'rgba(255,255,255,0.6)',
                                        fontSize: 16,
                                        fontWeight: sortMode === mode ? '600' : '400',
                                    }}
                                >
                                    {SORT_LABELS[mode]}
                                </Text>
                                {sortMode === mode && (
                                    <MaterialIcons name="check" size={18} color="#60a5fa" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Modal>
            </ScreenWrapper>
            <Confetti visible={showConfetti} onDone={() => setShowConfetti(false)} />
        </>
    );
}
