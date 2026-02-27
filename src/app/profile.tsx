import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../store/useProfileStore';
import { useGoalStore } from '../store/useGoalStore';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { getCategoryIcon } from '../utils/Icons';

export default function Profile() {
    const router = useRouter();
    const { profile, updateProfile } = useProfileStore();
    const { goals, getCompletedGoals, getPendingGoals } = useGoalStore();

    const [editingName, setEditingName] = useState(false);
    const [editingBio, setEditingBio] = useState(false);
    const [nameInput, setNameInput] = useState(profile.name);
    const [bioInput, setBioInput] = useState(profile.bio);

    const completedGoals = getCompletedGoals();
    const pendingGoals = getPendingGoals();

    // Category breakdown
    const categoryCount = goals.reduce<Record<string, number>>((acc, g) => {
        acc[g.category] = (acc[g.category] || 0) + 1;
        return acc;
    }, {});

    const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const pct = goals.length === 0 ? 0 : Math.round((completedGoals.length / goals.length) * 100);

    // Countries visited (from completed goals with valid locations)
    const visitedCountries = [...new Set(
        completedGoals
            .filter(g => g.location.country && g.location.country !== 'Unknown Country')
            .map(g => g.location.country)
    )];

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
        if (nameInput.trim()) {
            updateProfile({ name: nameInput.trim() });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setEditingName(false);
    };

    const saveBio = () => {
        updateProfile({ bio: bioInput.trim() || profile.bio });
        setEditingBio(false);
    };

    return (
        <ScreenWrapper bgClass="bg-black" blobs={false}>
            {/* Hero Banner */}
            <View className="h-56 relative">
                <LinearGradient
                    colors={['#0f172a', '#1e3a5f', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0"
                />
                {/* Decorative circles */}
                <View className="absolute top-4 right-8 w-40 h-40 rounded-full bg-blue-800/20 border border-blue-700/20" />
                <View className="absolute -top-6 right-24 w-24 h-24 rounded-full bg-indigo-700/20" />

                <View className="absolute top-0 left-0 right-0 z-10 pt-10 px-5 flex-row justify-between items-center">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/10"
                        onPress={() => router.back()}
                    >
                        <MaterialIcons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-semibold text-base">Profile</Text>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/10"
                        onPress={() => router.push('/settings')}
                    >
                        <MaterialIcons name="settings" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 bg-[#080808]"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                {/* Avatar + Name */}
                <View className="px-6 -mt-16 items-center">
                    <TouchableOpacity onPress={pickAvatar} className="relative mb-4">
                        <View className="w-28 h-28 rounded-full border-4 border-[#080808] overflow-hidden bg-gray-900">
                            {profile.avatarUri ? (
                                <Image source={{ uri: profile.avatarUri }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="w-full h-full items-center justify-center bg-indigo-950">
                                    <Text className="text-5xl">{profile.name.charAt(0).toUpperCase()}</Text>
                                </View>
                            )}
                        </View>
                        <View className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-blue-600 items-center justify-center border-2 border-[#080808]">
                            <MaterialIcons name="photo-camera" size={14} color="white" />
                        </View>
                    </TouchableOpacity>

                    {/* Name */}
                    {editingName ? (
                        <View className="flex-row items-center gap-2 mb-2">
                            <TextInput
                                value={nameInput}
                                onChangeText={setNameInput}
                                className="text-white text-2xl font-bold text-center border-b border-blue-500 pb-1 min-w-[160px]"
                                autoFocus
                                onBlur={saveName}
                                onSubmitEditing={saveName}
                                returnKeyType="done"
                            />
                        </View>
                    ) : (
                        <TouchableOpacity className="flex-row items-center gap-2 mb-2" onPress={() => setEditingName(true)}>
                            <Text className="text-white text-2xl font-bold">{profile.name}</Text>
                            <MaterialIcons name="edit" size={16} color="#6b7280" />
                        </TouchableOpacity>
                    )}

                    {/* Bio */}
                    {editingBio ? (
                        <TextInput
                            value={bioInput}
                            onChangeText={setBioInput}
                            className="text-gray-400 text-sm text-center border-b border-blue-500/50 pb-1 w-full"
                            autoFocus
                            onBlur={saveBio}
                            onSubmitEditing={saveBio}
                            returnKeyType="done"
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setEditingBio(true)}>
                            <Text className="text-gray-400 text-sm text-center">{profile.bio}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Stats Row */}
                <View className="flex-row mx-6 mt-8 gap-3">
                    {[
                        { label: 'Total Goals', value: goals.length, icon: 'list', color: '#60a5fa' },
                        { label: 'Completed', value: completedGoals.length, icon: 'check-circle', color: '#4ade80' },
                        { label: 'Countries', value: visitedCountries.length, icon: 'public', color: '#f59e0b' },
                    ].map((stat) => (
                        <View key={stat.label} className="flex-1 bg-white/5 border border-white/8 rounded-2xl p-4 items-center">
                            <MaterialIcons name={stat.icon as any} size={22} color={stat.color} />
                            <Text className="text-white font-bold text-2xl mt-2">{stat.value}</Text>
                            <Text className="text-gray-500 text-xs mt-0.5 text-center">{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Progress Bar */}
                <View className="mx-6 mt-6 bg-white/5 border border-white/8 rounded-2xl p-5">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-white font-semibold">Bucket List Progress</Text>
                        <Text className="text-blue-400 font-bold">{pct}%</Text>
                    </View>
                    <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <View
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${pct}%` }}
                        />
                    </View>
                    <Text className="text-gray-500 text-xs mt-2">
                        {completedGoals.length} of {goals.length} goals achieved
                    </Text>
                </View>

                {/* Category Breakdown */}
                {topCategories.length > 0 && (
                    <View className="mx-6 mt-5 bg-white/5 border border-white/8 rounded-2xl p-5">
                        <Text className="text-white font-semibold mb-4">Top Categories</Text>
                        {topCategories.map(([cat, count]) => (
                            <View key={cat} className="flex-row items-center mb-3">
                                <View className="w-8 h-8 rounded-full bg-blue-950 border border-blue-800 items-center justify-center mr-3">
                                    <MaterialIcons name={getCategoryIcon(cat) as any} size={16} color="#60a5fa" />
                                </View>
                                <Text className="text-gray-300 text-sm flex-1">{cat}</Text>
                                <View className="flex-row items-center">
                                    <View
                                        className="h-1.5 rounded-full bg-blue-600 mr-2"
                                        style={{ width: Math.max(20, (count / goals.length) * 100) }}
                                    />
                                    <Text className="text-gray-500 text-xs w-6 text-right">{count}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Countries Visited */}
                {visitedCountries.length > 0 && (
                    <View className="mx-6 mt-5 bg-white/5 border border-white/8 rounded-2xl p-5">
                        <Text className="text-white font-semibold mb-3">Countries Visited 🌍</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {visitedCountries.map(c => (
                                <View key={c} className="bg-green-950/50 border border-green-800/40 px-3 py-1.5 rounded-full">
                                    <Text className="text-green-400 text-xs font-medium">{c}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}
