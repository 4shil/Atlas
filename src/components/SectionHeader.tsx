import React from 'react';
import { View, Text } from 'react-native';

interface SectionHeaderProps {
    overline: string;
    title: string;
    description?: React.ReactNode;
}

export function SectionHeader({ overline, title, description }: SectionHeaderProps) {
    return (
        <View className="px-6 items-center flex-col my-8">
            <Text className="text-xs font-medium text-gray-400 mb-2 tracking-[0.2em] uppercase">
                {overline}
            </Text>
            <Text className="text-3xl font-light text-white tracking-tight text-center leading-tight">
                {title}
            </Text>
            {description && (
                <View className="mt-3">
                    {description}
                </View>
            )}
        </View>
    );
}
