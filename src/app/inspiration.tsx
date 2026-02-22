import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function InspirationLight() {
    return (
        <SafeAreaView className="flex-1 bg-[#FDFDFD] relative" edges={['top', 'bottom']}>
            <StatusBar style="dark" />

            {/* Approximated Radial Gradients from Stitch code using LinearGradient */}
            <View className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                <LinearGradient
                    colors={['#e0ccfa', '#ffdcd2', '#d2f0ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0"
                />
            </View>

            <ScrollView className="flex-1 z-10 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Header section (Menu, Likes, Settings) */}
                <View className="px-6 flex-row justify-between items-center mb-6">
                    <TouchableOpacity
                        className="p-2 rounded-full bg-white/40 border border-white/40 flex items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Open menu"
                    >
                        <MaterialIcons name="menu" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <View className="bg-white/40 border border-white/40 px-4 py-1.5 rounded-full flex-row items-center space-x-2">
                        <MaterialIcons name="favorite" size={14} color="#1f2937" />
                        <Text className="text-xs font-semibold text-gray-800 ml-1">2.390 Like</Text>
                    </View>
                    <TouchableOpacity
                        className="p-2 rounded-full bg-white/40 border border-white/40 flex items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        accessibilityRole="button"
                        accessibilityLabel="Settings"
                    >
                        <MaterialIcons name="settings" size={24} color="#1f2937" />
                    </TouchableOpacity>
                </View>

                {/* Hero Section */}
                <View className="px-6 items-center mt-8 mb-10">
                    <Text className="text-gray-500 text-sm mb-2 font-medium">Discovery for you</Text>
                    <Text className="text-4xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
                        Chase Your Dreams
                    </Text>

                    <TouchableOpacity
                        className="bg-white shadow-lg px-5 py-3 rounded-full flex-row items-center border border-gray-100 mb-8"
                        activeOpacity={0.7}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                        accessibilityRole="button"
                        accessibilityLabel="Explore map"
                    >
                        <MaterialIcons name="map" size={18} color="#111827" />
                        <Text className="text-sm font-semibold text-gray-900 ml-2">Explore Map</Text>
                    </TouchableOpacity>

                    {/* Categories */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible px-2 -mx-2">
                        {/* Travel */}
                        <TouchableOpacity className="bg-white shadow-sm px-4 py-2 rounded-full flex-row items-center mr-3 border border-gray-100">
                            <MaterialIcons name="flight" size={16} color="#111827" />
                            <Text className="text-xs font-semibold text-gray-700 ml-2 whitespace-nowrap">Travel</Text>
                        </TouchableOpacity>

                        {/* Adventures */}
                        <TouchableOpacity className="bg-white/60 px-4 py-2 rounded-full flex-row items-center mr-3 border border-white/40">
                            <MaterialIcons name="hiking" size={16} color="#111827" />
                            <Text className="text-xs font-semibold text-gray-700 ml-2 whitespace-nowrap">Adventures</Text>
                        </TouchableOpacity>

                        {/* Foodie */}
                        <TouchableOpacity className="bg-white/60 px-4 py-2 rounded-full flex-row items-center border border-white/40">
                            <MaterialIcons name="restaurant" size={16} color="#111827" />
                            <Text className="text-xs font-semibold text-gray-700 ml-2 whitespace-nowrap">Foodie</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Trending Goals */}
                <View className="px-6 pb-20">
                    <Text className="text-base font-semibold text-gray-800 mb-4">Trending Goals</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible pb-6 -mx-6 px-6 relative" snapToInterval={192} decelerationRate="fast" contentContainerStyle={{ paddingRight: 32 }}>

                        {/* Card 1: Visit Tokyo */}
                        <View className="w-44 h-56 rounded-[24px] p-5 relative overflow-hidden mr-4">
                            <LinearGradient colors={['rgba(255,edd,cc,0.8)', 'rgba(255,255,255,0.4)']} className="absolute inset-0 border border-white/40" />

                            <View className="absolute -top-10 -right-10 w-32 h-32 bg-orange-300/30 rounded-full opacity-60" />

                            <View className="relative z-10 h-full flex-col justify-between">
                                <View className="w-10 h-10 rounded-full bg-white/40 items-center justify-center">
                                    <MaterialIcons name="ramen-dining" size={24} color="#fb923c" />
                                </View>
                                <View>
                                    <Text className="text-2xl font-medium text-gray-800 leading-tight mb-1">Visit Tokyo</Text>
                                    <Text className="text-xs text-gray-500 mt-1">Culture</Text>
                                </View>
                            </View>
                        </View>

                        {/* Card 2: Northern Lights */}
                        <View className="w-44 h-56 rounded-[24px] p-5 relative overflow-hidden mr-4">
                            <LinearGradient colors={['rgba(204,251,241,0.8)', 'rgba(255,255,255,0.4)']} className="absolute inset-0 border border-white/40" />

                            <View className="absolute -bottom-5 -right-5 w-24 h-24 bg-cyan-300/30 rounded-full opacity-60" />

                            <View className="relative z-10 h-full flex-col justify-between">
                                <View className="w-10 h-10 rounded-full bg-white/40 items-center justify-center">
                                    <MaterialIcons name="auto-awesome" size={24} color="#22d3ee" />
                                </View>
                                <View>
                                    <Text className="text-2xl font-medium text-gray-800 leading-tight mb-1">Northern Lights</Text>
                                    <Text className="text-xs text-gray-500 mt-1">Nature</Text>
                                </View>
                            </View>
                        </View>

                    </ScrollView>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
