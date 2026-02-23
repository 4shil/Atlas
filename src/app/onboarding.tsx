import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, Dimensions, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useProfileStore } from '../store/useProfileStore';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: 'welcome',
        emoji: '🌍',
        title: 'Your Bucket List,\nBeautifully Organised',
        subtitle: 'Atlas helps you dream big, plan adventures, and track every milestone — all in one place.',
        gradient: ['#0f172a', '#1e3a5f', '#0f172a'] as const,
        accent: '#3b82f6',
    },
    {
        id: 'name',
        emoji: '👋',
        title: "What should we\ncall you?",
        subtitle: 'Set your name and a profile photo to personalise your experience.',
        gradient: ['#0f172a', '#1e1b4b', '#0f172a'] as const,
        accent: '#8b5cf6',
    },
    {
        id: 'ready',
        emoji: '🚀',
        title: "You're all set!",
        subtitle: 'Start by adding your first bucket list goal, or browse the Inspiration feed.',
        gradient: ['#0f172a', '#064e3b', '#0f172a'] as const,
        accent: '#10b981',
    },
];

export default function Onboarding() {
    const router = useRouter();
    const { updateProfile, setHasOnboarded } = useProfileStore();
    const scrollRef = useRef<ScrollView>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [name, setName] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    const pickAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const goToSlide = (index: number) => {
        scrollRef.current?.scrollTo({ x: index * width, animated: true });
        setCurrentSlide(index);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleNext = () => {
        if (currentSlide === SLIDES.length - 1) {
            handleFinish();
        } else {
            goToSlide(currentSlide + 1);
        }
    };

    const handleFinish = () => {
        const savedName = name.trim() || 'Traveller';
        updateProfile({ name: savedName, avatarUri });
        setHasOnboarded();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
    };

    const slide = SLIDES[currentSlide];

    return (
        <View className="flex-1 bg-[#0f172a]">
            <StatusBar style="light" />

            {/* Full-screen background gradient that updates per slide */}
            <LinearGradient
                colors={slide.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute inset-0"
            />

            {/* Decorative orbs */}
            <View
                className="absolute w-80 h-80 rounded-full opacity-20"
                style={{ backgroundColor: slide.accent, top: -80, right: -80 }}
            />
            <View
                className="absolute w-60 h-60 rounded-full opacity-10"
                style={{ backgroundColor: slide.accent, bottom: 100, left: -60 }}
            />

            <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                {/* Skip */}
                {currentSlide < SLIDES.length - 1 && (
                    <TouchableOpacity className="absolute top-14 right-6 z-20" onPress={handleFinish}>
                        <Text className="text-gray-400 text-sm font-medium">Skip</Text>
                    </TouchableOpacity>
                )}

                {/* Scrollable slides */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                    className="flex-1"
                >
                    {/* Slide 1: Welcome */}
                    <View style={{ width }} className="flex-1 items-center justify-center px-8">
                        <Animated.View entering={FadeInDown.delay(100).duration(600)} className="items-center">
                            <Text style={{ fontSize: 80 }}>{SLIDES[0].emoji}</Text>
                            <Text className="text-4xl font-bold text-white text-center mt-8 leading-tight">
                                {SLIDES[0].title}
                            </Text>
                            <Text className="text-gray-400 text-base text-center mt-4 leading-7">
                                {SLIDES[0].subtitle}
                            </Text>
                        </Animated.View>

                        {/* Feature pills */}
                        <Animated.View entering={FadeInUp.delay(400).duration(600)} className="mt-10 gap-3 w-full">
                            {[
                                { icon: 'map', label: 'Track goals on a live map' },
                                { icon: 'photo-library', label: 'Beautiful photo gallery' },
                                { icon: 'notifications', label: 'Smart reminders' },
                            ].map(f => (
                                <View key={f.icon} className="flex-row items-center bg-white/5 border border-white/8 rounded-2xl px-5 py-4">
                                    <MaterialIcons name={f.icon as any} size={20} color={SLIDES[0].accent} />
                                    <Text className="text-gray-200 text-sm ml-3 font-medium">{f.label}</Text>
                                </View>
                            ))}
                        </Animated.View>
                    </View>

                    {/* Slide 2: Name & Avatar Setup */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ width }}
                    >
                        <View className="flex-1 items-center justify-center px-8">
                            <Text style={{ fontSize: 72 }} className="mb-6">{SLIDES[1].emoji}</Text>
                            <Text className="text-4xl font-bold text-white text-center leading-tight mb-3">
                                {SLIDES[1].title}
                            </Text>
                            <Text className="text-gray-400 text-base text-center leading-7 mb-10">
                                {SLIDES[1].subtitle}
                            </Text>

                            {/* Avatar Picker */}
                            <TouchableOpacity onPress={pickAvatar} className="mb-8 relative">
                                <View className="w-24 h-24 rounded-full border-4 border-purple-500/40 overflow-hidden bg-indigo-950 items-center justify-center">
                                    {avatarUri ? (
                                        <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
                                    ) : (
                                        <MaterialIcons name="person" size={48} color="#6b7280" />
                                    )}
                                </View>
                                <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 items-center justify-center border-2 border-[#0f172a]">
                                    <MaterialIcons name="photo-camera" size={14} color="white" />
                                </View>
                            </TouchableOpacity>

                            {/* Name Input */}
                            <View className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex-row items-center">
                                <MaterialIcons name="person-outline" size={20} color="#6b7280" />
                                <TextInput
                                    className="flex-1 text-white text-base ml-3"
                                    placeholder="Your first name..."
                                    placeholderTextColor="#4b5563"
                                    value={name}
                                    onChangeText={setName}
                                    returnKeyType="done"
                                    autoCorrect={false}
                                    maxLength={30}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>

                    {/* Slide 3: Ready */}
                    <View style={{ width }} className="flex-1 items-center justify-center px-8">
                        <Text style={{ fontSize: 80 }} className="mb-6">{SLIDES[2].emoji}</Text>
                        <Text className="text-4xl font-bold text-white text-center leading-tight mb-3">
                            {SLIDES[2].title}
                        </Text>
                        <Text className="text-gray-400 text-base text-center leading-7 mb-10">
                            {SLIDES[2].subtitle}
                        </Text>

                        <View className="w-full gap-3">
                            {[
                                { icon: 'add-circle-outline', label: 'Add your first goal', color: '#10b981' },
                                { icon: 'lightbulb-outline', label: 'Browse Inspiration feed', color: '#f59e0b' },
                                { icon: 'map', label: 'Explore the world map', color: '#3b82f6' },
                            ].map(a => (
                                <View key={a.icon} className="flex-row items-center bg-white/5 border border-white/8 rounded-2xl px-5 py-4">
                                    <MaterialIcons name={a.icon as any} size={20} color={a.color} />
                                    <Text className="text-gray-200 text-sm ml-3 font-medium">{a.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom controls */}
                <View className="px-8 pb-8">
                    {/* Dot indicators */}
                    <View className="flex-row justify-center gap-2 mb-8">
                        {SLIDES.map((_, i) => (
                            <TouchableOpacity key={i} onPress={() => goToSlide(i)}>
                                <View
                                    style={{
                                        width: i === currentSlide ? 24 : 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: i === currentSlide ? slide.accent : 'rgba(255,255,255,0.2)',
                                    }}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* CTA button */}
                    <TouchableOpacity
                        className="w-full py-4 rounded-2xl flex-row items-center justify-center"
                        style={{ backgroundColor: slide.accent }}
                        onPress={handleNext}
                        activeOpacity={0.85}
                    >
                        <Text className="text-white font-bold text-base mr-2">
                            {currentSlide === SLIDES.length - 1 ? "Let's Go! 🌍" : 'Continue'}
                        </Text>
                        {currentSlide < SLIDES.length - 1 && (
                            <MaterialIcons name="arrow-forward" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
