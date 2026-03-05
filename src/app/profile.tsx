import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../store/useProfileStore';
import { useGoalStore } from '../store/useGoalStore';
import { useTheme } from '../theme';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { getCategoryIcon } from '../utils/Icons';

export default function Profile() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { profile, updateProfile } = useProfileStore();
    const { goals, getCompletedGoals } = useGoalStore();

    const [editingName, setEditingName] = useState(false);
    const [editingBio, setEditingBio] = useState(false);
    const [nameInput, setNameInput] = useState(profile.name);
    const [bioInput, setBioInput] = useState(profile.bio);

    // Keep inputs in sync with external profile changes (e.g. cloud sync)
    useEffect(() => {
        if (!editingName) setNameInput(profile.name);
    }, [profile.name, editingName]);

    useEffect(() => {
        if (!editingBio) setBioInput(profile.bio);
    }, [profile.bio, editingBio]);

    const completedGoals = getCompletedGoals();

    // Category breakdown
    const categoryCount = goals.reduce<Record<string, number>>((acc, g) => {
        acc[g.category] = (acc[g.category] || 0) + 1;
        return acc;
    }, {});

    const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const maxCategoryCount = topCategories.length > 0 ? topCategories[0][1] : 1;

    const pct = goals.length === 0 ? 0 : Math.round((completedGoals.length / goals.length) * 100);

    // Countries visited (from completed goals with valid locations)
    const visitedCountries = [
        ...new Set(
            completedGoals
                .filter(g => g.location.country && g.location.country !== 'Unknown Country')
                .map(g => g.location.country)
        ),
    ];

    const iconColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const editIconColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

    const pickAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) {
            updateProfile({ avatarUri: result.assets[0].uri });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const saveName = () => {
        const trimmed = nameInput.trim();
        if (trimmed) {
            updateProfile({ name: trimmed });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            // Revert to existing name if input was cleared
            setNameInput(profile.name);
        }
        setEditingName(false);
    };

    const saveBio = () => {
        updateProfile({ bio: bioInput.trim() || profile.bio });
        setEditingBio(false);
    };

    return (
        <ScreenWrapper bgClass="dark:bg-black bg-slate-50" edges={[]}>
            {/* Hero Banner */}
            <View className="h-56 relative">
                <LinearGradient
                    colors={['rgba(15,23,42,0.6)', 'rgba(30,58,95,0.4)', 'rgba(15,23,42,0.6)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0"
                />
                {/* Decorative circles */}
                <View className="absolute top-4 right-8 w-40 h-40 rounded-full bg-white/[0.03] border border-white/[0.05]" />
                <View className="absolute -top-6 right-24 w-24 h-24 rounded-full bg-white/[0.04]" />

                <View className="absolute top-0 left-0 right-0 z-10 pt-10 px-5 flex-row justify-between items-center">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/[0.08]"
                        onPress={() => router.back()}
                    >
                        <MaterialIcons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-semibold text-base">Profile</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/[0.08]"
                            onPress={() => router.push('/stats')}
                            accessibilityLabel="View statistics"
                            accessibilityRole="button"
                        >
                            <MaterialIcons name="bar-chart" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/[0.08]"
                            onPress={() => router.push('/settings')}
                            accessibilityLabel="Settings"
                            accessibilityRole="button"
                        >
                            <MaterialIcons name="settings" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                {/* Avatar + Name */}
                <View className="px-6 -mt-16 items-center">
                    <TouchableOpacity
                        onPress={pickAvatar}
                        className="relative mb-4"
                        accessibilityLabel="Change profile photo"
                        accessibilityRole="button"
                    >
                        <View className="w-28 h-28 rounded-full border-4 dark:border-black border-slate-50 overflow-hidden dark:bg-white/10 bg-slate-200">
                            {profile.avatarUri ? (
                                <Image
                                    source={{ uri: profile.avatarUri }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                    accessibilityLabel="Profile photo"
                                />
                            ) : (
                                <View className="w-full h-full items-center justify-center dark:bg-white/10 bg-slate-200">
                                    <Text className="text-5xl dark:text-white text-gray-600">
                                        {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white/20 items-center justify-center border-2 dark:border-black border-slate-50">
                            <MaterialIcons name="photo-camera" size={14} color="white" />
                        </View>
                    </TouchableOpacity>

                    {/* Name */}
                    {editingName ? (
                        <View className="flex-row items-center gap-2 mb-2">
                            <TextInput
                                value={nameInput}
                                onChangeText={setNameInput}
                                className="dark:text-white text-gray-900 text-2xl font-bold text-center border-b border-blue-500 pb-1 min-w-[160px]"
                                autoFocus
                                onBlur={saveName}
                                onSubmitEditing={saveName}
                                returnKeyType="done"
                                maxLength={50}
                            />
                        </View>
                    ) : (
                        <TouchableOpacity
                            className="flex-row items-center gap-2 mb-2"
                            onPress={() => setEditingName(true)}
                            accessibilityLabel="Edit name"
                            accessibilityRole="button"
                        >
                            <Text className="dark:text-white text-gray-900 text-2xl font-bold">
                                {profile.name}
                            </Text>
                            <MaterialIcons name="edit" size={16} color={editIconColor} />
                        </TouchableOpacity>
                    )}

                    {/* Bio */}
                    {editingBio ? (
                        <TextInput
                            value={bioInput}
                            onChangeText={setBioInput}
                            className="dark:text-white/50 text-gray-500 text-sm text-center border-b dark:border-white/20 border-gray-300 pb-1 w-full"
                            autoFocus
                            onBlur={saveBio}
                            onSubmitEditing={saveBio}
                            returnKeyType="done"
                            maxLength={120}
                        />
                    ) : (
                        <TouchableOpacity
                            onPress={() => setEditingBio(true)}
                            accessibilityLabel="Edit bio"
                            accessibilityRole="button"
                        >
                            <Text className="dark:text-white/50 text-gray-500 text-sm text-center">
                                {profile.bio}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Stats Row */}
                <View className="flex-row mx-6 mt-8 gap-3">
                    {[
                        {
                            label: 'Total Goals',
                            value: goals.length,
                            icon: 'list',
                            color: '#60a5fa',
                        },
                        {
                            label: 'Completed',
                            value: completedGoals.length,
                            icon: 'check-circle',
                            color: '#4ade80',
                        },
                        {
                            label: 'Countries',
                            value: visitedCountries.length,
                            icon: 'public',
                            color: '#f59e0b',
                        },
                    ].map(stat => (
                        <View
                            key={stat.label}
                            className="flex-1 dark:bg-white/[0.05] bg-black/[0.04] dark:border-white/[0.08] border-black/[0.08] border rounded-2xl p-4 items-center"
                        >
                            <MaterialIcons name={stat.icon as any} size={22} color={stat.color} />
                            <Text className="dark:text-white text-gray-900 font-bold text-2xl mt-2">
                                {stat.value}
                            </Text>
                            <Text className="dark:text-white/40 text-gray-400 text-xs mt-0.5 text-center">
                                {stat.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Progress Bar */}
                <View className="mx-6 mt-6 dark:bg-white/[0.05] bg-black/[0.04] dark:border-white/[0.08] border-black/[0.08] border rounded-2xl p-5">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="dark:text-white text-gray-900 font-semibold">
                            Bucket List Progress
                        </Text>
                        <Text className="dark:text-white/70 text-gray-700 font-bold">{pct}%</Text>
                    </View>
                    <View className="h-2 dark:bg-white/10 bg-black/10 rounded-full overflow-hidden">
                        <View
                            className="h-full rounded-full dark:bg-white/50 bg-blue-500"
                            style={{ width: `${pct}%` }}
                        />
                    </View>
                    <Text className="dark:text-white/30 text-gray-400 text-xs mt-2">
                        {completedGoals.length} of {goals.length} goals achieved
                    </Text>
                </View>

                {/* Category Breakdown */}
                {topCategories.length > 0 && (
                    <View className="mx-6 mt-5 dark:bg-white/[0.05] bg-black/[0.04] dark:border-white/[0.08] border-black/[0.08] border rounded-2xl p-5">
                        <Text className="dark:text-white text-gray-900 font-semibold mb-4">
                            Top Categories
                        </Text>
                        {topCategories.map(([cat, count]) => (
                            <View key={cat} className="flex-row items-center mb-3">
                                <View className="w-8 h-8 rounded-full dark:bg-white/10 bg-black/[0.05] dark:border-white/[0.08] border-black/[0.08] border items-center justify-center mr-3">
                                    <MaterialIcons
                                        name={getCategoryIcon(cat) as any}
                                        size={16}
                                        color={iconColor}
                                    />
                                </View>
                                <Text className="dark:text-white/70 text-gray-600 text-sm flex-1">
                                    {cat}
                                </Text>
                                <View className="flex-row items-center">
                                    <View
                                        className="h-1.5 rounded-full dark:bg-white/30 bg-blue-400/60 mr-2"
                                        style={{
                                            width: Math.max(
                                                20,
                                                Math.round((count / maxCategoryCount) * 80)
                                            ),
                                        }}
                                    />
                                    <Text className="dark:text-white/40 text-gray-400 text-xs w-6 text-right">
                                        {count}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Countries Visited */}
                {visitedCountries.length > 0 && (
                    <View className="mx-6 mt-5 dark:bg-white/[0.05] bg-black/[0.04] dark:border-white/[0.08] border-black/[0.08] border rounded-2xl p-5">
                        <Text className="dark:text-white text-gray-900 font-semibold mb-3">
                            Countries Visited 🌍
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {visitedCountries.map(c => (
                                <View
                                    key={c}
                                    className="dark:bg-white/[0.06] bg-black/[0.05] dark:border-white/[0.08] border-black/[0.08] border px-3 py-1.5 rounded-full"
                                >
                                    <Text className="dark:text-white/60 text-gray-500 text-xs font-medium">
                                        {c}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}
