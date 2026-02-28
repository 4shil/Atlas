import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useGoalStore, Goal } from '../../store/useGoalStore';
import { useRouter } from 'expo-router';
import { CATEGORIES } from '../../utils/constants';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { EmptyState } from '../../components/EmptyState';
import { SectionHeader } from '../../components/SectionHeader';

export default function DarkInspirationArchive() {
    const { getCompletedGoals } = useGoalStore();
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState('All');

    const allCompleted = getCompletedGoals();
    const completedGoals =
        activeCategory === 'All'
            ? allCompleted
            : allCompleted.filter(g => g.category === activeCategory);

    return (
        <ScreenWrapper bgClass="bg-black dark:bg-black bg-slate-50">
            <ScrollView
                className="flex-1 z-10 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Header */}
                <View className="px-6 flex-row justify-between items-center mb-6">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 border dark:border-white/[0.08] border-black/[0.08] items-center justify-center"
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/profile');
                        }}
                    >
                        <MaterialIcons name="menu" size={20} color="white" />
                    </TouchableOpacity>
                    <View className="dark:bg-white/10 bg-black/10 border dark:border-white/[0.08] border-black/[0.08] px-4 py-1.5 rounded-full flex-row items-center">
                        <MaterialIcons name="inventory-2" size={14} color="rgba(255,255,255,0.7)" />
                        <Text className="text-xs font-medium text-white/80 ml-1.5">Archive</Text>
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 border dark:border-white/[0.08] border-black/[0.08] items-center justify-center"
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/settings');
                        }}
                    >
                        <MaterialIcons name="settings" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <SectionHeader
                    overline="Memories"
                    title={'Relive The\nMoments'}
                    description={
                        <Text className="text-gray-500 text-sm text-center">
                            {allCompleted.length} {allCompleted.length === 1 ? 'goal' : 'goals'}{' '}
                            completed
                        </Text>
                    }
                />

                {/* Category Filter Chips */}
                <View className="mb-6">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24 }}
                    >
                        {CATEGORIES.map(cat => {
                            const active = activeCategory === cat;
                            return (
                                <TouchableOpacity
                                    key={cat}
                                    className={`px-5 py-2.5 rounded-full flex-row items-center mr-3 border ${active ? 'bg-white/20 border-white/20' : 'bg-white/[0.06] dark:border-white/[0.08] border-black/[0.08]'}`}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setActiveCategory(cat);
                                    }}
                                >
                                    {cat === 'Travel' && (
                                        <MaterialIcons
                                            name="flight"
                                            size={14}
                                            color={active ? 'white' : '#9ca3af'}
                                        />
                                    )}
                                    {cat === 'Adventures' && (
                                        <MaterialIcons
                                            name="hiking"
                                            size={14}
                                            color={active ? 'white' : '#9ca3af'}
                                        />
                                    )}
                                    {cat === 'Foodie' && (
                                        <MaterialIcons
                                            name="restaurant"
                                            size={14}
                                            color={active ? 'white' : '#9ca3af'}
                                        />
                                    )}
                                    {cat === 'Stays' && (
                                        <MaterialIcons
                                            name="hotel"
                                            size={14}
                                            color={active ? 'white' : '#9ca3af'}
                                        />
                                    )}
                                    {cat === 'Milestone' && (
                                        <MaterialIcons
                                            name="star"
                                            size={14}
                                            color={active ? 'white' : '#9ca3af'}
                                        />
                                    )}
                                    <Text
                                        className={`text-xs font-medium ml-1.5 ${active ? 'text-white' : 'text-white/50'}`}
                                    >
                                        {cat}
                                    </Text>
                                    {active && cat !== 'All' && (
                                        <Text className="dark:text-white/60 text-gray-600 text-xs ml-1">
                                            ({allCompleted.filter(g => g.category === cat).length})
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Completed Goals Grid */}
                <View className="px-6 pb-4">
                    <View className="flex-row items-center justify-between mb-5">
                        <Text className="text-lg font-semibold text-white">
                            {activeCategory === 'All' ? 'All Memories' : activeCategory}
                        </Text>
                        <Text className="text-xs text-gray-500">
                            {completedGoals.length} {completedGoals.length === 1 ? 'item' : 'items'}
                        </Text>
                    </View>

                    {completedGoals.length === 0 ? (
                        <EmptyState
                            icon="emoji-events"
                            title="No completed goals"
                            subtitle={
                                activeCategory === 'All'
                                    ? 'Complete your first goal to see it here'
                                    : `No completed ${activeCategory} goals yet`
                            }
                        />
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={200}
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingRight: 24 }}
                        >
                            {completedGoals.map((goal: Goal, index: number) => {
                                const gradients = [
                                    ['rgba(127,29,29,0.5)', 'rgba(0,0,0,0.85)'],
                                    ['rgba(19,78,74,0.5)', 'rgba(0,0,0,0.85)'],
                                    ['rgba(30,58,138,0.5)', 'rgba(0,0,0,0.85)'],
                                    ['rgba(88,28,135,0.5)', 'rgba(0,0,0,0.85)'],
                                ];
                                const gradient = gradients[index % gradients.length];
                                const iconCol = ['#f87171', '#2dd4bf', '#60a5fa', '#a78bfa'][
                                    index % 4
                                ];
                                const catIcon =
                                    goal.category === 'Foodie'
                                        ? 'restaurant'
                                        : goal.category === 'Stays'
                                          ? 'hotel'
                                          : goal.category === 'Travel'
                                            ? 'flight'
                                            : goal.category === 'Milestone'
                                              ? 'star'
                                              : 'hiking';

                                const completionPhoto = goal.notes?.startsWith('completionPhoto:')
                                    ? goal.notes.replace('completionPhoto:', '')
                                    : null;
                                const displayImage = completionPhoto || goal.image;

                                return (
                                    <TouchableOpacity
                                        key={goal.id}
                                        activeOpacity={0.85}
                                        className="w-48 h-64 rounded-[28px] p-5 relative overflow-hidden mr-4 border dark:border-white/10 border-black/10"
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            router.push({
                                                pathname: '/goal-detail',
                                                params: { id: goal.id },
                                            });
                                        }}
                                    >
                                        <Image
                                            source={displayImage}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                opacity: completionPhoto ? 0.65 : 0.4,
                                            }}
                                            contentFit="cover"
                                        />
                                        {completionPhoto && (
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 12,
                                                    backgroundColor: 'rgba(74,222,128,0.9)',
                                                    borderRadius: 8,
                                                    padding: 4,
                                                    zIndex: 30,
                                                }}
                                            >
                                                <MaterialIcons
                                                    name="photo-camera"
                                                    size={12}
                                                    color="#000"
                                                />
                                            </View>
                                        )}
                                        <LinearGradient
                                            colors={gradient as [string, string]}
                                            start={{ x: 1, y: 0 }}
                                            end={{ x: 0, y: 1 }}
                                            className="absolute inset-0 z-0"
                                        />

                                        <View className="relative z-20 h-full flex-col justify-between">
                                            <View className="w-11 h-11 rounded-full bg-black/40 border dark:border-white/10 border-black/10 items-center justify-center">
                                                <MaterialIcons
                                                    name={catIcon as any}
                                                    size={22}
                                                    color={iconCol}
                                                />
                                            </View>
                                            <View>
                                                <Text
                                                    className="text-2xl font-bold text-white leading-tight mb-1"
                                                    numberOfLines={2}
                                                >
                                                    {goal.title}
                                                </Text>
                                                <View className="flex-row items-center mt-1">
                                                    <MaterialIcons
                                                        name="place"
                                                        size={12}
                                                        color="#9ca3af"
                                                    />
                                                    <Text
                                                        className="text-gray-400 text-xs ml-1"
                                                        numberOfLines={1}
                                                    >
                                                        {goal.location.city ||
                                                            goal.location.country ||
                                                            'No location'}
                                                    </Text>
                                                </View>
                                                {goal.completedAt && (
                                                    <Text className="text-gray-500 text-[10px] mt-1">
                                                        ✓{' '}
                                                        {new Date(
                                                            goal.completedAt
                                                        ).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
