import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    visible: boolean;
    onHide?: () => void;
    duration?: number;
}

const config: Record<ToastType, { icon: string; color: string; bg: string }> = {
    success: { icon: 'check-circle', color: '#4ade80', bg: 'rgba(20,83,45,0.95)' },
    error: { icon: 'error', color: '#f87171', bg: 'rgba(127,29,29,0.95)' },
    info: { icon: 'info', color: '#60a5fa', bg: 'rgba(30,58,138,0.95)' },
};

export function Toast({ message, type = 'success', visible, onHide, duration = 2500 }: ToastProps) {
    const translateY = useRef(new Animated.Value(-80)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 10,
                }),
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();

            const timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -80,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
                ]).start(() => onHide?.());
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const { icon, color, bg } = config[type];

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    top: 56,
                    left: 20,
                    right: 20,
                    zIndex: 999,
                    borderRadius: 16,
                    backgroundColor: bg,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: `${color}30`,
                    shadowColor: '#000',
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <MaterialIcons name={icon as any} size={20} color={color} />
            <Text
                style={{ color: 'white', marginLeft: 10, flex: 1, fontSize: 14, fontWeight: '500' }}
            >
                {message}
            </Text>
        </Animated.View>
    );
}

// Simple hook to manage toast state
export function useToast() {
    const [toast, setToast] = React.useState<{
        message: string;
        type: ToastType;
        visible: boolean;
    }>({
        message: '',
        type: 'success',
        visible: false,
    });

    const show = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, visible: true });
    };

    const hide = () => setToast(t => ({ ...t, visible: false }));

    return { toast, show, hide };
}
