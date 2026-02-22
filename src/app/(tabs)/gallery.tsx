import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Carousel from 'react-native-reanimated-carousel';
import { useGoalStore, Goal } from '../../store/useGoalStore';
import { useRouter } from 'expo-router';

const { width: PAGE_WIDTH } = Dimensions.get('window');

export default function DarkTravelGallery() {
    const { goals } = useGoalStore();
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-black relative" edges={['top', 'bottom']}>
            <StatusBar style="light" />

            {/* Background Blobs */}
            <View className="absolute inset-0 z-0 overflow-hidden" pointerEvents="none">
                <View className="absolute top-[-10%] left-[-20%] w-[400px] h-[400px] bg-purple-900 rounded-full opacity-40" />
                <View className="absolute bottom-[-10%] right-[-20%] w-[400px] h-[400px] bg-blue-900 rounded-full opacity-40" />
            </View>

            <View className="flex-1 z-10">
                {/* Header */}
                <View className="px-6 mt-4 flex-row justify-between items-center">
                    <View className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-lg relative">
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc3ZG704nmOa3EVc3srBQLDvJcDMR-NXgwf-Ts1BbcmseRtAnWaJGwaMycgQ0k9raeLtVGwPOCY9dq-gVnws5lRW3wRPUv4pFlh0S3hc9TNP6PI32LumQ7RDuF_pj19JVCjIVbc9T5awgK6UCOIQQauC0AZ3vVZBiQbrGlbuyZ400jUvHCetPJkE2xno6fEkEZYg1eZt-WFbB8M-sUh4_IUW0vPoFe9_KNs0N5I4YeGfUU-uERXktolnf9jHnoCpEe6UHvEoRYf6Q' }}
                            className="w-full h-full opacity-90"
                        />
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Notifications"
                    >
                        <MaterialIcons name="notifications-none" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Title Area */}
                <View className="px-6 mt-8 flex-col items-center flex-col">
                    <Text className="text-xs font-medium text-gray-400 mb-2 tracking-[0.2em] uppercase">Private Collection</Text>
                    <Text className="text-3xl font-light text-white tracking-tight">Travel Gallery</Text>
                </View>

                {/* Gallery Stack */}
                <View className="flex-1 items-center justify-center relative w-full mb-12 mt-8">
                    {goals.length === 0 ? (
                        <Text className="text-gray-500">No memories to display yet.</Text>
                    ) : (
                        <Carousel
                            loop
                            width={PAGE_WIDTH * 0.8}
                            height={PAGE_WIDTH * 1.2}
                            autoPlay={false}
                            data={goals}
                            scrollAnimationDuration={1000}
                            mode="parallax"
                            modeConfig={{
                                parallaxScrollingScale: 0.9,
                                parallaxScrollingOffset: 50,
                            }}
                            renderItem={({ item }: { item: Goal }) => (
                                <View className="flex-1 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-20 flex flex-col overflow-hidden bg-gray-900">
                                    <View className="h-full w-full relative">
                                        <Image source={{ uri: item.image }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
                                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} className="absolute inset-0 pointer-events-none" />

                                        <View className="absolute top-4 right-4 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 flex-row items-center">
                                            {item.completed ? (
                                                <MaterialIcons name="check-circle" size={14} color="#10b981" />
                                            ) : (
                                                <MaterialIcons name="schedule" size={14} color="#60a5fa" />
                                            )}
                                        </View>

                                        <View className="absolute bottom-0 left-0 right-0 p-5 bg-black/40 border-t border-white/10">
                                            <View className="flex-row justify-between items-end">
                                                <View>
                                                    <Text className="text-2xl font-bold text-white leading-none mb-2">{item.title}</Text>
                                                    <View className="flex-row items-center mt-1">
                                                        <MaterialIcons name="place" size={16} color="rgba(255,255,255,0.7)" />
                                                        <Text className="text-sm font-light text-gray-300 ml-1 tracking-wide">{item.location.city}, {item.location.country}</Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    className="w-10 h-10 rounded-full bg-white/10 border border-white/20 items-center justify-center"
                                                    onPress={() => Haptics.selectionAsync()}
                                                >
                                                    <MaterialIcons name="arrow-forward" size={18} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}
                        />
                    )}
                </View>

            </View>

            {/* Floating Action Button */}
            <View className="absolute bottom-24 left-0 right-0 z-30 flex-row justify-center" pointerEvents="box-none">
                <TouchableOpacity
                    className="bg-black/80 pl-5 pr-6 py-3.5 rounded-full flex-row items-center border border-white/20 shadow-lg shadow-white/10 mb-2"
                    activeOpacity={0.7}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push('/add-goal');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Add Photo"
                >
                    <MaterialIcons name="add" size={20} color="#e5e7eb" />
                    <Text className="text-xs font-bold tracking-widest uppercase text-white ml-2">New Goal</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
