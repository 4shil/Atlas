import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function DarkInspiration() {
    return (
        <SafeAreaView className="flex-1 bg-black relative" edges={['top', 'bottom']}>
            <StatusBar style="light" />

            {/* Approximated Radial Gradients from Stitch code using Absolute Views */}
            <View className="absolute inset-0 z-0 overflow-hidden" pointerEvents="none">
                <View className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-indigo-900 rounded-full opacity-30" />
                <View className="absolute top-[10%] right-[10%] w-[250px] h-[250px] bg-red-900 rounded-full opacity-20" />
                <View className="absolute bottom-[20%] left-[30%] w-[350px] h-[350px] bg-blue-900 rounded-full opacity-20" />
            </View>

            <ScrollView className="flex-1 z-10 pt-4" showsVerticalScrollIndicator={false}>

                {/* Header section (Menu, Likes, Settings) */}
                <View className="px-6 flex-row justify-between items-center mb-6">
                    <TouchableOpacity className="w-10 h-10 rounded-full bg-black/60 border border-white/10 active:bg-white/10 flex items-center justify-center">
                        <MaterialIcons name="menu" size={20} color="white" />
                    </TouchableOpacity>
                    <View className="bg-black/60 border border-white/10 px-4 py-1.5 rounded-full flex-row items-center space-x-2">
                        <MaterialIcons name="favorite" size={14} color="#f87171" />
                        <Text className="text-xs font-medium text-white/90 ml-1.5">2.390 Like</Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 rounded-full bg-black/60 border border-white/10 active:bg-white/10 flex items-center justify-center">
                        <MaterialIcons name="settings" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Hero Section */}
                <View className="px-6 items-center mt-12 mb-10 text-center">
                    <Text className="text-gray-400 text-sm mb-3 font-medium uppercase tracking-wider text-center">Discovery for you</Text>
                    <Text className="text-4xl font-bold text-white mb-10 tracking-tight leading-tight text-center">
                        Chase Your{"\n"}Dreams
                    </Text>

                    <TouchableOpacity className="bg-[#0a0a0a] border border-white/10 shadow-lg px-6 py-3.5 rounded-full flex-row items-center active:scale-95 mb-12">
                        <MaterialIcons name="map" size={18} color="white" />
                        <Text className="text-sm font-semibold text-white ml-2">Explore Map</Text>
                    </TouchableOpacity>

                    {/* Categories */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible px-2 -mx-2">
                        {/* Travel */}
                        <TouchableOpacity className="bg-black/60 border border-white/10 px-5 py-2.5 rounded-full flex-row items-center mr-3 active:bg-white/10">
                            <MaterialIcons name="flight" size={16} color="white" />
                            <Text className="text-xs font-medium text-gray-200 ml-2 whitespace-nowrap">Travel</Text>
                        </TouchableOpacity>

                        {/* Adventures */}
                        <TouchableOpacity className="bg-black/60 border border-white/10 px-5 py-2.5 rounded-full flex-row items-center mr-3 active:bg-white/10">
                            <MaterialIcons name="hiking" size={16} color="white" />
                            <Text className="text-xs font-medium text-gray-200 ml-2 whitespace-nowrap">Adventures</Text>
                        </TouchableOpacity>

                        {/* Foodie */}
                        <TouchableOpacity className="bg-black/60 border border-white/10 px-5 py-2.5 rounded-full flex-row items-center mr-3 active:bg-white/10">
                            <MaterialIcons name="restaurant" size={16} color="white" />
                            <Text className="text-xs font-medium text-gray-200 ml-2 whitespace-nowrap">Foodie</Text>
                        </TouchableOpacity>

                        {/* Stays */}
                        <TouchableOpacity className="bg-black/60 border border-white/10 px-5 py-2.5 rounded-full flex-row items-center active:bg-white/10">
                            <MaterialIcons name="hotel" size={16} color="white" />
                            <Text className="text-xs font-medium text-gray-200 ml-2 whitespace-nowrap">Stays</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Trending Goals */}
                <View className="px-6 pb-20">
                    <View className="flex-row items-center justify-between mb-5">
                        <Text className="text-lg font-semibold text-white">Trending Goals</Text>
                        <Text className="text-xs text-gray-400">View all</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible pb-6 -mx-6 px-6 relative" snapToInterval={192} decelerationRate="fast">

                        {/* Card 1: Visit Tokyo */}
                        <View className="w-48 h-64 rounded-[32px] p-5 relative overflow-hidden mr-4 bg-gray-900 border border-white/10">
                            <LinearGradient colors={['rgba(127,29,29,0.4)', 'rgba(0,0,0,0.8)', 'transparent']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} className="absolute inset-0 z-0" />

                            <View className="relative z-20 h-full flex-col justify-between">
                                <View className="w-11 h-11 rounded-full bg-black/40 border border-white/10 items-center justify-center">
                                    <MaterialIcons name="ramen-dining" size={24} color="#f87171" />
                                </View>
                                <View>
                                    <Text className="text-2xl font-bold text-white leading-tight mb-1">Visit{"\n"}Tokyo</Text>
                                    <View className="flex-row flex-wrap mt-2">
                                        <View className="px-2 py-0.5 rounded-md bg-white/10 border border-white/5 mr-2 mb-1">
                                            <Text className="text-[10px] text-gray-300">Culture</Text>
                                        </View>
                                        <View className="px-2 py-0.5 rounded-md bg-white/10 border border-white/5 mb-1">
                                            <Text className="text-[10px] text-gray-300">Food</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Card 2: Northern Lights */}
                        <View className="w-48 h-64 rounded-[32px] p-5 relative overflow-hidden mr-4 bg-gray-900 border border-white/10">
                            <LinearGradient colors={['rgba(19,78,74,0.4)', 'rgba(0,0,0,0.8)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="absolute inset-0 z-0" />


                            <View className="relative z-20 h-full flex-col justify-between">
                                <View className="w-11 h-11 rounded-full bg-black/40 border border-white/10 items-center justify-center">
                                    <MaterialIcons name="auto-awesome" size={24} color="#2dd4bf" />
                                </View>
                                <View>
                                    <Text className="text-2xl font-bold text-white leading-tight mb-1">Northern{"\n"}Lights</Text>
                                    <View className="flex-row flex-wrap mt-2">
                                        <View className="px-2 py-0.5 rounded-md bg-white/10 border border-white/5 mr-2 mb-1">
                                            <Text className="text-[10px] text-gray-300">Nature</Text>
                                        </View>
                                        <View className="px-2 py-0.5 rounded-md bg-white/10 border border-white/5 mb-1">
                                            <Text className="text-[10px] text-gray-300">Cold</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Card 3: Paris Trip (opacity 40%) */}
                        <View className="w-48 h-64 rounded-[32px] p-5 relative overflow-hidden mr-4 bg-gray-900 opacity-40 border border-white/5">
                            <View className="relative z-20 h-full flex-col justify-between">
                                <View className="w-11 h-11 rounded-full bg-white/5 items-center justify-center">
                                    <MaterialIcons name="local-cafe" size={24} color="#6b7280" />
                                </View>
                                <View>
                                    <Text className="text-2xl font-bold text-gray-500 leading-tight mb-1">Paris{"\n"}Trip</Text>
                                </View>
                            </View>
                        </View>

                    </ScrollView>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
