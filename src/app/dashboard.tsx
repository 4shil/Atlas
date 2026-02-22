import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

export default function DashboardLight() {
    return (
        <SafeAreaView className="flex-1 bg-gray-100" edges={['top', 'bottom']}>
            <StatusBar style="dark" />
            {/* Background Blobs */}
            <View className="absolute inset-0 z-0 overflow-hidden" pointerEvents="none">
                <View className="absolute -top-20 -left-20 w-[350px] h-[350px] bg-teal-100 rounded-full opacity-80" />
                <View className="absolute top-0 -right-20 w-[300px] h-[300px] bg-emerald-100 rounded-full opacity-70" />
                <View className="absolute top-1/3 left-[20%] w-[400px] h-[400px] bg-indigo-50 rounded-full opacity-60" />
                <View className="absolute -bottom-20 -right-20 w-[350px] h-[350px] bg-orange-50 rounded-full opacity-60" />
            </View>

            <ScrollView className="flex-1 relative z-10" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                {/* Header */}
                <View className="px-6 mt-4 flex-row justify-between items-center">
                    <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc3ZG704nmOa3EVc3srBQLDvJcDMR-NXgwf-Ts1BbcmseRtAnWaJGwaMycgQ0k9raeLtVGwPOCY9dq-gVnws5lRW3wRPUv4pFlh0S3hc9TNP6PI32LumQ7RDuF_pj19JVCjIVbc9T5awgK6UCOIQQauC0AZ3vVZBiQbrGlbuyZ400jUvHCetPJkE2xno6fEkEZYg1eZt-WFbB8M-sUh4_IUW0vPoFe9_KNs0N5I4YeGfUU-uERXktolnf9jHnoCpEe6UHvEoRYf6Q' }}
                            className="w-full h-full"
                        />
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-white/40 items-center justify-center shadow-sm"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Notifications"
                    >
                        <MaterialIcons name="notifications-none" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Title Area */}
                <View className="px-6 mt-16 items-center flex-col">
                    <Text className="text-sm font-medium text-gray-500 mb-1 tracking-wide">My Journeys</Text>
                    <Text className="text-3xl font-bold text-gray-800 tracking-tight mb-6">Life Bucket List</Text>
                    <TouchableOpacity
                        className="bg-white/80 px-4 py-2 rounded-full flex-row items-center shadow-sm border border-white/50"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                        accessibilityRole="button"
                        accessibilityLabel="Add new adventure"
                    >
                        <MaterialIcons name="add-circle-outline" size={20} color="#1f2937" />
                        <Text className="text-sm font-semibold text-gray-800 ml-2">Add Adventure</Text>
                    </TouchableOpacity>
                </View>

                {/* Overview section */}
                <View className="px-6 mt-10">
                    <Text className="text-sm font-semibold text-gray-700 mb-4">Overview</Text>

                    <View className="flex-row justify-between">
                        {/* Completed Card */}
                        <View className="flex-1 bg-teal-50 rounded-[2rem] p-5 shadow-sm border border-white/40 overflow-hidden relative mr-2">
                            <Text className="text-lg font-medium text-gray-800 leading-tight">Completed</Text>
                            <Text className="text-teal-600 font-medium text-sm mt-1 mb-6">Great job!</Text>
                            <View className="flex-row items-baseline">
                                <View className="w-1 h-8 bg-white/50 rounded-full mr-2" />
                                <Text className="text-3xl font-semibold text-gray-900 tracking-tight">12</Text>
                            </View>
                            <View className="absolute top-4 right-4 opacity-40">
                                <MaterialIcons name="check-circle-outline" size={36} color="#0d9488" style={{ transform: [{ rotate: '12deg' }] }} />
                            </View>
                        </View>

                        {/* Pending Card */}
                        <View className="flex-1 bg-indigo-50 rounded-[2rem] p-5 shadow-sm border border-white/40 overflow-hidden relative ml-2">
                            <Text className="text-lg font-medium text-gray-800 leading-tight">Pending</Text>
                            <Text className="text-indigo-400 font-medium text-sm mt-1 mb-6">Keep going</Text>
                            <View className="flex-row items-baseline">
                                <View className="w-1 h-8 bg-indigo-200 rounded-full mr-2" />
                                <Text className="text-3xl font-semibold text-gray-900 tracking-tight">24</Text>
                            </View>
                            <View className="absolute top-4 right-4 opacity-40">
                                <MaterialIcons name="hourglass-empty" size={36} color="#6366f1" style={{ transform: [{ rotate: '-12deg' }] }} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Upcoming Adventures */}
                <View className="px-6 mt-8 mb-10 flex-col space-y-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-3">Upcoming Adventures</Text>
                    <View className="flex-col pb-4">

                        <TouchableOpacity
                            className="bg-white/60 p-4 rounded-2xl flex-row items-center justify-between border border-white/40 mb-3"
                            activeOpacity={0.7}
                            onPress={() => Haptics.selectionAsync()}
                            accessibilityRole="button"
                            accessibilityLabel="View Trip to Japan details"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl bg-orange-100 items-center justify-center mr-3">
                                    <MaterialIcons name="flight-takeoff" size={20} color="#f97316" />
                                </View>
                                <View className="flex-col">
                                    <Text className="text-sm font-semibold text-gray-800">Trip to Japan</Text>
                                    <Text className="text-xs text-gray-500">March 2024</Text>
                                </View>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-white/60 p-4 rounded-2xl flex-row items-center justify-between border border-white/40"
                            activeOpacity={0.7}
                            onPress={() => Haptics.selectionAsync()}
                            accessibilityRole="button"
                            accessibilityLabel="View Scuba Diving details"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center mr-3">
                                    <MaterialIcons name="scuba-diving" size={20} color="#3b82f6" />
                                </View>
                                <View className="flex-col">
                                    <Text className="text-sm font-semibold text-gray-800">Scuba Diving</Text>
                                    <Text className="text-xs text-gray-500">Summer 2024</Text>
                                </View>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
                        </TouchableOpacity>

                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
