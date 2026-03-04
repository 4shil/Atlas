import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Image,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { useProfileStore } from '../store/useProfileStore';
import { useGoalStore } from '../store/useGoalStore';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { track } from '../lib/analytics';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: 'dreams',
        emoji: '🌍',
        title: 'Track your\ndreams',
        subtitle:
            'Atlas helps you dream big, plan adventures, and celebrate every milestone — beautifully organised.',
        accent: '#3b82f6',
        gradient: ['#0f172a', '#1e3a5f', '#0f172a'] as const,
        features: [
            { icon: 'flag' as const, label: 'Set goals with target dates' },
            { icon: 'photo-library' as const, label: 'Beautiful photo gallery' },
            { icon: 'notifications' as const, label: 'Smart deadline reminders' },
        ],
    },
    {
        id: 'map',
        emoji: '🗺️',
        title: 'Pin them\non the map',
        subtitle:
            'Every goal becomes a pin on your personal world map. Watch your adventures unfold.',
        accent: '#8b5cf6',
        gradient: ['#0f172a', '#1e1b4b', '#0f172a'] as const,
        features: [
            { icon: 'explore' as const, label: 'Interactive world map' },
            { icon: 'place' as const, label: 'Goals linked to real places' },
            { icon: 'bar-chart' as const, label: 'Track countries visited' },
        ],
    },
    {
        id: 'motivation',
        emoji: '🚀',
        title: 'Never\ngive up',
        subtitle:
            'Streaks, progress stats, and celebration moments keep you motivated every single day.',
        accent: '#10b981',
        gradient: ['#0f172a', '#064e3b', '#0f172a'] as const,
        features: [
            { icon: 'local-fire-department' as const, label: 'Daily streak tracker' },
            { icon: 'emoji-events' as const, label: 'Celebrate completions' },
            { icon: 'group' as const, label: 'Share with friends' },
        ],
    },
];

export default function Onboarding() {
    const router = useRouter();
    const { updateProfile, setHasOnboarded } = useProfileStore();
    const { addGoal } = useGoalStore();
    const scrollRef = useRef<ScrollView>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showSetup, setShowSetup] = useState(false);
    const [name, setName] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    // Dot animation values
    const dotProgress = useSharedValue(0);

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
        dotProgress.value = withSpring(index);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            goToSlide(currentSlide + 1);
        } else {
            // After 3 slides, show profile setup
            setShowSetup(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    };

    const handleSkip = () => {
        setShowSetup(true);
    };

    const handleFinish = async () => {
        const savedName = name.trim() || 'Traveller';
        updateProfile({ name: savedName, avatarUri });
        setHasOnboarded();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        track('onboarding_completed', { hasName: !!name.trim(), hasAvatar: !!avatarUri });
        router.replace('/(tabs)');
    };

    const slide = SLIDES[currentSlide];

    if (showSetup) {
        return (
            <ScreenWrapper bgClass="bg-[#0f172a]" edges={[]}>
                <LinearGradient
                    colors={['#0f172a', '#1e1b4b', '#0f172a']}
                    style={StyleSheet.absoluteFillObject}
                />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <SafeAreaView style={styles.setupContainer} edges={['top', 'bottom']}>
                        <Animated.View
                            entering={FadeInDown.duration(500)}
                            style={styles.setupContent}
                        >
                            <Text style={styles.setupEmoji}>👋</Text>
                            <Text style={styles.setupTitle}>One last thing</Text>
                            <Text style={styles.setupSubtitle}>
                                Tell us your name and add a photo to personalise your Atlas
                            </Text>

                            {/* Avatar */}
                            <TouchableOpacity
                                onPress={pickAvatar}
                                style={styles.avatarBtn}
                                accessibilityLabel="Pick profile photo"
                                accessibilityRole="button"
                            >
                                <View style={styles.avatarRing}>
                                    {avatarUri ? (
                                        <Image
                                            source={{ uri: avatarUri }}
                                            style={styles.avatarImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <MaterialIcons name="person" size={48} color="#6b7280" />
                                    )}
                                </View>
                                <View style={styles.avatarCamera}>
                                    <MaterialIcons name="photo-camera" size={14} color="white" />
                                </View>
                            </TouchableOpacity>

                            {/* Name input */}
                            <View style={styles.inputRow}>
                                <MaterialIcons name="person-outline" size={20} color="#6b7280" />
                                <TextInput
                                    style={styles.nameInput}
                                    placeholder="Your first name..."
                                    placeholderTextColor="#4b5563"
                                    value={name}
                                    onChangeText={setName}
                                    returnKeyType="done"
                                    autoCorrect={false}
                                    maxLength={30}
                                />
                            </View>
                        </Animated.View>

                        <Animated.View
                            entering={FadeInUp.delay(200).duration(500)}
                            style={styles.setupActions}
                        >
                            <TouchableOpacity
                                style={[styles.ctaBtn, { backgroundColor: '#8b5cf6' }]}
                                onPress={handleFinish}
                                activeOpacity={0.85}
                                accessibilityLabel="Start exploring"
                                accessibilityRole="button"
                            >
                                <Text style={styles.ctaBtnText}>Start Exploring 🌍</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleFinish}
                                style={styles.skipBtn}
                                accessibilityLabel="Skip setup"
                                accessibilityRole="button"
                            >
                                <Text style={styles.skipBtnText}>Skip for now</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bgClass="bg-[#0f172a]" edges={[]}>
            <LinearGradient
                colors={slide.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Decorative orbs */}
            <View style={[styles.orb1, { backgroundColor: slide.accent }]} />
            <View style={[styles.orb2, { backgroundColor: slide.accent }]} />

            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {/* Skip */}
                <TouchableOpacity
                    style={styles.skipTopBtn}
                    onPress={handleSkip}
                    accessibilityLabel="Skip onboarding"
                    accessibilityRole="button"
                >
                    <Text style={styles.skipTopText}>Skip</Text>
                </TouchableOpacity>

                {/* Slides */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                    style={{ flex: 1 }}
                    onMomentumScrollEnd={e => {
                        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                        setCurrentSlide(idx);
                    }}
                >
                    {SLIDES.map((s, slideIdx) => (
                        <View key={s.id} style={[styles.slide, { width }]}>
                            <Animated.View
                                entering={FadeInDown.delay(100).duration(600)}
                                style={styles.slideHero}
                            >
                                <Text style={styles.slideEmoji}>{s.emoji}</Text>
                                <Text style={styles.slideTitle}>{s.title}</Text>
                                <Text style={styles.slideSubtitle}>{s.subtitle}</Text>
                            </Animated.View>

                            <Animated.View
                                entering={FadeInUp.delay(300).duration(600)}
                                style={styles.featureList}
                            >
                                {s.features.map((f, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.featureRow,
                                            { borderColor: `${s.accent}20` },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.featureIcon,
                                                { backgroundColor: `${s.accent}20` },
                                            ]}
                                        >
                                            <MaterialIcons
                                                name={f.icon}
                                                size={18}
                                                color={s.accent}
                                            />
                                        </View>
                                        <Text style={styles.featureLabel}>{f.label}</Text>
                                    </View>
                                ))}
                            </Animated.View>
                        </View>
                    ))}
                </ScrollView>

                {/* Bottom */}
                <View style={styles.bottom}>
                    {/* Animated dots */}
                    <View style={styles.dots}>
                        {SLIDES.map((_, i) => (
                            <AnimatedDot
                                key={i}
                                index={i}
                                current={currentSlide}
                                accent={slide.accent}
                                onPress={() => goToSlide(i)}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.ctaBtn, { backgroundColor: slide.accent }]}
                        onPress={handleNext}
                        activeOpacity={0.85}
                        accessibilityLabel={
                            currentSlide < SLIDES.length - 1 ? 'Next slide' : 'Continue to setup'
                        }
                        accessibilityRole="button"
                    >
                        <Text style={styles.ctaBtnText}>
                            {currentSlide < SLIDES.length - 1 ? 'Continue' : "Let's Go!"}
                        </Text>
                        <MaterialIcons
                            name={currentSlide < SLIDES.length - 1 ? 'arrow-forward' : 'check'}
                            size={20}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ScreenWrapper>
    );
}

function AnimatedDot({
    index,
    current,
    accent,
    onPress,
}: {
    index: number;
    current: number;
    accent: string;
    onPress: () => void;
}) {
    const progress = useSharedValue(index === current ? 1 : 0);

    React.useEffect(() => {
        progress.value = withTiming(index === current ? 1 : 0, { duration: 300 });
    }, [current, index, progress]);

    const style = useAnimatedStyle(() => ({
        width: interpolate(progress.value, [0, 1], [8, 24], Extrapolation.CLAMP),
        backgroundColor: progress.value > 0.5 ? accent : 'rgba(255,255,255,0.2)',
    }));

    return (
        <TouchableOpacity
            onPress={onPress}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessibilityLabel={`Go to slide ${index + 1}`}
        >
            <Animated.View style={[styles.dot, style]} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    skipTopBtn: { position: 'absolute', top: 52, right: 24, zIndex: 20 },
    skipTopText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
    orb1: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
        opacity: 0.15,
        top: -100,
        right: -100,
    },
    orb2: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        opacity: 0.08,
        bottom: 80,
        left: -80,
    },
    slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    slideHero: { alignItems: 'center', marginBottom: 40 },
    slideEmoji: { fontSize: 80, marginBottom: 24 },
    slideTitle: {
        color: 'white',
        fontSize: 38,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 46,
        marginBottom: 16,
    },
    slideSubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    featureList: { width: '100%', gap: 10 },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    featureIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500', flex: 1 },
    bottom: { paddingHorizontal: 28, paddingBottom: 24 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 },
    dot: { height: 8, borderRadius: 4 },
    ctaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 18,
    },
    ctaBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
    // Setup screen
    setupContainer: { flex: 1, paddingHorizontal: 28 },
    setupContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    setupEmoji: { fontSize: 72, marginBottom: 16 },
    setupTitle: {
        color: 'white',
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
    },
    setupSubtitle: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 36,
    },
    avatarBtn: { position: 'relative', marginBottom: 28 },
    avatarRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'rgba(139,92,246,0.4)',
        backgroundColor: '#1e1b4b',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarCamera: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#8b5cf6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#0f172a',
    },
    inputRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 14,
        gap: 12,
    },
    nameInput: { flex: 1, color: 'white', fontSize: 16, padding: 0 },
    setupActions: { paddingBottom: 8 },
    skipBtn: { alignItems: 'center', paddingVertical: 14 },
    skipBtnText: { color: 'rgba(255,255,255,0.3)', fontSize: 14 },
});
