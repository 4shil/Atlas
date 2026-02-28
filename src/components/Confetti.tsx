/**
 * Confetti
 * Full-screen celebration overlay — triggered on goal completion.
 * Psychology: Peak-End Rule — make the completion moment unforgettable.
 * The memory of achieving a goal should feel like a reward, not a checkbox.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#e879f9', '#fff'];
const PARTICLE_COUNT = 60;

interface Particle {
    x: Animated.Value;
    y: Animated.Value;
    rotate: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
    color: string;
    size: number;
    shape: 'rect' | 'circle';
}

interface ConfettiProps {
    visible: boolean;
    onDone?: () => void;
}

export function Confetti({ visible, onDone }: ConfettiProps) {
    const particles = useRef<Particle[]>(
        Array.from({ length: PARTICLE_COUNT }, () => ({
            x: new Animated.Value(Math.random() * width),
            y: new Animated.Value(-20),
            rotate: new Animated.Value(0),
            opacity: new Animated.Value(1),
            scale: new Animated.Value(0),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: 6 + Math.random() * 8,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
        }))
    ).current;

    useEffect(() => {
        if (!visible) return;

        // Reset all particles
        particles.forEach(p => {
            p.x.setValue(width * 0.2 + Math.random() * width * 0.6);
            p.y.setValue(-20);
            p.rotate.setValue(0);
            p.opacity.setValue(1);
            p.scale.setValue(0);
        });

        const animations = particles.map((p, i) =>
            Animated.sequence([
                Animated.delay(i * 18),
                Animated.parallel([
                    Animated.spring(p.scale, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 80,
                        friction: 5,
                    }),
                    Animated.timing(p.y, {
                        toValue: height + 40,
                        duration: 1800 + Math.random() * 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(p.x, {
                        toValue: p.x._value + (Math.random() - 0.5) * 200,
                        duration: 1800 + Math.random() * 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(p.rotate, {
                        toValue: (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 5),
                        duration: 1800 + Math.random() * 1000,
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.delay(1200 + Math.random() * 400),
                        Animated.timing(p.opacity, {
                            toValue: 0,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ])
        );

        Animated.stagger(8, animations).start(() => onDone?.());
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map((p, i) => (
                <Animated.View
                    key={i}
                    style={{
                        position: 'absolute',
                        width: p.size,
                        height: p.shape === 'rect' ? p.size * 0.4 : p.size,
                        borderRadius: p.shape === 'circle' ? p.size / 2 : 2,
                        backgroundColor: p.color,
                        opacity: p.opacity,
                        transform: [
                            { translateX: p.x },
                            { translateY: p.y },
                            {
                                rotate: p.rotate.interpolate({
                                    inputRange: [-10, 10],
                                    outputRange: ['-360deg', '360deg'],
                                }),
                            },
                            { scale: p.scale },
                        ],
                    }}
                />
            ))}
        </View>
    );
}
