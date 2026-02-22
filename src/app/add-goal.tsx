import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useGoalStore } from '../store/useGoalStore';

export default function AddGoal() {
    const router = useRouter();
    const { addGoal } = useGoalStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Travel');
    const [locationInput, setLocationInput] = useState('');

    const categories = ['Travel', 'Adventures', 'Foodie', 'Stays', 'Milestone'];

    const handleSave = () => {
        if (!title.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        // Mock coordinates handling
        const locationParts = locationInput.split(',').map(s => s.trim());
        const city = locationParts[0] || 'Unknown City';
        const country = locationParts[1] || 'Unknown Country';

        addGoal({
            title,
            description,
            category,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt3pWIbvV8Y9AGyrrFl4WY8qE7xnILeTfQ9cu-6hC0Qb9y1Rb2p5qo19cTS64uLvuNMhRI_LOwDLRl2sZm50Iw_l0R5fubyez_XA1XJfcm1TwMBYEh1MYtcv3xw4CqTkWcRZNu7GT0dtjAPuAX6AbzpuNrO5LRrS-w2Rwh5Ca3Gj2GQFSNAVmp7nN74PMQlI_HSAQVkvngoVjvbGSnRp6JDqCPZ-F93eQYJ8d98y580Yw4dL4erG3yGFnPFDlBdn3pXSNSYtaO2Lk', // Mock generic placeholder image
            timelineDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(), // Defaults to 1 month from now
            notes: '',
            location: {
                latitude: 0,
                longitude: 0,
                city,
                country
            }
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
            <StatusBar style="light" />

            <View className="px-6 py-4 flex-row justify-between items-center border-b border-white/10 relative z-20">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
                    activeOpacity={0.7}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                >
                    <MaterialIcons name="close" size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-semibold text-lg">New Adventure</Text>
                <TouchableOpacity
                    className={`px-4 py-2 rounded-full ${title.trim() ? 'bg-blue-600' : 'bg-gray-800'}`}
                    activeOpacity={0.7}
                    onPress={handleSave}
                    disabled={!title.trim()}
                    accessibilityRole="button"
                    accessibilityLabel="Save adventure"
                >
                    <Text className={`font-medium ${title.trim() ? 'text-white' : 'text-gray-500'}`}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
                <View className="mb-8">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Title</Text>
                    <TextInput
                        className="text-white text-3xl font-bold border-b border-white/20 pb-2"
                        placeholder="e.g. Ski in Niseko"
                        placeholderTextColor="#4b5563"
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible px-1 -mx-1">
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                className={`px-5 py-2.5 rounded-full flex-row items-center mr-3 border ${category === cat ? 'bg-blue-600 border-blue-500' : 'bg-black/60 border-white/10'}`}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setCategory(cat);
                                }}
                            >
                                <Text className={`text-xs font-medium ${category === cat ? 'text-white' : 'text-gray-300'}`}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View className="mb-8">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Description</Text>
                    <TextInput
                        className="text-white text-base bg-white/5 rounded-2xl p-4 border border-white/10"
                        placeholder="What do you want to experience?"
                        placeholderTextColor="#4b5563"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Location (City, Country)</Text>
                    <View className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4">
                        <MaterialIcons name="place" size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 text-white text-base p-4"
                            placeholder="e.g. Hokkaido, Japan"
                            placeholderTextColor="#4b5563"
                            value={locationInput}
                            onChangeText={setLocationInput}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
