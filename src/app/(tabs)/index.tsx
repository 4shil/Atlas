import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGoalStore, Goal } from '../../store/useGoalStore';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../../store/useProfileStore';
import SwipeableGoalRow from '../../components/SwipeableGoalRow';
import { ProgressRing } from '../../components/ProgressRing';
import { ProfileHeader } from '../../components/ProfileHeader';
import { DashboardOverview } from '../../components/DashboardOverview';
import { getCategoryIcon } from '../../utils/Icons';
import { getDaysUntil } from '../../utils/dateUtils';
import { ScreenWrapper } from '../../components/ScreenWrapper';

type SortMode = 'date' | 'category' | 'name';

const SORT_LABELS: Record<SortMode, string> = {
    date: 'By Date',
    category: 'By Category',
    name: 'By Name',
};

export default function DashboardDark() {
    const { getCompletedGoals, getPendingGoals, goals, toggleComplete } = useGoalStore();
    const { profile } = useProfileStore();
    const router = useRouter();
    const [refreshing, setRefreshing] = React.useState(false);

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
        <ScreenWrapper bgClass="bg-black">
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
                                className="w-10 h-10 rounded-full bg-white/10 border border-white/[0.08] items-center justify-center"
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    router.push('/inspiration');
                                }}
                            >
                                <MaterialIcons name="lightbulb-outline" size={22} color="#fbbf24" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-white/10 border border-white/[0.08] items-center justify-center"
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

                {/* Search Bar */}
                {showSearch && (
                    <View className="px-6 mt-4">
                        <View className="flex-row items-center bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3">
                            <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.35)" />
                            <TextInput
                                className="flex-1 text-white text-base ml-3"
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

                {/* Title Area */}
                {!showSearch && (
                    <View className="px-6 mt-12 items-center">
                        <Text className="text-sm font-medium text-white/50 mb-1 tracking-wide">
                            Hey, {profile.name} 👋
                        </Text>
                        <Text className="text-3xl font-bold text-white tracking-tight mb-5">
                            Life Bucket List
                        </Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="bg-white/15 px-6 py-3 rounded-full flex-row items-center border border-white/10"
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    router.push('/add-goal');
                                }}
                            >
                                <MaterialIcons name="add" size={20} color="white" />
                                <Text className="text-sm font-bold text-white ml-2">
                                    Add Adventure
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-white/[0.06] border border-white/[0.08] px-4 py-3 rounded-full flex-row items-center"
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    router.push('/inspiration');
                                }}
                            >
                                <MaterialIcons name="lightbulb-outline" size={18} color="#fbbf24" />
                                <Text className="text-sm font-medium text-amber-300 ml-1.5">
                                    Inspire
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Overview Cards + Progress Ring */}
                {!showSearch && (
                    <DashboardOverview
                        completedGoals={completedGoals}
                        allPending={allPending}
                        totalGoals={goals.length}
                    />
                )}

                {/* Goal List */}
                <View className="px-6 mt-8">
                    {/* Header row with sort */}
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-sm font-semibold text-white/50">
                            {showSearch && searchQuery
                                ? `Results for "${searchQuery}"`
                                : 'Upcoming Adventures'}
                        </Text>
                        {!showSearch && (
                            <View className="relative">
                                <TouchableOpacity
                                    className="flex-row items-center bg-white/[0.06] border border-white/[0.08] px-3 py-1.5 rounded-full"
                                    onPress={() => setShowSortMenu(v => !v)}
                                >
                                    <MaterialIcons
                                        name="sort"
                                        size={14}
                                        color="rgba(255,255,255,0.4)"
                                    />
                                    <Text className="text-white/40 text-xs ml-1">
                                        {SORT_LABELS[sortMode]}
                                    </Text>
                                </TouchableOpacity>
                                {showSortMenu && (
                                    <View className="absolute right-0 top-9 bg-black/80 border border-white/10 rounded-2xl overflow-hidden z-50 w-36 shadow-2xl">
                                        {(Object.keys(SORT_LABELS) as SortMode[]).map(mode => (
                                            <TouchableOpacity
                                                key={mode}
                                                className={`px-4 py-3 flex-row items-center ${sortMode === mode ? 'bg-white/10' : ''}`}
                                                onPress={() => {
                                                    Haptics.selectionAsync();
                                                    setSortMode(mode);
                                                    setShowSortMenu(false);
                                                }}
                                            >
                                                <Text
                                                    className={`text-sm ${sortMode === mode ? 'text-white font-semibold' : 'text-white/60'}`}
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
                        filteredGoals.map((goal: Goal) => {
                            const days = getDaysUntil(goal.timelineDate);
                            const isUrgent = days <= 30 && days > 0;
                            const isOverdue = days < 0;
                            const catIcon = getCategoryIcon(goal.category);
                            return (
                                <SwipeableGoalRow
                                    key={goal.id}
                                    goal={goal}
                                    categoryIcon={catIcon}
                                    isOverdue={isOverdue}
                                    isUrgent={isUrgent}
                                    days={days}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        router.push({
                                            pathname: '/goal-detail',
                                            params: { id: goal.id },
                                        });
                                    }}
                                    onComplete={() =>
                                        toggleComplete(goal.id, 'Completed via Dashboard')
                                    }
                                />
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
