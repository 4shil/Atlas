import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGoalStore, Goal } from '../../store/useGoalStore';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ProfileHeader } from '../../components/ProfileHeader';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SectionHeader } from '../../components/SectionHeader';
import { GoalCard } from '../../components/GoalCard';
import { GoalListSkeleton } from '../../components/Skeleton';

export default function DarkTravelGallery() {
    const { goals, toggleComplete, syncing } = useGoalStore();
    const router = useRouter();
    const [activeIndex, setActiveIndex] = React.useState(0);

    const translateX = useSharedValue(0);

    const goNext = useCallback(() => {
        if (goals.length > 0) {
            setActiveIndex(prev => (prev + 1) % goals.length);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [goals.length]);

    const goPrev = useCallback(() => {
        if (goals.length > 0) {
            setActiveIndex(prev => (prev - 1 + goals.length) % goals.length);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [goals.length]);

    const handleNext = goNext;

    const swipeGesture = Gesture.Pan()
        .onUpdate(e => {
            translateX.value = e.translationX;
        })
        .onEnd(e => {
            if (e.translationX < -60) {
                runOnJS(goNext)();
            } else if (e.translationX > 60) {
                runOnJS(goPrev)();
            }
            translateX.value = withSpring(0, { damping: 20 });
        });

    const cardAnimStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value * 0.15 }],
    }));

    const handleToggleComplete = (id: string, currentStatus: boolean | undefined) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toggleComplete(id, currentStatus ? '' : 'Completed via Gallery');
    };

    return (
        <ScreenWrapper bgClass="bg-black">
            <View className="flex-1 z-10">
                {/* Header */}
                <ProfileHeader
                    rightActions={
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white/10 border border-white/[0.08] flex items-center justify-center"
                            activeOpacity={0.7}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push('/notifications');
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Notifications"
                        >
                            <MaterialIcons
                                name="notifications-none"
                                size={24}
                                color="rgba(255,255,255,0.8)"
                            />
                        </TouchableOpacity>
                    }
                />

                <SectionHeader overline="Private Collection" title="Travel Gallery" />

                {/* Gallery Stack */}
                <View className="flex-1 items-center justify-center relative w-full mb-12">
                    <View className="w-full h-[480px] relative items-center justify-center pt-8">
                        {goals.length === 0 ? (
                            <Text className="text-gray-500">No memories to display yet.</Text>
                        ) : (
                            <>
                                {/* Left Card -> Index 1 */}
                                {goals.length > 1 && (
                                    <View
                                        className="absolute left-[5%] w-[65%] h-[380px] z-10"
                                        style={{ transform: [{ rotate: '-6deg' }], opacity: 0.9 }}
                                    >
                                        <GoalCard
                                            goal={goals[(activeIndex + 1) % goals.length]}
                                            onPress={() =>
                                                setActiveIndex((activeIndex + 1) % goals.length)
                                            }
                                            onToggleComplete={() => {}}
                                            isInteractive={false}
                                        />
                                    </View>
                                )}

                                {/* Right Card -> Index 2 */}
                                {goals.length > 2 && (
                                    <View
                                        className="absolute right-[5%] w-[65%] h-[380px] z-10"
                                        style={{ transform: [{ rotate: '6deg' }], opacity: 0.9 }}
                                    >
                                        <GoalCard
                                            goal={goals[(activeIndex + 2) % goals.length]}
                                            onPress={() =>
                                                setActiveIndex((activeIndex + 2) % goals.length)
                                            }
                                            onToggleComplete={() => {}}
                                            isInteractive={false}
                                        />
                                    </View>
                                )}

                                {/* Center Card -> Index 0 */}
                                {goals.length > 0 && (
                                    <GestureDetector gesture={swipeGesture}>
                                        <View className="w-[75%] max-w-[300px]">
                                            <GoalCard
                                                goal={goals[activeIndex]}
                                                onPress={() => {
                                                    Haptics.selectionAsync();
                                                    router.push({
                                                        pathname: '/goal-detail',
                                                        params: { id: goals[activeIndex].id },
                                                    });
                                                }}
                                                onToggleComplete={() =>
                                                    handleToggleComplete(
                                                        goals[activeIndex].id,
                                                        goals[activeIndex].completed
                                                    )
                                                }
                                                onNext={handleNext}
                                                animatedStyle={cardAnimStyle}
                                                isInteractive={true}
                                            />
                                        </View>
                                    </GestureDetector>
                                )}
                            </>
                        )}
                    </View>

                    {/* Dot Indicators */}
                    {goals.length > 1 && (
                        <View className="flex-row gap-2 items-center justify-center mt-4">
                            {goals.map((_, i) => (
                                <TouchableOpacity key={i} onPress={() => setActiveIndex(i)}>
                                    <View
                                        style={{
                                            width: i === activeIndex ? 20 : 6,
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor:
                                                i === activeIndex
                                                    ? '#3b82f6'
                                                    : 'rgba(255,255,255,0.2)',
                                        }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            {/* Floating Action Button */}
            <View
                className="absolute bottom-24 left-0 right-0 z-30 flex-row justify-center"
                pointerEvents="box-none"
            >
                <TouchableOpacity
                    className="bg-white/10 pl-5 pr-6 py-3.5 rounded-full flex-row items-center border border-white/[0.12] mb-2"
                    activeOpacity={0.7}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push('/add-goal');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Add Photo"
                >
                    <MaterialIcons name="add" size={20} color="white" />
                    <Text className="text-xs font-bold tracking-widest uppercase text-white ml-2">
                        New Goal
                    </Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}
