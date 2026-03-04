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
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGoalStore, Goal } from '../../store/useGoalStore';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../../store/useProfileStore';
import { ProfileHeader } from '../../components/ProfileHeader';
import { NextDreamHero, HeroEmpty } from '../../components/NextDreamHero';
import { GoalRow } from '../../components/GoalRow';
import { EmptyState } from '../../components/EmptyState';
import { ScreenWrapper } from '../../components/ScreenWrapper';

type SortMode = 'date' | 'category' | 'name';

const SORT_LABELS: Record<SortMode, string> = {
    date: 'By Date',
    category: 'By Category',
    name: 'By Name',
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

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await syncFromCloud();
        setRefreshing(false);
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>('date');
    const [showSortMenu, setShowSortMenu] = useState(false);

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
    const overdueGoals = pendingByDate.filter(g => {
        const d = new Date(g.timelineDate);
        d.setHours(23, 59, 59);
        return d < new Date();
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
        return list;
    }, [allPending, sortMode]);

    const filteredGoals = useMemo(() => {
        if (!searchQuery.trim()) return sortedPending;
        const q = searchQuery.toLowerCase();
        return sortedPending.filter(
            g =>
                g.title.toLowerCase().includes(q) ||
                g.description.toLowerCase().includes(q) ||
                g.location.city.toLowerCase().includes(q) ||
                g.location.country.toLowerCase().includes(q) ||
                g.category.toLowerCase().includes(q)
        );
    }, [sortedPending, searchQuery]);

    return (
        <ScreenWrapper bgClass="dark:bg-black bg-slate-50">
            <ScrollView
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
                {/* Header */}
                <ProfileHeader
                    rightActions={
                        <>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 border dark:border-white/[0.08] border-black/[0.08] items-center justify-center"
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    router.push('/inspiration');
                                }}
                            >
                                <MaterialIcons name="lightbulb-outline" size={22} color="#fbbf24" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 border dark:border-white/[0.08] border-black/[0.08] items-center justify-center"
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderRadius: 14,
                                padding: 12,
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.08)',
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                                🔥 {getMonthlyCompletionStreak()}
                            </Text>
                            <Text
                                style={{
                                    color: 'rgba(255,255,255,0.4)',
                                    fontSize: 11,
                                    marginTop: 2,
                                }}
                            >
                                completed this month
                            </Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderRadius: 14,
                                padding: 12,
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.08)',
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                                ⚡ {getWeeklyActivity()}
                            </Text>
                            <Text
                                style={{
                                    color: 'rgba(255,255,255,0.4)',
                                    fontSize: 11,
                                    marginTop: 2,
                                }}
                            >
                                this week
                            </Text>
                        </View>
                    </View>
                )}

                {/* Overdue nudge banner */}
                {!showSearch && showOverdueBanner && overdueGoals.length > 0 && (
                    <View
                        style={{
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
                                    Haptics.selectionAsync();
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
                                <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '600' }}>
                                    Reschedule
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.selectionAsync();
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
                    </View>
                )}

                {/* Animated Travel Gallery Strip — all goals with images */}
                {!showSearch && goals.length > 0 && (
                    <View className="mt-4 mb-2">
                        <View className="flex-row items-center justify-between px-6 mb-3">
                            <Text className="text-xs font-semibold dark:text-white/40 text-gray-500 uppercase tracking-widest">
                                Your Adventures
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/gallery')}>
                                <Text className="text-xs text-blue-400 font-semibold">See all</Text>
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
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            router.push({
                                                pathname: '/goal-detail',
                                                params: { id: goal.id },
                                            });
                                        }}
                                        style={{
                                            width: 100,
                                            height: 130,
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
                                        {/* Gradient overlay — using backgroundColor as React Native doesn't support CSS gradient */}
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
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
                            <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.35)" />
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
                            <View className="relative">
                                <TouchableOpacity
                                    className="flex-row items-center bg-white/[0.06] border dark:border-white/[0.08] border-black/[0.08] px-3 py-1.5 rounded-full"
                                    onPress={() => setShowSortMenu(v => !v)}
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
                                {showSortMenu && (
                                    <View className="absolute right-0 top-9 bg-black/80 border dark:border-white/10 border-black/10 rounded-2xl overflow-hidden z-50 w-36 shadow-2xl">
                                        {(Object.keys(SORT_LABELS) as SortMode[]).map(mode => (
                                            <TouchableOpacity
                                                key={mode}
                                                className={`px-4 py-3 flex-row items-center ${sortMode === mode ? 'dark:bg-white/10 bg-black/10' : ''}`}
                                                onPress={() => {
                                                    Haptics.selectionAsync();
                                                    setSortMode(mode);
                                                    setShowSortMenu(false);
                                                }}
                                            >
                                                <Text
                                                    className={`text-sm ${sortMode === mode ? 'text-white font-semibold' : 'dark:text-white/60 text-gray-600'}`}
                                                >
                                                    {SORT_LABELS[mode]}
                                                </Text>
                                                {sortMode === mode && (
                                                    <MaterialIcons
                                                        name="check"
                                                        size={14}
                                                        color="white"
                                                        style={{ marginLeft: 'auto' }}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
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
                                    : 'All adventures completed! 🎉\nAdd a new one.'}
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
                                    onComplete={() =>
                                        toggleComplete(goal.id, 'Completed via Dashboard')
                                    }
                                    onDelete={() => deleteGoal(goal.id)}
                                />
                            )}
                        />
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
