import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../store/useProfileStore';
import Animated, {
    SharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';

interface ProfileHeaderProps {
    rightActions?: React.ReactNode;
    scrollY?: SharedValue<number>;
}

export function ProfileHeader({ rightActions, scrollY }: ProfileHeaderProps) {
    const { profile } = useProfileStore();
    const router = useRouter();

    const animatedStyle = useAnimatedStyle(() => {
        if (!scrollY) return {};

        const opacity = interpolate(scrollY.value, [0, 60], [1, 0], Extrapolation.CLAMP);

        const scale = interpolate(scrollY.value, [0, 60], [1, 0.8], Extrapolation.CLAMP);

        const translateY = interpolate(scrollY.value, [0, 60], [0, -20], Extrapolation.CLAMP);

        const height = interpolate(scrollY.value, [0, 60], [56, 0], Extrapolation.CLAMP);
        const marginBottom = interpolate(scrollY.value, [0, 60], [16, 0], Extrapolation.CLAMP);

        return {
            opacity,
            height,
            marginBottom,
            transform: [{ scale }, { translateY }],
        };
    });

    return (
        <Animated.View
            className="px-6 mt-4 flex-row justify-between items-center z-50 overflow-hidden"
            style={animatedStyle}
        >
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
        </Animated.View>
    );
}
