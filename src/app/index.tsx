import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
    const router = useRouter();

    const pages = [
        { title: 'Dashboard (Light)', route: '/dashboard' },
        { title: 'Travel Gallery (Light)', route: '/gallery' },
        { title: 'Adventure Map (Light)', route: '/map' },
        { title: 'Inspiration (Light)', route: '/inspiration' },
        { title: 'Dashboard (Dark)', route: '/dark-dashboard' },
        { title: 'Travel Gallery (Dark)', route: '/dark-gallery' },
        { title: 'Adventure Map (Dark)', route: '/dark-map' },
        { title: 'Inspiration (Dark)', route: '/dark-inspiration' },
    ];

    return (
        <ScrollView className="flex-1 bg-gray-100 p-6">
            <Text className="text-3xl font-bold mb-6 text-gray-900 pt-10">Stitch to Expo</Text>
            <Text className="text-gray-600 mb-8">Select one of the 8 generated screens below:</Text>

            <View className="flex-col gap-4">
                {pages.map((page, index) => (
                    <TouchableOpacity
                        key={index}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 active:bg-gray-50 flex-row items-center justify-between"
                        onPress={() => router.push(page.route as any)}
                    >
                        <Text className="text-lg font-medium text-gray-800">{1 + index}. {page.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}
