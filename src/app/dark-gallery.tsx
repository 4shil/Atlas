import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function DarkTravelGallery() {
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
                <View className="flex-1 items-center justify-center relative w-full mb-12">
                    <View className="w-full h-[480px] relative items-center justify-center pt-8">

                        {/* Left Card -> Paris Nights */}
                        <View className="absolute left-[5%] w-[65%] h-[380px] bg-black/40 rounded-[24px] border border-white/10 shadow-2xl z-10 overflow-hidden" style={{ transform: [{ rotate: '-6deg' }], opacity: 0.9 }}>
                            <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt3pWIbvV8Y9AGyrrFl4WY8qE7xnILeTfQ9cu-6hC0Qb9y1Rb2p5qo19cTS64uLvuNMhRI_LOwDLRl2sZm50Iw_l0R5fubyez_XA1XJfcm1TwMBYEh1MYtcv3xw4CqTkWcRZNu7GT0dtjAPuAX6AbzpuNrO5LRrS-w2Rwh5Ca3Gj2GQFSNAVmp7nN74PMQlI_HSAQVkvngoVjvbGSnRp6JDqCPZ-F93eQYJ8d98y580Yw4dL4erG3yGFnPFDlBdn3pXSNSYtaO2Lk' }} className="absolute inset-0 w-full h-full opacity-50" />
                            <View className="absolute inset-0 bg-black/40" />
                            <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 border-t border-white/5">
                                <Text className="font-medium text-white text-lg">Paris Nights</Text>
                                <Text className="text-xs text-gray-400">Nov 2022</Text>
                            </View>
                        </View>

                        {/* Right Card -> Safari */}
                        <View className="absolute right-[5%] w-[65%] h-[380px] bg-black/40 rounded-[24px] border border-white/10 shadow-2xl z-10 overflow-hidden" style={{ transform: [{ rotate: '6deg' }], opacity: 0.9 }}>
                            <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN2lHRAjplzGwkhMUdbMXs4lAU3xrcbip_s1VT8BPq4Jn5BRlj_Y4v9OJ6S5LSZ9bkqzlOGEVXrhO-Y-mXRO6g1s47T15sqC6LFgWc7KnjnPzwWEBwa0Om2g7d7w1cux0vRuFH_8OWe8qhWR8o0PzlCxaaKpC5Jx_6afYXtxS02HxoAZ3dk-phmD7Qud-lJktyRIZGoVDVuJ249ZXr8l-pbXs0TRoOyP9yvm833GP5ZIbe2jIpkeQOT7nf4BsvPzB5duRe_PKrNew' }} className="absolute inset-0 w-full h-full opacity-50" />
                            <View className="absolute inset-0 bg-black/40" />
                            <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 border-t border-white/5">
                                <Text className="font-medium text-white text-lg">Safari</Text>
                                <Text className="text-xs text-gray-400">Aug 2023</Text>
                            </View>
                        </View>

                        {/* Center Card -> Mount Fuji */}
                        <View className="relative w-[75%] max-w-[300px] h-[440px] bg-gray-900 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-20 flex flex-col overflow-hidden">
                            <View className="h-full w-full relative">
                                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-doBLLmuOCfvnJ5Y6yiM1iIR2KpiDCLW5UlcSo8HWhAjyG0-p7EXgNUuA8HO0zn7PK7TG0UDMrZwDmx94MNq8HRRLpI-3zBK40HLECak9Kwoc8omY7v-AeTM3kHQ9TApBJ5lZJbjde1AADY1vEkGMsxW3MyH9XU3c7RB06OLNZVXDhCzma7XxkfST5Qfh0H5XK418TROZ6GBRrrTW0r55LVbD90IbTP4tCvcFK5TODBCPsyBp7r0Zgzgkg6gq4ooGWkOM3HsLEt4' }} className="absolute inset-0 w-full h-full" />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} className="absolute inset-0 pointer-events-none" />

                                <View className="absolute top-4 right-4 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 flex-row items-center">
                                    <MaterialIcons name="favorite" size={14} color="white" />
                                    <Text className="text-white text-xs font-semibold ml-1.5 tracking-wide">248</Text>
                                </View>

                                <View className="absolute bottom-0 left-0 right-0 p-5 bg-black/40 border-t border-white/10">
                                    <View className="flex-row justify-between items-end">
                                        <View>
                                            <Text className="text-2xl font-bold text-white leading-none mb-2">Mount Fuji</Text>
                                            <View className="flex-row items-center mt-1">
                                                <MaterialIcons name="place" size={16} color="rgba(255,255,255,0.7)" />
                                                <Text className="text-sm font-light text-gray-300 ml-1 tracking-wide">Japan</Text>
                                            </View>
                                        </View>
                                        <View className="w-10 h-10 rounded-full bg-white/10 border border-white/20 items-center justify-center">
                                            <MaterialIcons name="arrow-forward" size={18} color="white" />
                                        </View>
                                    </View>
                                </View>

                            </View>
                        </View>

                    </View>
                </View>

            </View>

            {/* Floating Action Button */}
            <View className="absolute bottom-10 left-0 right-0 z-30 flex-row justify-center" pointerEvents="box-none">
                <TouchableOpacity
                    className="bg-black/80 pl-5 pr-6 py-3.5 rounded-full flex-row items-center border border-white/20 shadow-lg shadow-white/10 mb-2"
                    activeOpacity={0.7}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                    accessibilityRole="button"
                    accessibilityLabel="Add Photo"
                >
                    <MaterialIcons name="add-a-photo" size={20} color="#e5e7eb" />
                    <Text className="text-xs font-bold tracking-widest uppercase text-white ml-2">Add Photo</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
