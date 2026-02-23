import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useGoalStore, Goal } from '../../store/useGoalStore';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../../store/useProfileStore';
import SwipeableGoalRow from '../../components/SwipeableGoalRow';
import { ProgressRing } from '../../components/ProgressRing';
import { ProfileHeader } from '../../components/ProfileHeader';
import { getCategoryIcon } from '../../utils/Icons';
import { getDaysUntil } from '../../utils/dateUtils';

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

    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>('date');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const completedGoals = getCompletedGoals();
    const allPending = getPendingGoals();

    const sortedPending = useMemo(() => {
        const list = [...allPending];
        if (sortMode === 'date') return list.sort((a, b) => new Date(a.timelineDate).getTime() - new Date(b.timelineDate).getTime());
        if (sortMode === 'category') return list.sort((a, b) => a.category.localeCompare(b.category));
        if (sortMode === 'name') return list.sort((a, b) => a.title.localeCompare(b.title));
        return list;
    }, [allPending, sortMode]);

    const filteredGoals = useMemo(() => {
        if (!searchQuery.trim()) return sortedPending;
        const q = searchQuery.toLowerCase();
        return sortedPending.filter(g =>
            g.title.toLowerCase().includes(q) ||
            g.description.toLowerCase().includes(q) ||
            g.location.city.toLowerCase().includes(q) ||
            g.location.country.toLowerCase().includes(q) ||
            g.category.toLowerCase().includes(q)
        );
    }, [sortedPending, searchQuery]);



    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top', 'bottom']}>
            <StatusBar style="light" />

            {/* Background Blobs */}
            <View className="absolute inset-0 z-0 bg-[#000000] overflow-hidden" pointerEvents="none">
                <View className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-indigo-950 rounded-full opacity-40" />
                <View className="absolute top-1/2 left-[10%] w-[500px] h-[500px] bg-slate-900 rounded-full opacity-30" />
                <View className="absolute -bottom-20 -right-20 w-[350px] h-[350px] bg-indigo-900 rounded-full opacity-30" />
            </View>

            <ScrollView
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
                                className="w-10 h-10 rounded-full bg-black/70 border border-gray-700 items-center justify-center"
                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/inspiration'); }}
                            >
                                <MaterialIcons name="lightbulb-outline" size={22} color="#fbbf24" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-black/70 border border-gray-700 items-center justify-center"
                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSearch(v => !v); setSearchQuery(''); }}
                            >
                                <MaterialIcons name={showSearch ? 'close' : 'search'} size={22} color="#d1d5db" />
                            </TouchableOpacity>
                        </>
                    }
                />

                {/* Search Bar */}
                {showSearch && (
                    <View className="px-6 mt-4">
                        <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                            <MaterialIcons name="search" size={20} color="#6b7280" />
                            <TextInput
                                className="flex-1 text-white text-base ml-3"
                                placeholder="Search goals, places, categories..."
                                placeholderTextColor="#4b5563"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                                returnKeyType="search"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <MaterialIcons name="cancel" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* Title Area */}
                {!showSearch && (
                    <View className="px-6 mt-12 items-center">
                        <Text className="text-sm font-medium text-gray-400 mb-1 tracking-wide">Hey, {profile.name} 👋</Text>
                        <Text className="text-3xl font-bold text-white tracking-tight mb-5">Life Bucket List</Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="bg-blue-600 px-6 py-3 rounded-full flex-row items-center shadow-lg shadow-blue-900/40"
                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add-goal'); }}
                            >
                                <MaterialIcons name="add" size={20} color="white" />
                                <Text className="text-sm font-bold text-white ml-2">Add Adventure</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-amber-600/20 border border-amber-500/30 px-4 py-3 rounded-full flex-row items-center"
                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/inspiration'); }}
                            >
                                <MaterialIcons name="lightbulb-outline" size={18} color="#fbbf24" />
                                <Text className="text-sm font-medium text-amber-400 ml-1.5">Inspire</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Overview Cards + Progress Ring */}
                {!showSearch && (
                    <View className="px-6 mt-10">
                        <Text className="text-sm font-semibold text-gray-300 mb-4">Overview</Text>
                        <View className="flex-row items-center gap-3">
                            {/* Completed */}
                            <View className="flex-1 bg-black/60 rounded-[2rem] p-5 border border-gray-700 overflow-hidden relative">
                                <Text className="text-base font-medium text-white">Completed</Text>
                                <Text className="text-gray-400 text-xs mt-1 mb-4">Great job!</Text>
                                <View className="flex-row items-baseline">
                                    <View className="w-1 h-7 bg-green-500 rounded-full mr-2" />
                                    <Text className="text-3xl font-semibold text-white">{completedGoals.length}</Text>
                                </View>
                                <View className="absolute top-4 right-4 opacity-15">
                                    <MaterialIcons name="check-circle-outline" size={36} color="#4ade80" style={{ transform: [{ rotate: '12deg' }] }} />
                                </View>
                            </View>

                            {/* Progress Ring */}
                            <ProgressRing completed={completedGoals.length} total={goals.length} />

                            {/* Pending */}
                            <View className="flex-1 bg-black/60 rounded-[2rem] p-5 border border-gray-700 overflow-hidden relative">
                                <Text className="text-base font-medium text-white">Pending</Text>
                                <Text className="text-gray-400 text-xs mt-1 mb-4">Keep going</Text>
                                <View className="flex-row items-baseline">
                                    <View className="w-1 h-7 bg-gray-500 rounded-full mr-2" />
                                    <Text className="text-3xl font-semibold text-white">{allPending.length}</Text>
                                </View>
                                <View className="absolute top-4 right-4 opacity-15">
                                    <MaterialIcons name="hourglass-empty" size={36} color="white" style={{ transform: [{ rotate: '-12deg' }] }} />
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Goal List */}
                <View className="px-6 mt-8">
                    {/* Header row with sort */}
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-sm font-semibold text-gray-300">
                            {showSearch && searchQuery
                                ? `Results for "${searchQuery}"`
                                : 'Upcoming Adventures'}
                        </Text>
                        {!showSearch && (
                            <View className="relative">
                                <TouchableOpacity
                                    className="flex-row items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
                                    onPress={() => setShowSortMenu(v => !v)}
                                >
                                    <MaterialIcons name="sort" size={14} color="#9ca3af" />
                                    <Text className="text-gray-400 text-xs ml-1">{SORT_LABELS[sortMode]}</Text>
                                </TouchableOpacity>
                                {showSortMenu && (
                                    <View className="absolute right-0 top-9 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden z-50 w-36 shadow-2xl">
                                        {(Object.keys(SORT_LABELS) as SortMode[]).map(mode => (
                                            <TouchableOpacity
                                                key={mode}
                                                className={`px-4 py-3 flex-row items-center ${sortMode === mode ? 'bg-blue-900/40' : ''}`}
                                                onPress={() => { Haptics.selectionAsync(); setSortMode(mode); setShowSortMenu(false); }}
                                            >
                                                <Text className={`text-sm ${sortMode === mode ? 'text-blue-400 font-semibold' : 'text-gray-300'}`}>
                                                    {SORT_LABELS[mode]}
                                                </Text>
                                                {sortMode === mode && <MaterialIcons name="check" size={14} color="#60a5fa" style={{ marginLeft: 'auto' }} />}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {filteredGoals.length === 0 ? (
                        <View className="items-center py-12">
                            <MaterialIcons name={showSearch ? 'search-off' : 'check-circle'} size={44} color="#374151" />
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
                                    onPress={() => { Haptics.selectionAsync(); router.push({ pathname: '/goal-detail', params: { id: goal.id } }); }}
                                    onComplete={() => toggleComplete(goal.id, 'Completed via Dashboard')}
                                />
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
