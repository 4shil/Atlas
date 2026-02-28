import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Logo fade in
        Animated.parallel([
            Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 60 }),
            Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();

        // Dots pulse
        const animDot = (dot: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
                ])
            );

        const a1 = animDot(dot1, 0);
        const a2 = animDot(dot2, 200);
        const a3 = animDot(dot3, 400);
        a1.start();
        a2.start();
        a3.start();
        return () => {
            a1.stop();
            a2.stop();
            a3.stop();
        };
    }, []);

    return (
        <LinearGradient colors={['#050508', '#0f1020', '#050508']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Animated.View
                    style={{
                        transform: [{ scale: logoScale }],
                        opacity: logoOpacity,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ fontSize: 56, marginBottom: 12 }}>🌍</Text>
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 28,
                            fontWeight: 'bold',
                            letterSpacing: -0.5,
                        }}
                    >
                        Atlas
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 24, gap: 8 }}>
                        {[dot1, dot2, dot3].map((dot, i) => (
                            <Animated.View
                                key={i}
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'rgba(96,165,250,0.8)',
                                    opacity: dot,
                                }}
                            />
                        ))}
                    </View>
                    {message !== 'Loading...' && (
                        <Text
                            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 12 }}
                        >
                            {message}
                        </Text>
                    )}
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    );
}
