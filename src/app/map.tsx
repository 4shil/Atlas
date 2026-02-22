import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function AdventureMapLight() {
    return (
        <View className="flex-1 bg-gray-100">
            <StatusBar style="dark" />

            {/* Background Blobs (behind everything) */}
            <View className="absolute inset-0 z-0" pointerEvents="none">
                <View className="absolute -top-20 -left-20 w-[350px] h-[350px] bg-teal-100 rounded-full opacity-80" />
                <View className="absolute top-0 -right-20 w-[300px] h-[300px] bg-emerald-100 rounded-full opacity-70" />
                <View className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50 rounded-full opacity-60" />
            </View>

            {/* Top Map Area 60% */}
            <View className="relative h-[60%] w-full bg-gray-200 z-10 overflow-hidden">
                {/* We use Image for static map background to mirror Stitch */}
                <Image
                    source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=35.6895,139.6917&zoom=13&size=800x1200&style=feature:all|element:geometry|color:0xf5f5f5&style=feature:water|element:geometry|color:0xc9c9c9&style=feature:landscape|element:geometry|color:0xe3e3e3&key=YOUR_API_KEY_HERE' }}
                    className="absolute inset-0 w-full h-full opacity-60"
                    style={{ tintColor: 'gray' }}
                    resizeMode="cover"
                />
                <LinearGradient colors={['rgba(240,253,250,0.5)', 'transparent']} className="absolute inset-0 pointer-events-none" />

                <View className="absolute top-1/3 left-1/2 -ml-8 -mt-8 z-20 items-center">
                    <View className="bg-white/90 px-3 py-1 rounded-full shadow-lg mb-2 border border-white/50">
                        <Text className="text-xs font-bold text-gray-800">You are here</Text>
                    </View>
                    <View className="w-16 h-16 rounded-full bg-teal-500/20 items-center justify-center">
                        <View className="w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow-lg" />
                    </View>
                </View>

                <View className="absolute top-[20%] left-[20%] z-20">
                    <View className="w-10 h-10 bg-white rounded-full shadow-xl items-center justify-center border-2 border-indigo-200">
                        <MaterialIcons name="temple-buddhist" size={14} color="#6366f1" />
                    </View>
                </View>

                <View className="absolute top-[45%] right-[15%] z-20">
                    <View className="w-10 h-10 bg-white rounded-full shadow-xl items-center justify-center border-2 border-orange-200">
                        <MaterialIcons name="restaurant" size={14} color="#f97316" />
                    </View>
                </View>

                {/* Top Floating Buttons */}
                <View className="absolute top-0 left-0 right-0 pt-16 px-6 flex-row justify-between items-start z-30 pointer-events-box-none">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-white/80 items-center justify-center shadow-sm border border-white/40"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-white/80 items-center justify-center shadow-sm border border-white/40"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Filter map"
                    >
                        <MaterialIcons name="tune" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Sheet 45% */}
            <View className="relative flex-1 -mt-6 w-full z-20 rounded-t-[24px] bg-white/80 border-t border-white/40 overflow-hidden flex-col shadow-lg">
                <View className="w-full items-center pt-3 pb-1">
                    <View className="w-12 h-1.5 bg-gray-300/60 rounded-full" />
                </View>

                <ScrollView className="flex-1 px-6 pb-8 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Current Location */}
                    <View className="mb-6">
                        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Location</Text>
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-2xl font-bold text-gray-800">Tokyo, Japan</Text>
                                <View className="flex-row items-center mt-1">
                                    <MaterialIcons name="cloud" size={14} color="#0d9488" />
                                    <Text className="text-sm font-medium text-teal-600 ml-1">18°C Partly Cloudy</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-teal-100 items-center justify-center"
                                activeOpacity={0.7}
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                accessibilityRole="button"
                                accessibilityLabel="Recenter map"
                            >
                                <MaterialIcons name="my-location" size={20} color="#0d9488" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Upcoming Adventures */}
                    <View>
                        <View className="flex-row justify-between items-end mb-4">
                            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming Adventures</Text>
                            <Text className="text-xs text-teal-600 font-medium">See all</Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible pb-4" contentContainerStyle={{ paddingRight: 16 }}>
                            {/* Activity 1 */}
                            <View className="w-[240px] h-[160px] relative rounded-2xl overflow-hidden shadow-lg mr-4 bg-gray-200">
                                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt3pWIbvV8Y9AGyrrFl4WY8qE7xnILeTfQ9cu-6hC0Qb9y1Rb2p5qo19cTS64uLvuNMhRI_LOwDLRl2sZm50Iw_l0R5fubyez_XA1XJfcm1TwMBYEh1MYtcv3xw4CqTkWcRZNu7GT0dtjAPuAX6AbzpuNrO5LRrS-w2Rwh5Ca3Gj2GQFSNAVmp7nN74PMQlI_HSAQVkvngoVjvbGSnRp6JDqCPZ-F93eQYJ8d98y580Yw4dL4erG3yGFnPFDlBdn3pXSNSYtaO2Lk' }} className="absolute inset-0 w-full h-full" />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']} className="absolute inset-0 p-4 justify-end">
                                    <View className="flex-row justify-between items-end">
                                        <View>
                                            <Text className="text-white font-bold text-lg leading-tight">Visit Kyoto</Text>
                                            <View className="flex-row items-center mt-1">
                                                <MaterialIcons name="place" size={12} color="rgba(255,255,255,0.8)" />
                                                <Text className="text-white/80 text-xs ml-1">450km away</Text>
                                            </View>
                                        </View>
                                        <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center border border-white/30">
                                            <MaterialIcons name="arrow-forward" size={14} color="white" />
                                        </View>
                                    </View>
                                </LinearGradient>
                            </View>

                            {/* Activity 2 */}
                            <View className="w-[240px] h-[160px] relative rounded-2xl overflow-hidden shadow-lg mr-4 bg-gray-200">
                                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-doBLLmuOCfvnJ5Y6yiM1iIR2KpiDCLW5UlcSo8HWhAjyG0-p7EXgNUuA8HO0zn7PK7TG0UDMrZwDmx94MNq8HRRLpI-3zBK40HLECak9Kwoc8omY7v-AeTM3kHQ9TApBJ5lZJbjde1AADY1vEkGMsxW3MyH9XU3c7RB06OLNZVXDhCzma7XxkfST5Qfh0H5XK418TROZ6GBRrrTW0r55LVbD90IbTP4tCvcFK5TODBCPsyBp7r0Zgzgkg6gq4ooGWkOM3HsLEt4' }} className="absolute inset-0 w-full h-full" />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']} className="absolute inset-0 p-4 justify-end">
                                    <View className="flex-row justify-between items-end">
                                        <View>
                                            <Text className="text-white font-bold text-lg leading-tight">Hokkaido Skiing</Text>
                                            <View className="flex-row items-center mt-1">
                                                <MaterialIcons name="place" size={12} color="rgba(255,255,255,0.8)" />
                                                <Text className="text-white/80 text-xs ml-1">890km away</Text>
                                            </View>
                                        </View>
                                        <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center border border-white/30">
                                            <MaterialIcons name="arrow-forward" size={14} color="white" />
                                        </View>
                                    </View>
                                </LinearGradient>
                            </View>

                            {/* Activity 3 */}
                            <View className="w-[240px] h-[160px] relative rounded-2xl overflow-hidden shadow-lg mr-6 bg-gray-200">
                                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN2lHRAjplzGwkhMUdbMXs4lAU3xrcbip_s1VT8BPq4Jn5BRlj_Y4v9OJ6S5LSZ9bkqzlOGEVXrhO-Y-mXRO6g1s47T15sqC6LFgWc7KnjnPzwWEBwa0Om2g7d7w1cux0vRuFH_8OWe8qhWR8o0PzlCxaaKpC5Jx_6afYXtxS02HxoAZ3dk-phmD7Qud-lJktyRIZGoVDVuJ249ZXr8l-pbXs0TRoOyP9yvm833GP5ZIbe2jIpkeQOT7nf4BsvPzB5duRe_PKrNew' }} className="absolute inset-0 w-full h-full" />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']} className="absolute inset-0 p-4 justify-end">
                                    <View className="flex-row justify-between items-end">
                                        <View>
                                            <Text className="text-white font-bold text-lg leading-tight">Osaka Food Tour</Text>
                                            <View className="flex-row items-center mt-1">
                                                <MaterialIcons name="place" size={12} color="rgba(255,255,255,0.8)" />
                                                <Text className="text-white/80 text-xs ml-1">510km away</Text>
                                            </View>
                                        </View>
                                        <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center border border-white/30">
                                            <MaterialIcons name="arrow-forward" size={14} color="white" />
                                        </View>
                                    </View>
                                </LinearGradient>
                            </View>
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}
