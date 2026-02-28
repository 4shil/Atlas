import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../store/useProfileStore';

interface ProfileHeaderProps {
    rightActions?: React.ReactNode;
}

export function ProfileHeader({ rightActions }: ProfileHeaderProps) {
    const { profile } = useProfileStore();
    const router = useRouter();

    return (
        <View className="px-6 mt-4 flex-row justify-between items-center">
            <TouchableOpacity
                className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 shadow-lg"
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/profile');
                }}
            >
                {profile.avatarUri ? (
                    <Image
                        source={{ uri: profile.avatarUri }}
                        className="w-full h-full opacity-90"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-full bg-indigo-950 items-center justify-center">
                        <Text className="text-white font-bold text-sm">
                            {profile.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            {rightActions && <View className="flex-row gap-2">{rightActions}</View>}
        </View>
    );
}
