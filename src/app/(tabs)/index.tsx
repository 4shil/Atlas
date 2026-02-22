import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useGoalStore, Goal } from '../../store/useGoalStore';
import { useRouter } from 'expo-router';

export default function DashboardDark() {
    const { getCompletedGoals, getPendingGoals } = useGoalStore();
    const router = useRouter();

    const completedGoals = getCompletedGoals();
    const pendingGoals = getPendingGoals().sort((a: Goal, b: Goal) => new Date(a.timelineDate).getTime() - new Date(b.timelineDate).getTime());

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top', 'bottom']}>
            <StatusBar style="light" />

            {/* Background Blobs for Pure Dark */}
            <View className="absolute inset-0 z-0 bg-[#000000] overflow-hidden" pointerEvents="none">
                <View className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-indigo-950 rounded-full opacity-40" />
                <View className="absolute top-1/2 left-[10%] w-[500px] h-[500px] bg-slate-900 rounded-full opacity-30" />
                <View className="absolute -bottom-20 -right-20 w-[350px] h-[350px] bg-indigo-900 rounded-full opacity-30" />
            </View>

            <ScrollView className="flex-1 relative z-10" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                {/* Header */}
                <View className="px-6 mt-4 flex-row justify-between items-center">
                    <View className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 shadow-sm relative">
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc3ZG704nmOa3EVc3srBQLDvJcDMR-NXgwf-Ts1BbcmseRtAnWaJGwaMycgQ0k9raeLtVGwPOCY9dq-gVnws5lRW3wRPUv4pFlh0S3hc9TNP6PI32LumQ7RDuF_pj19JVCjIVbc9T5awgK6UCOIQQauC0AZ3vVZBiQbrGlbuyZ400jUvHCetPJkE2xno6fEkEZYg1eZt-WFbB8M-sUh4_IUW0vPoFe9_KNs0N5I4YeGfUU-uERXktolnf9jHnoCpEe6UHvEoRYf6Q' }}
                            className="w-full h-full opacity-90"
                            style={{ tintColor: 'gray', mixBlendMode: 'luminosity' } as any}
                        />
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-black/70 border border-gray-700 items-center justify-center shadow-sm"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Notifications"
                    >
                        <MaterialIcons name="notifications-none" size={24} color="#d1d5db" />
                    </TouchableOpacity>
                </View>

                {/* Title Area */}
                <View className="px-6 mt-16 items-center flex-col">
                    <Text className="text-sm font-medium text-gray-400 mb-1 tracking-wide">My Journeys</Text>
                    <Text className="text-3xl font-bold text-white tracking-tight mb-6">Life Bucket List</Text>
                    <TouchableOpacity
                        className="bg-gray-800 px-4 py-2 rounded-full flex-row items-center shadow-lg border border-gray-600"
                        activeOpacity={0.7}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            router.push('/add-goal');
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Add new adventure"
                    >
                        <MaterialIcons name="add-circle-outline" size={20} color="white" />
                        <Text className="text-sm font-semibold text-white ml-2">Add Adventure</Text>
                    </TouchableOpacity>
                </View>

                {/* Overview section */}
                <View className="px-6 mt-10">
                    <Text className="text-sm font-semibold text-gray-300 mb-4">Overview</Text>

                    <View className="flex-row justify-between">
                        {/* Completed Card */}
                        <View className="flex-1 bg-black/60 rounded-[2rem] p-5 shadow-inner border border-gray-700 overflow-hidden relative mr-2">
                            <Text className="text-lg font-medium text-white leading-tight">Completed</Text>
                            <Text className="text-gray-400 font-medium text-xs mt-1 mb-6">Great job!</Text>
                            <View className="flex-row items-baseline">
                                <View className="w-1 h-8 bg-white rounded-full mr-2" />
                                <Text className="text-3xl font-semibold text-white tracking-tight">{completedGoals.length}</Text>
                            </View>
                            <View className="absolute top-4 right-4 opacity-20">
                                <MaterialIcons name="check-circle-outline" size={36} color="white" style={{ transform: [{ rotate: '12deg' }] }} />
                            </View>
                        </View>

                        {/* Pending Card */}
                        <View className="flex-1 bg-black/60 rounded-[2rem] p-5 shadow-inner border border-gray-700 overflow-hidden relative ml-2">
                            <Text className="text-lg font-medium text-white leading-tight">Pending</Text>
                            <Text className="text-gray-400 font-medium text-xs mt-1 mb-6">Keep going</Text>
                            <View className="flex-row items-baseline">
                                <View className="w-1 h-8 bg-gray-600 rounded-full mr-2" />
                                <Text className="text-3xl font-semibold text-white tracking-tight">{pendingGoals.length}</Text>
                            </View>
                            <View className="absolute top-4 right-4 opacity-20">
                                <MaterialIcons name="hourglass-empty" size={36} color="white" style={{ transform: [{ rotate: '-12deg' }] }} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Upcoming Adventures */}
                <View className="px-6 mt-8 mb-10 flex-col space-y-4">
                    <Text className="text-sm font-semibold text-gray-300 mb-3">Upcoming Adventures</Text>
                    <View className="flex-col pb-4">
                        {pendingGoals.length === 0 ? (
                            <Text className="text-gray-500 text-sm">No upcoming adventures planned.</Text>
                        ) : (
                            pendingGoals.slice(0, 3).map((goal: Goal) => (
                                <TouchableOpacity
                                    key={goal.id}
                                    className="bg-black/40 p-4 rounded-2xl flex-row items-center justify-between border border-gray-800 mb-3"
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        // TODO navigate to goal detail
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`View ${goal.title} details`}
                                >
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 items-center justify-center mr-3 overflow-hidden">
                                            {goal.category === 'Travel' && <MaterialIcons name="flight-takeoff" size={20} color="white" />}
                                            {goal.category === 'Adventures' && <MaterialIcons name="hiking" size={20} color="white" />}
                                            {goal.category !== 'Travel' && goal.category !== 'Adventures' && <MaterialIcons name="place" size={20} color="white" />}
                                        </View>
                                        <View className="flex-col">
                                            <Text className="text-sm font-semibold text-white">{goal.title}</Text>
                                            <Text className="text-xs text-gray-500">
                                                {new Date(goal.timelineDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </Text>
                                        </View>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={24} color="#4b5563" />
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
