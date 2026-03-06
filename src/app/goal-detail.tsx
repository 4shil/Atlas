import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Share,
    StyleSheet,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { useGoalStore, Milestone } from '../store/useGoalStore';
import Animated, {
    useSharedValue,
    withSequence,
    withSpring,
    withDelay,
    withTiming,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import { getCategoryIcon } from '../utils/Icons';
import { getDaysUntil } from '../utils/dateUtils';
import { getDetailUrl } from '../utils/imageUtils';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Confetti } from '../components/Confetti';
import { ShareCard } from '../components/ShareCard';

export default function GoalDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { goals, toggleComplete, deleteGoal, updateGoal, addMilestone, toggleMilestone } =
        useGoalStore();
    const goal = goals.find(g => g.id === id);

    const [showCelebration, setShowCelebration] = useState(false);
    const [milestoneInput, setMilestoneInput] = useState('');
    const [completionPhoto, setCompletionPhoto] = useState<string | null>(
        goal?.completionPhoto ?? null
    );
    const [progressPhotos, setProgressPhotos] = useState<string[]>(goal?.progressPhotos ?? []);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const shareCardRef = useRef<ViewShot>(null);
    const celebScale = useSharedValue(0);
    const celebOpacity = useSharedValue(0);

    // #19 - Hero mount animation
    const heroOpacity = useSharedValue(0);
    const heroScale = useSharedValue(1.06);
    useEffect(() => {
        heroOpacity.value = withTiming(1, { duration: 400 });
        heroScale.value = withTiming(1, { duration: 400 });
    }, []);
    const heroAnimStyle = useAnimatedStyle(() => ({
        opacity: heroOpacity.value,
        transform: [{ scale: heroScale.value }],
    }));

    const handleAddProgressPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled) {
            const newUri = result.assets[0].uri;
            const updated = [...progressPhotos, newUri];
            setProgressPhotos(updated);
            updateGoal(goal!.id, { progressPhotos: updated });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const handleShare = async () => {
        if (!goal) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowShareModal(true);
    };

    const handleShareCard = async () => {
        if (!goal) return;
        try {
            const uri = await shareCardRef.current?.capture?.();
            if (uri) {
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                    await Sharing.shareAsync(uri, {
                        mimeType: 'image/png',
                        dialogTitle: goal.title,
                    });
                } else {
                    await Share.share({
                        message: `Check out my goal: ${goal.title} 🎯\natlas://goal/${goal.id}`,
                    });
                }
            }
        } catch {
            await Share.share({
                message: `Check out my goal: ${goal.title} 🎯\natlas://goal/${goal.id}`,
            });
        }
        setShowShareModal(false);
    };

    const handleCopyLink = () => {
        if (!goal) return;
        // On RN we use Share as clipboard is not standard cross-platform
        Share.share({ message: `atlas://goal/${goal.id}` });
        setShowShareModal(false);
    };

    if (!goal) {
        return (
            <ScreenWrapper bgClass="dark:bg-black bg-slate-50">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-400">Goal not found.</Text>
                    <TouchableOpacity onPress={() => router.back()} className="mt-4">
                        <Text className="text-blue-400">← Go back</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    const targetDate = new Date(goal.timelineDate);
    const daysLeft = getDaysUntil(goal.timelineDate);
    const isOverdue = daysLeft < 0 && !goal.completed;

    const handleDelete = () => {
        Alert.alert(
            'Delete Goal',
            `Are you sure you want to delete "${goal.title}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        deleteGoal(goal.id);
                        router.back();
                    },
                },
            ]
        );
    };

    const handleToggleComplete = () => {
        const wasCompleted = goal.completed;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (!wasCompleted) {
            // Prompt to add a memory photo when completing
            Alert.alert('🎉 Mark as Complete!', 'Add a photo memory of this achievement?', [
                {
                    text: 'Add Photo',
                    onPress: async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 0.7,
                        });
                        const photo = result.canceled ? null : result.assets[0].uri;
                        if (photo) {
                            setCompletionPhoto(photo);
                            toggleComplete(goal.id);
                            updateGoal(goal.id, { completionPhoto: photo });
                        } else {
                            toggleComplete(goal.id);
                        }
                        triggerCelebration();
                    },
                },
                {
                    text: 'Skip',
                    onPress: () => {
                        toggleComplete(goal.id);
                        triggerCelebration();
                    },
                },
            ]);
        } else {
            toggleComplete(goal.id);
        }
    };

    const triggerCelebration = () => {
        setShowCelebration(true);
        celebScale.value = withSequence(
            withSpring(1.2, { damping: 8 }),
            withDelay(400, withTiming(0, { duration: 300 }))
        );
        celebOpacity.value = withSequence(
            withTiming(1, { duration: 200 }),
            withDelay(1200, withTiming(0, { duration: 300 }))
        );
        setTimeout(() => setShowCelebration(false), 1800);
    };

    return (
        <ScreenWrapper bgClass="dark:bg-black bg-slate-50" edges={[]}>
            {/* Hero Image */}
            <Animated.View className="h-[45%] relative" style={heroAnimStyle}>
                <Image
                    source={{ uri: getDetailUrl(goal.image) }}
                    className="absolute inset-0 w-full h-full"
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.9)']}
                    className="absolute inset-0"
                />

                {/* Top Bar */}
                <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-10">
                    <View className="flex-row justify-between items-center px-5 pt-2">
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 items-center justify-center border dark:border-white/[0.08] border-black/[0.08]"
                            onPress={() => router.back()}
                        >
                            <MaterialIcons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 items-center justify-center border dark:border-white/[0.08] border-black/[0.08]"
                                onPress={handleShare}
                            >
                                <MaterialIcons name="share" size={20} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 items-center justify-center border dark:border-white/[0.08] border-black/[0.08]"
                                onPress={() =>
                                    router.push({
                                        pathname: '/add-goal',
                                        params: { editId: goal.id },
                                    })
                                }
                            >
                                <MaterialIcons name="edit" size={20} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-red-500/15 items-center justify-center border border-red-500/20"
                                onPress={handleDelete}
                            >
                                <MaterialIcons name="delete-outline" size={20} color="#f87171" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>

                {/* Hero bottom info */}
                <View className="absolute bottom-0 left-0 right-0 px-6 pb-6">
                    <View className="flex-row items-center mb-2">
                        <View className="dark:bg-white/10 bg-black/10 border border-white/20 px-3 py-1 rounded-full flex-row items-center mr-2">
                            <MaterialIcons
                                name={getCategoryIcon(goal.category) as any}
                                size={12}
                                color="white"
                            />
                            <Text className="dark:text-white text-gray-900 text-xs ml-1 font-medium">
                                {goal.category}
                            </Text>
                        </View>
                        {goal.completed && (
                            <View className="bg-green-900/60 border border-green-500/30 px-3 py-1 rounded-full flex-row items-center">
                                <MaterialIcons name="check-circle" size={12} color="#4ade80" />
                                <Text className="text-green-400 text-xs ml-1 font-medium">
                                    Completed
                                </Text>
                            </View>
                        )}
                        {isOverdue && (
                            <View className="bg-red-900/60 border border-red-500/30 px-3 py-1 rounded-full">
                                <Text className="text-red-400 text-xs font-medium">Overdue</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-3xl font-bold text-white leading-tight">
                        {goal.title}
                    </Text>
                </View>
            </Animated.View>

            {/* Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Location & Date Row */}
                <View className="flex-row px-6 pt-6 pb-4 border-b border-white/[0.06]">
                    <View className="flex-1">
                        <Text className="dark:text-white/40 text-gray-400 text-xs uppercase tracking-widest mb-1">
                            Location
                        </Text>
                        <View className="flex-row items-center">
                            <MaterialIcons name="place" size={16} color="rgba(255,255,255,0.6)" />
                            <Text className="text-white font-semibold ml-1">
                                {goal.location.latitude === 0
                                    ? 'No location set'
                                    : `${goal.location.city}, ${goal.location.country}`}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-1 items-end">
                        <Text className="dark:text-white/40 text-gray-400 text-xs uppercase tracking-widest mb-1">
                            Target
                        </Text>
                        <Text className="text-white font-semibold">
                            {targetDate.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </Text>
                        {!goal.completed && (
                            <Text
                                className={`text-xs mt-0.5 ${isOverdue ? 'text-red-400' : 'dark:text-white/40 text-gray-400'}`}
                            >
                                {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Time Progress Bar */}
                {!goal.completed &&
                    (() => {
                        const created = new Date(goal.createdAt).getTime();
                        const target = targetDate.getTime();
                        const elapsed = Date.now() - created;
                        const total = target - created;
                        const pct =
                            total <= 0
                                ? 100
                                : Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
                        const barColor = pct >= 90 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#3b82f6';
                        return (
                            <View className="px-6 pt-4 pb-2">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="dark:text-white/40 text-gray-400 text-xs uppercase tracking-widest">
                                        Time Elapsed
                                    </Text>
                                    <Text
                                        className="text-xs font-semibold"
                                        style={{ color: barColor }}
                                    >
                                        {pct}%
                                    </Text>
                                </View>
                                <View className="h-1.5 dark:bg-white/10 bg-black/10 rounded-full overflow-hidden">
                                    <View
                                        className="h-full rounded-full"
                                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                                    />
                                </View>
                            </View>
                        );
                    })()}

                {/* Description */}
                {goal.description ? (
                    <View className="px-6 pt-5 pb-4">
                        <Text className="dark:text-white/40 text-gray-400 text-xs uppercase tracking-widest mb-2">
                            About
                        </Text>
                        <Text className="text-white/80 text-base leading-7">
                            {goal.description}
                        </Text>
                    </View>
                ) : null}

                {/* Motivational context — design thinking: make user feel why this goal matters */}
                {!goal.completed && (
                    <View className="mx-6 mt-4 bg-blue-950/30 border border-blue-500/20 rounded-2xl p-4">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons name="lightbulb" size={16} color="#93c5fd" />
                            <Text className="text-blue-300 text-xs uppercase tracking-widest ml-2 font-semibold">
                                Keep Going
                            </Text>
                        </View>
                        <Text className="text-white/60 text-sm leading-6">
                            {daysLeft > 0
                                ? `You have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} to make "${goal.title}" happen. Every step forward counts.`
                                : daysLeft === 0
                                  ? `Today is the day you planned to achieve "${goal.title}". Make it happen.`
                                  : `"${goal.title}" is past its target date — but it's not too late. The best time to start is now.`}
                        </Text>
                    </View>
                )}

                {/* Completion photo */}
                {goal.completed && completionPhoto && (
                    <View className="mx-6 mt-4 rounded-2xl overflow-hidden">
                        <Text className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2 px-1">
                            Memory Photo
                        </Text>
                        <Image
                            source={{ uri: completionPhoto }}
                            style={{ width: '100%', height: 200, borderRadius: 16 }}
                            resizeMode="cover"
                        />
                    </View>
                )}

                {/* Milestones */}
                <View className="mx-6 mt-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <MaterialIcons name="checklist" size={16} color="#a78bfa" />
                            <Text className="text-purple-400 text-xs uppercase tracking-widest ml-2">
                                Milestones
                            </Text>
                        </View>
                        {(goal.milestones?.length ?? 0) > 0 && (
                            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                                {goal.milestones?.filter(m => m.completed).length ?? 0}/
                                {goal.milestones?.length ?? 0}
                            </Text>
                        )}
                    </View>

                    {/* Progress bar */}
                    {(goal.milestones?.length ?? 0) > 0 && (
                        <View
                            style={{
                                height: 4,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                borderRadius: 2,
                                marginBottom: 12,
                                overflow: 'hidden',
                            }}
                        >
                            <View
                                style={{
                                    height: '100%',
                                    width: `${((goal.milestones?.filter(m => m.completed).length ?? 0) / (goal.milestones?.length ?? 1)) * 100}%`,
                                    backgroundColor: '#a78bfa',
                                    borderRadius: 2,
                                }}
                            />
                        </View>
                    )}

                    {goal.milestones?.map((milestone: Milestone) => (
                        <TouchableOpacity
                            key={milestone.id}
                            onPress={() => {
                                Haptics.selectionAsync();
                                toggleMilestone(goal.id, milestone.id);
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 10,
                                marginBottom: 6,
                                backgroundColor: milestone.completed
                                    ? 'rgba(167,139,250,0.08)'
                                    : 'rgba(255,255,255,0.04)',
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: milestone.completed
                                    ? 'rgba(167,139,250,0.25)'
                                    : 'rgba(255,255,255,0.08)',
                            }}
                        >
                            <MaterialIcons
                                name={
                                    milestone.completed ? 'check-circle' : 'radio-button-unchecked'
                                }
                                size={18}
                                color={milestone.completed ? '#a78bfa' : 'rgba(255,255,255,0.3)'}
                                style={{ marginRight: 10 }}
                            />
                            <Text
                                style={{
                                    color: milestone.completed
                                        ? 'rgba(255,255,255,0.4)'
                                        : 'rgba(255,255,255,0.85)',
                                    fontSize: 14,
                                    flex: 1,
                                    textDecorationLine: milestone.completed
                                        ? 'line-through'
                                        : 'none',
                                }}
                            >
                                {milestone.title}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {/* Add milestone input */}
                    <View
                        style={{
                            flexDirection: 'row',
                            marginTop: 4,
                            gap: 8,
                        }}
                    >
                        <TextInput
                            style={{
                                flex: 1,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.1)',
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                color: 'white',
                                fontSize: 13,
                            }}
                            placeholder="Add a milestone..."
                            placeholderTextColor="rgba(255,255,255,0.25)"
                            value={milestoneInput}
                            onChangeText={setMilestoneInput}
                            returnKeyType="done"
                            onSubmitEditing={() => {
                                if (!milestoneInput.trim()) return;
                                Haptics.selectionAsync();
                                addMilestone(goal.id, {
                                    title: milestoneInput.trim(),
                                    completed: false,
                                });
                                setMilestoneInput('');
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => {
                                if (!milestoneInput.trim()) return;
                                Haptics.selectionAsync();
                                addMilestone(goal.id, {
                                    title: milestoneInput.trim(),
                                    completed: false,
                                });
                                setMilestoneInput('');
                            }}
                            style={{
                                width: 38,
                                height: 38,
                                backgroundColor: '#a78bfa',
                                borderRadius: 10,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: milestoneInput.trim() ? 1 : 0.4,
                            }}
                        >
                            <MaterialIcons name="add" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Notes */}
                {goal.notes ? (
                    <View className="mx-6 mt-2 dark:bg-white/[0.05] bg-black/[0.04] border dark:border-white/[0.08] border-black/[0.08] rounded-2xl p-4">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons name="sticky-note-2" size={16} color="#facc15" />
                            <Text className="text-yellow-400 text-xs uppercase tracking-widest ml-2">
                                Notes
                            </Text>
                        </View>
                        <Text className="dark:text-white/60 text-gray-600 text-sm leading-6">
                            {goal.notes}
                        </Text>
                    </View>
                ) : null}

                {/* Completion info */}
                {goal.completed && goal.completedAt && (
                    <View className="mx-6 mt-4 bg-green-950/40 border border-green-500/20 rounded-2xl p-4 flex-row items-center">
                        <MaterialIcons name="check-circle" size={20} color="#4ade80" />
                        <View className="ml-3">
                            <Text className="text-green-400 text-sm font-semibold">
                                Goal Achieved!
                            </Text>
                            <Text className="dark:text-white/40 text-gray-400 text-xs mt-0.5">
                                Completed{' '}
                                {new Date(goal.completedAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Created at */}
                <View className="px-6 mt-6">
                    <Text className="text-white/20 text-xs">
                        Added{' '}
                        {new Date(goal.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </Text>
                </View>
                {/* Progress Photos */}
                <View style={detailStyles.section}>
                    <View style={detailStyles.sectionHeader}>
                        <MaterialIcons name="photo-library" size={16} color="#60a5fa" />
                        <Text style={detailStyles.sectionTitle}>Progress Photos</Text>
                        <Text style={detailStyles.sectionCount}>{progressPhotos.length}</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={detailStyles.photoRow}
                    >
                        {progressPhotos.map((uri, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => setSelectedPhoto(uri)}
                                activeOpacity={0.85}
                                accessibilityLabel={`Progress photo ${i + 1}`}
                                accessibilityRole="button"
                            >
                                <Image
                                    source={{ uri }}
                                    style={detailStyles.photoThumb}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={handleAddProgressPhoto}
                            style={detailStyles.addPhotoBtn}
                            accessibilityLabel="Add progress photo"
                            accessibilityRole="button"
                        >
                            <MaterialIcons
                                name="add-photo-alternate"
                                size={24}
                                color="rgba(255,255,255,0.4)"
                            />
                            <Text style={detailStyles.addPhotoText}>Add</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Related Goals */}
                {(() => {
                    const related = goals
                        .filter(
                            g =>
                                g.id !== goal.id &&
                                (g.category === goal.category ||
                                    (g.location.country &&
                                        g.location.country === goal.location.country))
                        )
                        .slice(0, 6);
                    if (related.length === 0) return null;
                    return (
                        <View style={detailStyles.section}>
                            <View style={detailStyles.sectionHeader}>
                                <MaterialIcons name="explore" size={16} color="#a78bfa" />
                                <Text style={detailStyles.sectionTitle}>Similar Goals</Text>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={detailStyles.relatedRow}
                            >
                                {related.map(rg => (
                                    <TouchableOpacity
                                        key={rg.id}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            router.push({
                                                pathname: '/goal-detail',
                                                params: { id: rg.id },
                                            });
                                        }}
                                        style={detailStyles.relatedCard}
                                        activeOpacity={0.85}
                                        accessibilityLabel={`Related goal: ${rg.title}`}
                                        accessibilityRole="button"
                                    >
                                        {rg.image ? (
                                            <Image
                                                source={{ uri: rg.image }}
                                                style={StyleSheet.absoluteFillObject as any}
                                                resizeMode="cover"
                                            />
                                        ) : null}
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.85)']}
                                            style={StyleSheet.absoluteFillObject as any}
                                        />
                                        <View style={detailStyles.relatedCardContent}>
                                            <Text style={detailStyles.relatedBadge}>
                                                {rg.category}
                                            </Text>
                                            <Text
                                                style={detailStyles.relatedTitle}
                                                numberOfLines={2}
                                            >
                                                {rg.title}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    );
                })()}
            </ScrollView>

            {/* Photo fullscreen modal */}
            {selectedPhoto && (
                <TouchableOpacity
                    style={detailStyles.photoModal}
                    onPress={() => setSelectedPhoto(null)}
                    activeOpacity={1}
                    accessibilityLabel="Close photo"
                    accessibilityRole="button"
                >
                    <Image
                        source={{ uri: selectedPhoto }}
                        style={detailStyles.photoFull}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            )}

            {/* Bottom Action */}
            <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-4 bg-black/70 border-t border-white/[0.06]">
                <TouchableOpacity
                    className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${goal.completed ? 'dark:bg-white/10 bg-black/10 border dark:border-white/[0.08] border-black/[0.08]' : 'bg-white/15 border dark:border-white/10 border-black/10'}`}
                    onPress={handleToggleComplete}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name={goal.completed ? 'replay' : 'check-circle-outline'}
                        size={22}
                        color={goal.completed ? 'rgba(255,255,255,0.5)' : 'white'}
                    />
                    <Text
                        className={`font-bold text-base ml-2 ${goal.completed ? 'text-white/50' : 'text-white'}`}
                    >
                        {goal.completed ? 'Mark as Pending' : 'Mark as Complete 🎉'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Share FAB - bottom right */}
            <TouchableOpacity
                onPress={handleShare}
                style={{
                    position: 'absolute',
                    bottom: 110,
                    right: 24,
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: '#2563eb',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#2563eb',
                    shadowOpacity: 0.6,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 8,
                }}
                accessibilityLabel="Share goal"
                accessibilityRole="button"
            >
                <MaterialIcons name="share" size={22} color="white" />
            </TouchableOpacity>

            {/* Confetti burst — Peak-End Rule: make this the best moment */}
            <Confetti visible={showCelebration} onDone={() => setShowCelebration(false)} />

            {/* Completion Celebration Overlay */}
            {showCelebration && (
                <Animated.View
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(300)}
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            zIndex: 100,
                        },
                    ]}
                    pointerEvents="none"
                >
                    <Animated.View
                        style={[
                            {
                                width: 140,
                                height: 140,
                                borderRadius: 70,
                                backgroundColor: 'rgba(22,101,52,0.4)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 2,
                                borderColor: '#4ade80',
                            },
                            { transform: [{ scale: celebScale }], opacity: celebOpacity },
                        ]}
                    >
                        <MaterialIcons name="check" size={64} color="#4ade80" />
                    </Animated.View>
                    <Animated.Text
                        style={{
                            color: '#4ade80',
                            fontSize: 20,
                            fontWeight: '700',
                            marginTop: 20,
                            opacity: celebOpacity,
                        }}
                    >
                        Goal Achieved! 🎉
                    </Animated.Text>
                </Animated.View>
            )}

            {/* Share Modal */}
            <Modal
                visible={showShareModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowShareModal(false)}
            >
                <View style={shareStyles.overlay}>
                    <View style={shareStyles.sheet}>
                        <Text style={shareStyles.sheetTitle}>Share Goal</Text>
                        {/* Card preview captured by ViewShot */}
                        <View style={shareStyles.cardContainer}>
                            <ViewShot ref={shareCardRef} options={{ format: 'png', quality: 0.95 }}>
                                <ShareCard goal={goal} />
                            </ViewShot>
                        </View>
                        <View style={shareStyles.actions}>
                            <TouchableOpacity
                                style={shareStyles.actionBtn}
                                onPress={handleShareCard}
                                accessibilityLabel="Share as image"
                                accessibilityRole="button"
                            >
                                <MaterialIcons name="share" size={20} color="white" />
                                <Text style={shareStyles.actionText}>Share Image</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[shareStyles.actionBtn, shareStyles.actionBtnSecondary]}
                                onPress={handleCopyLink}
                                accessibilityLabel="Copy link"
                                accessibilityRole="button"
                            >
                                <MaterialIcons
                                    name="link"
                                    size={20}
                                    color="rgba(255,255,255,0.7)"
                                />
                                <Text
                                    style={[
                                        shareStyles.actionText,
                                        { color: 'rgba(255,255,255,0.7)' },
                                    ]}
                                >
                                    Copy Link
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={shareStyles.cancelBtn}
                            onPress={() => setShowShareModal(false)}
                            accessibilityLabel="Cancel"
                            accessibilityRole="button"
                        >
                            <Text style={shareStyles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}

const shareStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#0f0f18',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: 40,
    },
    sheetTitle: {
        color: 'white',
        fontSize: 17,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
    },
    cardContainer: { alignItems: 'center', marginBottom: 20 },
    actions: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#2563eb',
        borderRadius: 14,
        paddingVertical: 14,
    },
    actionBtnSecondary: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    actionText: { color: 'white', fontWeight: '700', fontSize: 14 },
    cancelBtn: { alignItems: 'center', paddingVertical: 14 },
    cancelText: { color: 'rgba(255,255,255,0.4)', fontSize: 15 },
});

const detailStyles = StyleSheet.create({
    section: { marginHorizontal: 24, marginTop: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    sectionTitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        flex: 1,
    },
    sectionCount: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
    photoRow: { gap: 10, paddingRight: 8 },
    photoThumb: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#111' },
    addPhotoBtn: {
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    addPhotoText: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
    relatedRow: { gap: 10, paddingRight: 8 },
    relatedCard: {
        width: 140,
        height: 100,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#111',
    },
    relatedCardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
    relatedBadge: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        fontWeight: '700',
        marginBottom: 3,
    },
    relatedTitle: { color: 'white', fontSize: 12, fontWeight: '700', lineHeight: 15 },
    photoModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    photoFull: { width: '100%', height: '80%' },
});
