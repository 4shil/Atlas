import Constants from 'expo-constants';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGoalStore } from '../store/useGoalStore';
import { useProfileStore } from '../store/useProfileStore';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../theme';

interface AccordionItemProps {
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    isDark?: boolean;
}

function AccordionItem({
    title,
    icon,
    children,
    defaultExpanded = false,
    isDark = true,
}: AccordionItemProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const toggle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded(!expanded);
    };

    const iconColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';
    const arrowColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

    return (
        <View className="dark:bg-white/[0.05] bg-black/[0.04] border dark:border-white/[0.08] border-black/[0.08] rounded-2xl mb-4 overflow-hidden">
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggle}
                className="flex-row items-center justify-between p-4"
            >
                <View className="flex-row items-center">
                    <MaterialIcons name={icon} size={22} color={iconColor} />
                    <Text className="dark:text-white text-gray-900 text-base font-semibold ml-3">
                        {title}
                    </Text>
                </View>
                <MaterialIcons
                    name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color={arrowColor}
                />
            </TouchableOpacity>

            {expanded && (
                <View
                    className={`p-4 pt-0 border-t ${isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'} mt-2`}
                >
                    {children}
                </View>
            )}
        </View>
    );
}

export default function SettingsScreen() {
    const router = useRouter();

    const { isDark } = useTheme();

    // Global Settings State
    const {
        darkMode,
        setDarkMode,
        themeMode,
        setThemeMode,
        unitSystem,
        setUnitSystem,
        mapStylePref,
        setMapStylePref,
        defaultCategory,
        setDefaultCategory,
        showCompletedOnMap,
        setShowCompletedOnMap,
        pushNotifications,
        setPushNotifications,
        dailyReminders,
        setDailyReminders,
        notificationSound,
        setNotificationSound,
        locationServices,
        setLocationServices,
        resetSettings,
    } = useSettingsStore();

    const { signOut, session } = useAuthStore();

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Sign out of Atlas?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                    router.replace('/');
                },
            },
        ]);
    };

    // Reset Handlers
    const clearGoals = useGoalStore(state => state.clearGoals);
    const resetProfile = useProfileStore(state => state.resetProfile);

    const handleClearData = () => {
        // Two-step confirmation for safety
        Alert.alert(
            'Clear All Data',
            'This will permanently delete ALL goals, profile data, and settings. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Clear Everything',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Are you absolutely sure?',
                            'All your bucket list goals and travel history will be lost forever.',
                            [
                                { text: 'No, Keep My Data', style: 'cancel' },
                                {
                                    text: 'Delete All',
                                    style: 'destructive',
                                    onPress: () => {
                                        Haptics.notificationAsync(
                                            Haptics.NotificationFeedbackType.Success
                                        );
                                        clearGoals();
                                        resetProfile();
                                        resetSettings();
                                        router.replace('/');
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all data. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (session?.user?.id) {
                                await supabase
                                    .from('goals')
                                    .delete()
                                    .eq('user_id', session.user.id);
                                await supabase.from('profiles').delete().eq('id', session.user.id);
                                await supabase.auth.signOut();
                            }
                            clearGoals();
                            resetProfile();
                            resetSettings();
                            router.replace('/auth');
                        } catch (e) {
                            Alert.alert('Error', 'Could not delete account. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleOpenTerms = () => {
        Linking.openURL('https://github.com/4shil/Atlas/blob/main/TERMS.md').catch(() => {
            Alert.alert('Unable to open link', 'Please try again later.');
        });
    };

    const handleExportGoals = async () => {
        try {
            const { goals } = useGoalStore.getState();
            const json = JSON.stringify(goals, null, 2);
            const path = `${FileSystem.cacheDirectory}atlas-goals-export.json`;
            await FileSystem.writeAsStringAsync(path, json, {
                encoding: FileSystem.EncodingType.UTF8,
            });
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(path, {
                    mimeType: 'application/json',
                    dialogTitle: 'Export Atlas Goals',
                });
            } else {
                Alert.alert('Exported', `Goals saved to: ${path}`);
            }
        } catch (e) {
            Alert.alert('Export Failed', 'Could not export goals. Please try again.');
        }
    };

    const handleOpenPrivacy = () => {
        Linking.openURL('https://github.com/4shil/Atlas/blob/main/PRIVACY.md').catch(() => {
            Alert.alert('Unable to open link', 'Please try again later.');
        });
    };

    return (
        <ScreenWrapper bgClass="dark:bg-black bg-slate-50">
            {/* Header */}
            <View
                className={`px-6 py-4 flex-row items-center border-b ${isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'} mt-12 mb-4`}
            >
                <TouchableOpacity
                    className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 border dark:border-white/[0.08] border-black/[0.08] items-center justify-center mr-4"
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                    }}
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={20}
                        color={isDark ? 'white' : '#111827'}
                    />
                </TouchableOpacity>
                <Text className="dark:text-white text-gray-900 font-semibold text-xl">
                    Settings
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                <AccordionItem
                    title="Preferences"
                    icon="tune"
                    defaultExpanded={true}
                    isDark={isDark}
                >
                    <View className="mb-4 mt-2">
                        <Text className="dark:text-white/70 text-gray-700 text-base mb-2">
                            Theme
                        </Text>
                        <View className="flex-row bg-white/[0.06] rounded-xl p-1 border dark:border-white/[0.08] border-black/[0.08]">
                            {(['dark', 'light', 'system'] as const).map(mode => (
                                <TouchableOpacity
                                    key={mode}
                                    className={`flex-1 py-2 rounded-lg items-center ${themeMode === mode ? 'bg-blue-600' : ''}`}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setThemeMode(mode);
                                    }}
                                >
                                    <Text
                                        className={`text-xs font-bold capitalize ${themeMode === mode ? 'text-white' : 'dark:text-white/40 text-gray-400'}`}
                                    >
                                        {mode}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="dark:text-white/70 text-gray-700 text-base">
                            Unit System
                        </Text>
                        <View className="flex-row bg-white/[0.06] rounded-lg p-1 border dark:border-white/[0.08] border-black/[0.08]">
                            <TouchableOpacity
                                className={`px-3 py-1 rounded-md ${unitSystem === 'metric' ? 'bg-white/15' : ''}`}
                                onPress={() => setUnitSystem('metric')}
                            >
                                <Text
                                    className={`text-xs font-bold ${unitSystem === 'metric' ? 'text-white' : 'dark:text-white/40 text-gray-400'}`}
                                >
                                    Metric
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`px-3 py-1 rounded-md ${unitSystem === 'imperial' ? 'bg-white/15' : ''}`}
                                onPress={() => setUnitSystem('imperial')}
                            >
                                <Text
                                    className={`text-xs font-bold ${unitSystem === 'imperial' ? 'text-white' : 'dark:text-white/40 text-gray-400'}`}
                                >
                                    Imperial
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className="flex-row items-center justify-between mt-4">
                        <Text className="dark:text-white/70 text-gray-700 text-base">
                            Default Map Style
                        </Text>
                        <View className="flex-row bg-white/[0.06] rounded-lg p-1 border dark:border-white/[0.08] border-black/[0.08]">
                            {(['standard', 'satellite'] as const).map(style => (
                                <TouchableOpacity
                                    key={style}
                                    className={`px-3 py-1 rounded-md ${mapStylePref === style ? 'bg-white/15' : ''}`}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setMapStylePref(style);
                                    }}
                                >
                                    <Text
                                        className={`text-xs font-bold capitalize ${mapStylePref === style ? 'text-white' : 'dark:text-white/40 text-gray-400'}`}
                                    >
                                        {style}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </AccordionItem>

                <AccordionItem title="Goals & Map" icon="map" isDark={isDark}>
                    <View className="mt-2 mb-4">
                        <Text className="dark:text-white/70 text-gray-700 text-base mb-2">
                            Default Goal Category
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {['Travel', 'Adventures', 'Foodie', 'Stays', 'Milestone'].map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    className={`px-3 py-1.5 rounded-full border ${defaultCategory === cat ? 'bg-blue-600 border-blue-600' : 'border-white/20'}`}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setDefaultCategory(cat);
                                    }}
                                >
                                    <Text
                                        className={`text-xs font-semibold ${defaultCategory === cat ? 'text-white' : 'dark:text-white/60 text-gray-500'}`}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="dark:text-white/70 text-gray-700 text-base">
                            Show Completed on Map
                        </Text>
                        <Switch
                            value={showCompletedOnMap}
                            onValueChange={setShowCompletedOnMap}
                            trackColor={{
                                false: 'rgba(255,255,255,0.1)',
                                true: 'rgba(96,165,250,0.5)',
                            }}
                            thumbColor="#ffffff"
                        />
                    </View>
                </AccordionItem>

                <AccordionItem title="Notifications" icon="notifications-none" isDark={isDark}>
                    <View className="flex-row items-center justify-between mb-4 mt-2">
                        <Text className="dark:text-white/70 text-gray-700 text-base">
                            Push Notifications
                        </Text>
                        <Switch
                            value={pushNotifications}
                            onValueChange={setPushNotifications}
                            trackColor={{
                                false: 'rgba(255,255,255,0.1)',
                                true: 'rgba(255,255,255,0.3)',
                            }}
                            thumbColor="#ffffff"
                        />
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="dark:text-white/70 text-gray-700 text-base">
                            Daily Reminders
                        </Text>
                        <Switch
                            value={dailyReminders}
                            onValueChange={setDailyReminders}
                            trackColor={{
                                false: 'rgba(255,255,255,0.1)',
                                true: 'rgba(255,255,255,0.3)',
                            }}
                            thumbColor="#ffffff"
                        />
                    </View>
                    <View className="flex-row items-center justify-between mt-4">
                        <Text className="dark:text-white/70 text-gray-700 text-base">
                            Notification Sound
                        </Text>
                        <Switch
                            value={notificationSound}
                            onValueChange={v => {
                                Haptics.selectionAsync();
                                setNotificationSound(v);
                            }}
                            trackColor={{
                                false: 'rgba(255,255,255,0.1)',
                                true: 'rgba(96,165,250,0.5)',
                            }}
                            thumbColor="#ffffff"
                        />
                    </View>
                </AccordionItem>

                <AccordionItem title="Privacy & Security" icon="security" isDark={isDark}>
                    <View className="flex-row items-center justify-between mb-4 mt-2">
                        <Text className="dark:text-white/70 text-gray-700 text-base">
                            Location Services
                        </Text>
                        <Switch
                            value={locationServices}
                            onValueChange={setLocationServices}
                            trackColor={{
                                false: 'rgba(255,255,255,0.1)',
                                true: 'rgba(255,255,255,0.3)',
                            }}
                            thumbColor="#ffffff"
                        />
                    </View>
                    {session ? (
                        <TouchableOpacity
                            className="py-2 border-b border-white/[0.05] mb-2"
                            onPress={handleSignOut}
                        >
                            <Text className="text-red-400 text-sm font-medium">Sign Out</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            className="py-2 border-b border-white/[0.05] mb-2"
                            onPress={() => router.push('/auth')}
                        >
                            <Text className="text-blue-400 text-sm font-medium">
                                Sign In for Cloud Sync
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        className="py-3 flex-row items-center border-b border-white/[0.05] mb-2"
                        onPress={handleExportGoals}
                    >
                        <MaterialIcons name="file-download" size={18} color="#60a5fa" />
                        <Text className="text-blue-400 text-base ml-2">Export Goals as JSON</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="py-2 border-b border-white/[0.05] mb-2"
                        onPress={handleClearData}
                    >
                        <Text className="text-red-400 text-base">Clear All Data</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="py-2" onPress={handleDeleteAccount}>
                        <Text className="text-red-400 text-base">Delete Account</Text>
                    </TouchableOpacity>
                </AccordionItem>

                <AccordionItem title="About Atlas" icon="info-outline" isDark={isDark}>
                    <View className="items-center py-4">
                        <View className="w-16 h-16 bg-white/15 rounded-2xl items-center justify-center mb-3 border dark:border-white/10 border-black/10">
                            <MaterialIcons name="explore" size={32} color="#60a5fa" />
                        </View>
                        <Text className="dark:text-white text-gray-900 font-bold text-lg">
                            Atlas Planner
                        </Text>
                        <Text className="dark:text-white/40 text-gray-400 text-sm mb-2">
                            Version 1.0.0
                        </Text>
                        <Text className="dark:text-white/30 text-gray-400 text-xs mb-4 text-center">
                            Your personal bucket list & travel goal tracker
                        </Text>

                        <View className="w-full gap-2 border-t border-white/[0.06] pt-4 mt-2">
                            {[
                                {
                                    label: 'GitHub Repository',
                                    url: 'https://github.com/4shil/Atlas',
                                    icon: 'code',
                                },
                                {
                                    label: 'Privacy Policy',
                                    url: 'https://github.com/4shil/Atlas/blob/main/PRIVACY.md',
                                    icon: 'privacy-tip',
                                },
                                {
                                    label: 'Terms of Service',
                                    url: 'https://github.com/4shil/Atlas/blob/main/TERMS.md',
                                    icon: 'gavel',
                                },
                            ].map(({ label, url, icon }) => (
                                <TouchableOpacity
                                    key={label}
                                    className="flex-row items-center py-3 border-b border-white/[0.04]"
                                    onPress={() =>
                                        Linking.openURL(url).catch(() =>
                                            Alert.alert('Cannot open URL')
                                        )
                                    }
                                >
                                    <MaterialIcons name={icon as any} size={18} color="#60a5fa" />
                                    <Text className="text-blue-400 text-sm font-medium ml-3 flex-1">
                                        {label}
                                    </Text>
                                    <MaterialIcons
                                        name="open-in-new"
                                        size={14}
                                        color="rgba(96,165,250,0.5)"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </AccordionItem>

                <Text
                    style={{
                        color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                        textAlign: 'center',
                        fontSize: 12,
                        marginBottom: 16,
                    }}
                >
                    Atlas v{Constants.expoConfig?.version ?? '1.0.0'}
                </Text>
            </ScrollView>
        </ScreenWrapper>
    );
}
