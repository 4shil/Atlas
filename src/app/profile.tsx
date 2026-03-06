import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Modal,
    StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    useDerivedValue,
    useAnimatedProps,
} from 'react-native-reanimated';
import { useGoalStore } from '../store/useGoalStore';
import { useProfileStore } from '../store/useProfileStore';
import { useTheme } from '../theme';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { getCategoryIcon } from '../utils/Icons';
import { typography } from '../theme/tokens/typography';

const AnimatedText = Animated.createAnimatedComponent(Text);

export default function Profile() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { getMonthlyCompletionStreak } = useGoalStore();
    const streak = getMonthlyCompletionStreak();
    const { profile, updateProfile } = useProfileStore();
    const { goals, getCompletedGoals } = useGoalStore();

    const [editingName, setEditingName] = useState(false);
    const [editingBio, setEditingBio] = useState(false);
    const [nameInput, setNameInput] = useState(profile.name);
    const [bioInput, setBioInput] = useState(profile.bio);
    // #7 - Banner image picker
    const [bannerUri, setBannerUri] = useState<string | null>(null);

    // Keep inputs in sync with external profile changes
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

    const visitedCountries = [
        ...new Set(
            completedGoals
                .filter(g => g.location.country && g.location.country !== 'Unknown Country')
                .map(g => g.location.country)
        ),
    ];

    const iconColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const editIconColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

    // #8 - Avatar glow pulse
    const glowRadius = useSharedValue(6);
    useEffect(() => {
        glowRadius.value = withRepeat(
            withSequence(withTiming(14, { duration: 1000 }), withTiming(6, { duration: 1000 })),
            -1,
            true
        );
    }, []);
    const glowStyle = useAnimatedStyle(() => ({
        shadowRadius: glowRadius.value,
        shadowColor: '#3b82f6',
        shadowOpacity: 0.8,
        shadowOffset: { width: 0, height: 0 },
    }));

    // #9 - Animated stat counters
    const stat0 = useSharedValue(0);
    const stat1 = useSharedValue(0);
    const stat2 = useSharedValue(0);
    useEffect(() => {
        stat0.value = withTiming(goals.length, { duration: 900 });
        stat1.value = withTiming(completedGoals.length, { duration: 900 });
        stat2.value = withTiming(visitedCountries.length, { duration: 900 });
    }, [goals.length, completedGoals.length, visitedCountries.length]);

    const stat0Derived = useDerivedValue(() => Math.round(stat0.value).toString());
    const stat1Derived = useDerivedValue(() => Math.round(stat1.value).toString());
    const stat2Derived = useDerivedValue(() => Math.round(stat2.value).toString());

    const stat0Props = useAnimatedProps(() => ({ text: stat0Derived.value }) as any);
    const stat1Props = useAnimatedProps(() => ({ text: stat1Derived.value }) as any);
    const stat2Props = useAnimatedProps(() => ({ text: stat2Derived.value }) as any);

    const statAnimatedProps = [stat0Props, stat1Props, stat2Props];

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

    // #7 - Pick banner image
    const pickBanner = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });
        if (!result.canceled) {
            setBannerUri(result.assets[0].uri);
        }
    };

    const saveName = () => {
        const trimmed = nameInput.trim();
        if (trimmed) {
            updateProfile({ name: trimmed });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            setNameInput(profile.name);
        }
        setEditingName(false);
    };

    const saveBio = () => {
        updateProfile({ bio: bioInput.trim() || profile.bio });
        setEditingBio(false);
    };

    const statItems = [
        { label: 'Total Goals', value: goals.length, icon: 'list', color: '#60a5fa' },
        {
            label: 'Completed',
            value: completedGoals.length,
            icon: 'check-circle',
            color: '#4ade80',
        },
        { label: 'Countries', value: visitedCountries.length, icon: 'public', color: '#f59e0b' },
    ];

    return (
        <ScreenWrapper bgClass="dark:bg-black bg-slate-50" edges={[]}>
            {/* #7 - Hero Banner with image picker */}
            <TouchableOpacity activeOpacity={0.9} onPress={pickBanner} style={{ height: 224 }}>
                <LinearGradient
                    colors={['rgba(15,23,42,0.6)', 'rgba(30,58,95,0.4)', 'rgba(15,23,42,0.6)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                {bannerUri && (
                    <Image
                        source={{ uri: bannerUri }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                    />
                )}
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
                        >
                            <MaterialIcons name="bar-chart" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/[0.08]"
                            onPress={() => router.push('/settings')}
                        >
                            <MaterialIcons name="settings" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                {/* Avatar + Name */}
                <View className="px-6 -mt-16 items-center">
                    {/* #8 - Avatar with glow pulse */}
                    <Animated.View style={glowStyle} className="relative mb-4">
                        <TouchableOpacity
                            onPress={pickAvatar}
                            accessibilityLabel="Change profile photo"
                            accessibilityRole="button"
                        >
                            <View className="w-28 h-28 rounded-full border-4 dark:border-black border-slate-50 overflow-hidden dark:bg-white/10 bg-slate-200">
                                {profile.avatarUri ? (
                                    <Image
                                        source={{ uri: profile.avatarUri }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="w-full h-full items-center justify-center dark:bg-white/10 bg-slate-200">
                                        <Text className="text-5xl dark:text-white text-gray-600">
                                            {profile.name
                                                ? profile.name.charAt(0).toUpperCase()
                                                : '?'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white/20 items-center justify-center border-2 dark:border-black border-slate-50">
                                <MaterialIcons name="photo-camera" size={14} color="white" />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Name - tap to edit via modal */}
                    <TouchableOpacity
                        className="flex-row items-center gap-2 mb-2"
                        onPress={() => setEditingName(true)}
                    >
                        <Text
                            style={[
                                typography.headingMedium,
                                { color: isDark ? 'white' : '#111827' },
                            ]}
                        >
                            {profile.name}
                        </Text>
                        <MaterialIcons name="edit" size={16} color={editIconColor} />
                    </TouchableOpacity>

                    {/* Bio - tap to edit via modal */}
                    <TouchableOpacity onPress={() => setEditingBio(true)}>
                        <Text
                            style={[
                                typography.bodySmall,
                                {
                                    color: isDark ? 'rgba(255,255,255,0.5)' : '#6b7280',
                                    textAlign: 'center',
                                },
                            ]}
                        >
                            {profile.bio}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* #9 - Animated Stats Row */}
                <View className="flex-row mx-6 mt-8 gap-3">
                    {statItems.map((stat, idx) => (
                        <View
                            key={stat.label}
                            className="flex-1 dark:bg-white/[0.05] bg-black/[0.04] dark:border-white/[0.08] border-black/[0.08] border rounded-2xl p-4 items-center"
                        >
                            <MaterialIcons name={stat.icon as any} size={22} color={stat.color} />
                            <AnimatedText
                                animatedProps={statAnimatedProps[idx]}
                                className="dark:text-white text-gray-900 font-bold text-2xl mt-2"
                            >
                                {stat.value.toString()}
                            </AnimatedText>
                            <Text
                                style={[
                                    typography.caption,
                                    {
                                        color: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af',
                                        marginTop: 2,
                                        textAlign: 'center',
                                    },
                                ]}
                            >
                                {stat.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* #10 - Progress Bar with Gradient Fill */}
                <View className="mx-6 mt-6 dark:bg-white/[0.05] bg-black/[0.04] dark:border-white/[0.08] border-black/[0.08] border rounded-2xl p-5">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text
                            style={[
                                typography.headingSmall,
                                { color: isDark ? 'white' : '#111827' },
                            ]}
                        >
                            Bucket List Progress
                        </Text>
                        <Text className="dark:text-white/70 text-gray-700 font-bold">{pct}%</Text>
                    </View>
                    <View className="h-2 dark:bg-white/10 bg-black/10 rounded-full overflow-hidden">
                        <LinearGradient
                            colors={['#3b82f6', '#8b5cf6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ height: '100%', width: `${pct}%`, borderRadius: 999 }}
                        />
                    </View>
                    <Text className="dark:text-white/30 text-gray-400 text-xs mt-2">
                        {completedGoals.length} of {goals.length} goals achieved
                    </Text>
                </View>

                {/* #11 - Category Bars Full Width */}
                {topCategories.length > 0 && (
                    <View className="mx-6 mt-5 dark:bg-white/[0.05] bg-black/[0.04] dark:border-white/[0.08] border-black/[0.08] border rounded-2xl p-5">
                        <Text
                            style={[
                                typography.label,
                                { color: isDark ? 'white' : '#111827', marginBottom: 16 },
                            ]}
                        >
                            TOP CATEGORIES
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
                                <Text className="dark:text-white/70 text-gray-600 text-sm w-20">
                                    {cat}
                                </Text>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        height: 6,
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: count / maxCategoryCount,
                                            backgroundColor: '#60a5fa',
                                            borderRadius: 3,
                                        }}
                                    />
                                    <View style={{ flex: 1 - count / maxCategoryCount }} />
                                </View>
                                <Text className="dark:text-white/40 text-gray-400 text-xs w-10 text-right ml-2">
                                    {Math.round((count / maxCategoryCount) * 100)}%
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* #12 - Countries Visited with Gradient Border Chips */}
                {visitedCountries.length > 0 && (
                    <View className="mx-6 mt-5 dark:bg-white/[0.05] bg-black/[0.04] dark:border-white/[0.08] border-black/[0.08] border rounded-2xl p-5">
                        <Text
                            style={[
                                typography.label,
                                { color: isDark ? 'white' : '#111827', marginBottom: 12 },
                            ]}
                        >
                            COUNTRIES VISITED 🌍
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {visitedCountries.map(c => (
                                <LinearGradient
                                    key={c}
                                    colors={['#3b82f6', '#8b5cf6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ borderRadius: 999, padding: 1 }}
                                >
                                    <View
                                        style={{
                                            backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                                            borderRadius: 999,
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                        }}
                                    >
                                        <Text className="dark:text-white/60 text-gray-500 text-xs font-medium">
                                            {c}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* #13 - Edit Name/Bio Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editingName || editingBio}
                onRequestClose={() => {
                    setEditingName(false);
                    setEditingBio(false);
                }}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                    activeOpacity={1}
                    onPress={() => {
                        editingName ? saveName() : saveBio();
                    }}
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
                        padding: 24,
                        paddingBottom: 40,
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
                            marginBottom: 20,
                        }}
                    />
                    <Text
                        style={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: 11,
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            marginBottom: 12,
                        }}
                    >
                        {editingName ? 'Edit Name' : 'Edit Bio'}
                    </Text>
                    <TextInput
                        value={editingName ? nameInput : bioInput}
                        onChangeText={editingName ? setNameInput : setBioInput}
                        style={{
                            color: 'white',
                            fontSize: 18,
                            borderBottomWidth: 1,
                            borderBottomColor: '#3b82f6',
                            paddingBottom: 8,
                            marginBottom: 20,
                        }}
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={() => (editingName ? saveName() : saveBio())}
                        maxLength={editingName ? 50 : 120}
                        multiline={editingBio}
                    />
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#2563eb',
                            borderRadius: 14,
                            padding: 14,
                            alignItems: 'center',
                        }}
                        onPress={() => (editingName ? saveName() : saveBio())}
                    >
                        <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
