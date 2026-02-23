import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Switch, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGoalStore } from '../store/useGoalStore';
import { useProfileStore } from '../store/useProfileStore';

interface AccordionItemProps {
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

function AccordionItem({ title, icon, children, defaultExpanded = false }: AccordionItemProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const toggle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded(!expanded);
    };

    return (
        <View className="bg-white/5 border border-white/10 rounded-2xl mb-4 overflow-hidden">
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggle}
                className="flex-row items-center justify-between p-4"
            >
                <View className="flex-row items-center">
                    <MaterialIcons name={icon} size={22} color="#60a5fa" />
                    <Text className="text-white text-base font-semibold ml-3">{title}</Text>
                </View>
                <MaterialIcons
                    name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={24}
                    color="#9ca3af"
                />
            </TouchableOpacity>

            {expanded && (
                <View className="p-4 pt-0 border-t border-white/10 mt-2">
                    {children}
                </View>
            )}
        </View>
    );
}

export default function SettingsScreen() {
    const router = useRouter();

    // Global Settings State
    const {
        darkMode, setDarkMode,
        unitSystem, setUnitSystem,
        pushNotifications, setPushNotifications,
        dailyReminders, setDailyReminders,
        locationServices, setLocationServices,
        resetSettings
    } = useSettingsStore();

    // Reset Handlers
    const clearGoals = useGoalStore(state => state.clearGoals);
    const resetProfile = useProfileStore(state => state.resetProfile);

    const handleClearData = () => {
        Alert.alert(
            "Clear App Data",
            "Are you sure you want to permanently delete all goals, profile settings, and app data? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete All",
                    style: "destructive",
                    onPress: () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        clearGoals();
                        resetProfile();
                        resetSettings();
                        router.replace('/');
                    }
                }
            ]
        );
    };

    return (
        <ScreenWrapper bgClass="bg-black">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-white/10 mt-12 mb-4">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center mr-4"
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
                >
                    <MaterialIcons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-semibold text-xl">Settings</Text>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                <AccordionItem title="Preferences" icon="tune" defaultExpanded={true}>
                    <View className="flex-row items-center justify-between mb-4 mt-2">
                        <Text className="text-gray-300 text-base">Dark Mode</Text>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: '#374151', true: '#3b82f6' }}
                            thumbColor="#ffffff"
                        />
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-300 text-base">Unit System</Text>
                        <View className="flex-row bg-black/40 rounded-lg p-1 border border-white/10">
                            <TouchableOpacity
                                className={`px-3 py-1 rounded-md ${unitSystem === 'metric' ? 'bg-blue-600' : ''}`}
                                onPress={() => setUnitSystem('metric')}
                            >
                                <Text className={`text-xs font-bold ${unitSystem === 'metric' ? 'text-white' : 'text-gray-400'}`}>Metric</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`px-3 py-1 rounded-md ${unitSystem === 'imperial' ? 'bg-blue-600' : ''}`}
                                onPress={() => setUnitSystem('imperial')}
                            >
                                <Text className={`text-xs font-bold ${unitSystem === 'imperial' ? 'text-white' : 'text-gray-400'}`}>Imperial</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </AccordionItem>

                <AccordionItem title="Notifications" icon="notifications-none">
                    <View className="flex-row items-center justify-between mb-4 mt-2">
                        <Text className="text-gray-300 text-base">Push Notifications</Text>
                        <Switch
                            value={pushNotifications}
                            onValueChange={setPushNotifications}
                            trackColor={{ false: '#374151', true: '#3b82f6' }}
                            thumbColor="#ffffff"
                        />
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-300 text-base">Daily Reminders</Text>
                        <Switch
                            value={dailyReminders}
                            onValueChange={setDailyReminders}
                            trackColor={{ false: '#374151', true: '#3b82f6' }}
                            thumbColor="#ffffff"
                        />
                    </View>
                </AccordionItem>

                <AccordionItem title="Privacy & Security" icon="security">
                    <View className="flex-row items-center justify-between mb-4 mt-2">
                        <Text className="text-gray-300 text-base">Location Services</Text>
                        <Switch
                            value={locationServices}
                            onValueChange={setLocationServices}
                            trackColor={{ false: '#374151', true: '#3b82f6' }}
                            thumbColor="#ffffff"
                        />
                    </View>
                    <TouchableOpacity className="py-2 border-b border-white/5 mb-2" onPress={handleClearData}>
                        <Text className="text-blue-400 text-base">Clear App Data</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="py-2" onPress={handleClearData}>
                        <Text className="text-red-400 text-base">Delete Account</Text>
                    </TouchableOpacity>
                </AccordionItem>

                <AccordionItem title="About Atlas" icon="info-outline">
                    <View className="items-center py-4">
                        <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-3">
                            <MaterialIcons name="explore" size={32} color="white" />
                        </View>
                        <Text className="text-white font-bold text-lg">Atlas Planner</Text>
                        <Text className="text-gray-400 text-sm mb-4">Version 1.0.0</Text>

                        <View className="w-full flex-row justify-between border-t border-white/10 pt-4 mt-2">
                            <Text className="text-blue-400">Terms of Service</Text>
                            <Text className="text-blue-400">Privacy Policy</Text>
                        </View>
                    </View>
                </AccordionItem>
            </ScrollView>
        </ScreenWrapper>
    );
}
