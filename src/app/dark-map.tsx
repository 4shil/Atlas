import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, Pattern, Rect, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

export default function DarkAdventureMap() {
    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />

            {/* Top Map Area 60% */}
            <View className="relative h-[60%] w-full bg-[#050505] z-10 overflow-hidden">

                {/* SVG Map Lines and Dots Pattern */}
                <View className="absolute inset-0 z-0 bg-[#0f0f13]">

                    <Svg width="100%" height="100%" className="absolute inset-0 opacity-20">
                        <Path d="M-10 100 Q 150 150 200 50 T 400 100" fill="none" stroke="#333" strokeWidth="8" />
                        <Path d="M-10 300 Q 100 250 200 350 T 400 300" fill="none" stroke="#333" strokeWidth="6" />
                        <Path d="M150 0 L 150 800" fill="none" stroke="#2a2a2a" strokeWidth="12" />
                        <Path d="M280 0 L 250 800" fill="none" stroke="#2a2a2a" strokeWidth="10" />
                    </Svg>

                    <Svg width="100%" height="100%" className="absolute inset-0 opacity-20">
                        <Defs>
                            <Pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
                                <Circle cx="2" cy="2" r="1.5" fill="#555" />
                            </Pattern>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#dots)" />
                    </Svg>

                </View>

                <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.9)']} className="absolute inset-0 pointer-events-none z-10" />
                <View className="absolute inset-0 bg-blue-900/10 pointer-events-none z-10" />

                <View className="absolute top-1/3 left-1/2 -ml-8 -mt-8 z-20 items-center text-center">
                    <View className="bg-black/80 px-4 py-1.5 rounded-full shadow-lg mb-3 border border-white/10">
                        <Text className="text-[10px] uppercase tracking-widest font-bold text-white">Current</Text>
                    </View>
                    <View className="relative w-16 h-16 items-center justify-center">
                        <View className="w-4 h-4 bg-blue-500 rounded-full border-[3px] border-black shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10" />
                    </View>
                </View>

                <View className="absolute top-[22%] left-[18%] z-20">
                    <View className="w-10 h-10 bg-[#111] rounded-full shadow-2xl items-center justify-center border border-white/20">
                        <MaterialIcons name="temple-buddhist" size={18} color="white" />
                    </View>
                </View>

                <View className="absolute top-[42%] right-[12%] z-20">
                    <View className="w-10 h-10 bg-[#111] rounded-full shadow-2xl items-center justify-center border border-white/20">
                        <MaterialIcons name="restaurant" size={18} color="white" />
                    </View>
                </View>

                <View className="absolute bottom-[35%] left-[15%] z-20 opacity-80">
                    <View className="w-8 h-8 bg-[#111] rounded-full shadow-2xl items-center justify-center border border-white/20">
                        <MaterialIcons name="park" size={16} color="white" />
                    </View>
                </View>

                {/* Top Floating Buttons */}
                <View className="absolute top-0 left-0 right-0 pt-16 px-6 flex-row justify-between items-start z-30 pointer-events-box-none">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-black/50 items-center justify-center shadow-lg border border-white/10"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <MaterialIcons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-black/50 items-center justify-center shadow-lg border border-white/10"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Filter map"
                    >
                        <MaterialIcons name="tune" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Sheet 48% */}
            <View className="relative flex-1 -mt-10 w-full z-20 rounded-t-[32px] bg-black/90 border-t border-white/10 overflow-hidden flex-col shadow-[0_-10px_60px_rgba(0,0,0,0.8)]">
                <View className="w-full items-center pt-4 pb-2">
                    <View className="w-10 h-1 bg-white/20 rounded-full" />
                </View>

                <ScrollView className="flex-1 px-6 pb-8 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Current Location */}
                    <View className="mb-8">
                        <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Currently In</Text>
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-3xl font-bold text-white tracking-tight">Tokyo, Japan</Text>
                                <View className="flex-row items-center mt-2 space-x-2">
                                    <MaterialIcons name="cloud" size={18} color="#60a5fa" />
                                    <Text className="text-sm font-medium text-blue-400 ml-2">18°C • Night</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/5 items-center justify-center"
                                activeOpacity={0.7}
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                accessibilityRole="button"
                                accessibilityLabel="Recenter map"
                            >
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Next Goals */}
                    <View>
                        <View className="flex-row justify-between items-end mb-5">
                            <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Next Goals</Text>
                            <Text className="text-xs text-blue-400 font-semibold">See all</Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible pb-4" contentContainerStyle={{ paddingRight: 16 }}>

                            {/* Activity 1 */}
                            <View className="w-[260px] h-[170px] relative rounded-3xl overflow-hidden shadow-black/50 shadow-lg mr-4 border border-white/5 bg-gray-900">
                                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt3pWIbvV8Y9AGyrrFl4WY8qE7xnILeTfQ9cu-6hC0Qb9y1Rb2p5qo19cTS64uLvuNMhRI_LOwDLRl2sZm50Iw_l0R5fubyez_XA1XJfcm1TwMBYEh1MYtcv3xw4CqTkWcRZNu7GT0dtjAPuAX6AbzpuNrO5LRrS-w2Rwh5Ca3Gj2GQFSNAVmp7nN74PMQlI_HSAQVkvngoVjvbGSnRp6JDqCPZ-F93eQYJ8d98y580Yw4dL4erG3yGFnPFDlBdn3pXSNSYtaO2Lk' }} className="absolute inset-0 w-full h-full opacity-60" />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,1)']} className="absolute inset-0" />

                                <View className="absolute inset-0 p-5 flex-col justify-between">
                                    <View className="self-end hidden">
                                        <View className="w-8 h-8 rounded-full bg-white/10 border border-white/20 items-center justify-center">
                                            <MaterialIcons name="bookmark-border" size={16} color="white" />
                                        </View>
                                    </View>
                                    <View className="flex-1 justify-end flex-row items-end">
                                        <View className="flex-1">
                                            <Text className="text-white font-bold text-xl leading-tight mb-1">Visit Kyoto</Text>
                                            <View className="flex-row items-center">
                                                <MaterialIcons name="near-me" size={14} color="#3b82f6" />
                                                <Text className="text-gray-400 text-xs font-medium ml-1">450km</Text>
                                            </View>
                                        </View>
                                        <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center shadow-lg shadow-blue-900/40">
                                            <MaterialIcons name="arrow-forward" size={20} color="white" />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Activity 2 */}
                            <View className="w-[260px] h-[170px] relative rounded-3xl overflow-hidden shadow-black/50 shadow-lg mr-4 border border-white/5 bg-gray-900">
                                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-doBLLmuOCfvnJ5Y6yiM1iIR2KpiDCLW5UlcSo8HWhAjyG0-p7EXgNUuA8HO0zn7PK7TG0UDMrZwDmx94MNq8HRRLpI-3zBK40HLECak9Kwoc8omY7v-AeTM3kHQ9TApBJ5lZJbjde1AADY1vEkGMsxW3MyH9XU3c7RB06OLNZVXDhCzma7XxkfST5Qfh0H5XK418TROZ6GBRrrTW0r55LVbD90IbTP4tCvcFK5TODBCPsyBp7r0Zgzgkg6gq4ooGWkOM3HsLEt4' }} className="absolute inset-0 w-full h-full opacity-60" resizeMode="cover" />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,1)']} className="absolute inset-0" />

                                <View className="absolute inset-0 p-5 flex-col justify-between">
                                    <View className="self-end hidden">
                                        <View className="w-8 h-8 rounded-full bg-white/10 border border-white/20 items-center justify-center">
                                            <MaterialIcons name="bookmark-border" size={16} color="white" />
                                        </View>
                                    </View>
                                    <View className="flex-1 justify-end flex-row items-end">
                                        <View className="flex-1">
                                            <Text className="text-white font-bold text-xl leading-tight mb-1">Hokkaido Ski</Text>
                                            <View className="flex-row items-center">
                                                <MaterialIcons name="near-me" size={14} color="#3b82f6" />
                                                <Text className="text-gray-400 text-xs font-medium ml-1">890km</Text>
                                            </View>
                                        </View>
                                        <View className="w-10 h-10 rounded-full bg-[#222] border border-white/10 items-center justify-center">
                                            <MaterialIcons name="arrow-forward" size={20} color="white" />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Activity 3 */}
                            <View className="w-[260px] h-[170px] relative rounded-3xl overflow-hidden shadow-black/50 shadow-lg mr-6 border border-white/5 bg-gray-900">
                                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN2lHRAjplzGwkhMUdbMXs4lAU3xrcbip_s1VT8BPq4Jn5BRlj_Y4v9OJ6S5LSZ9bkqzlOGEVXrhO-Y-mXRO6g1s47T15sqC6LFgWc7KnjnPzwWEBwa0Om2g7d7w1cux0vRuFH_8OWe8qhWR8o0PzlCxaaKpC5Jx_6afYXtxS02HxoAZ3dk-phmD7Qud-lJktyRIZGoVDVuJ249ZXr8l-pbXs0TRoOyP9yvm833GP5ZIbe2jIpkeQOT7nf4BsvPzB5duRe_PKrNew' }} className="absolute inset-0 w-full h-full opacity-60" resizeMode="cover" />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,1)']} className="absolute inset-0" />

                                <View className="absolute inset-0 p-5 flex-col justify-between">
                                    <View className="self-end hidden">
                                        <View className="w-8 h-8 rounded-full bg-white/10 border border-white/20 items-center justify-center">
                                            <MaterialIcons name="bookmark-border" size={16} color="white" />
                                        </View>
                                    </View>
                                    <View className="flex-1 justify-end flex-row items-end">
                                        <View className="flex-1">
                                            <Text className="text-white font-bold text-xl leading-tight mb-1">Osaka Food</Text>
                                            <View className="flex-row items-center">
                                                <MaterialIcons name="near-me" size={14} color="#3b82f6" />
                                                <Text className="text-gray-400 text-xs font-medium ml-1">510km</Text>
                                            </View>
                                        </View>
                                        <View className="w-10 h-10 rounded-full bg-[#222] border border-white/10 items-center justify-center">
                                            <MaterialIcons name="arrow-forward" size={20} color="white" />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </ScrollView >
            </View >
        </View >
    );
}
