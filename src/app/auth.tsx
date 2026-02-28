import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '../store/useAuthStore';
import { Toast, useToast } from '../components/Toast';

type Mode = 'signin' | 'signup' | 'forgot';

export default function Auth() {
    const router = useRouter();
    const { signInWithEmail, signUpWithEmail, resetPassword, loading } = useAuthStore();

    const [mode, setMode] = useState<Mode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { toast, show: showToast, hide: hideToast } = useToast();

    const handleSubmit = async () => {
        if (!email.trim() || (!password.trim() && mode !== 'forgot')) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showToast('Please fill in all fields.', 'error');
            return;
            return;
        }

        if (mode === 'signup' && password !== confirmPassword) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showToast('Passwords do not match.', 'error');
            return;
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (mode === 'forgot') {
            const { error } = await resetPassword(email.trim());
            if (error) {
                showToast(error, 'error');
            } else {
                showToast('Reset link sent — check your inbox.', 'success');
                setMode('signin');
            }
            return;
        }

        const fn = mode === 'signin' ? signInWithEmail : signUpWithEmail;
        const { error } = await fn(email.trim(), password);

        if (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showToast(error, 'error');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (mode === 'signup') {
                showToast('Check your email for a confirmation link.', 'info');
            }
            // Auth listener in _layout will handle navigation
        }
    };

    return (
        <LinearGradient colors={['#0f172a', '#1e3a5f', '#0f172a']} className="flex-1">
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'center',
                            padding: 32,
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View entering={FadeInDown.duration(500)}>
                            {/* Logo */}
                            <View className="items-center mb-10">
                                <Text className="text-5xl mb-3">🌍</Text>
                                <Text className="text-white text-3xl font-bold tracking-tight">
                                    Atlas
                                </Text>
                                <Text className="text-white/40 text-sm mt-1">
                                    Your bucket list, beautifully organised
                                </Text>
                            </View>

                            {/* Title */}
                            <Text className="text-white text-2xl font-bold mb-2">
                                {mode === 'signin'
                                    ? 'Welcome back'
                                    : mode === 'signup'
                                      ? 'Create account'
                                      : 'Reset password'}
                            </Text>
                            <Text className="text-white/40 text-sm mb-8">
                                {mode === 'signin'
                                    ? 'Sign in to access your goals'
                                    : mode === 'signup'
                                      ? 'Start your adventure today'
                                      : 'Enter your email to get a reset link'}
                            </Text>

                            {/* Email */}
                            <View className="bg-white/[0.07] border border-white/10 rounded-2xl px-4 py-4 flex-row items-center mb-4">
                                <MaterialIcons
                                    name="email"
                                    size={20}
                                    color="rgba(255,255,255,0.4)"
                                />
                                <TextInput
                                    className="flex-1 text-white text-base ml-3"
                                    placeholder="Email address"
                                    placeholderTextColor="rgba(255,255,255,0.25)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            {/* Password */}
                            {mode !== 'forgot' && (
                                <View className="bg-white/[0.07] border border-white/10 rounded-2xl px-4 py-4 flex-row items-center mb-4">
                                    <MaterialIcons
                                        name="lock-outline"
                                        size={20}
                                        color="rgba(255,255,255,0.4)"
                                    />
                                    <TextInput
                                        className="flex-1 text-white text-base ml-3"
                                        placeholder="Password"
                                        placeholderTextColor="rgba(255,255,255,0.25)"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                                        <MaterialIcons
                                            name={showPassword ? 'visibility-off' : 'visibility'}
                                            size={20}
                                            color="rgba(255,255,255,0.3)"
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Confirm Password (signup only) */}
                            {mode === 'signup' && (
                                <View className="bg-white/[0.07] border border-white/10 rounded-2xl px-4 py-4 flex-row items-center mb-4">
                                    <MaterialIcons
                                        name="lock-outline"
                                        size={20}
                                        color="rgba(255,255,255,0.4)"
                                    />
                                    <TextInput
                                        className="flex-1 text-white text-base ml-3"
                                        placeholder="Confirm password"
                                        placeholderTextColor="rgba(255,255,255,0.25)"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                </View>
                            )}

                            {/* Forgot password link */}
                            {mode === 'signin' && (
                                <TouchableOpacity
                                    className="self-end mb-6"
                                    onPress={() => setMode('forgot')}
                                >
                                    <Text className="text-blue-400 text-sm">Forgot password?</Text>
                                </TouchableOpacity>
                            )}

                            {/* Submit */}
                            <TouchableOpacity
                                className={`w-full py-4 rounded-2xl items-center justify-center mb-4 ${loading ? 'bg-blue-800' : 'bg-blue-600'}`}
                                onPress={handleSubmit}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                <Text className="text-white font-bold text-base">
                                    {loading
                                        ? 'Please wait...'
                                        : mode === 'signin'
                                          ? 'Sign In'
                                          : mode === 'signup'
                                            ? 'Create Account'
                                            : 'Send Reset Link'}
                                </Text>
                            </TouchableOpacity>

                            {/* Toggle mode */}
                            <View className="flex-row justify-center items-center mt-2">
                                <Text className="text-white/40 text-sm">
                                    {mode === 'signin'
                                        ? "Don't have an account? "
                                        : mode === 'signup'
                                          ? 'Already have an account? '
                                          : 'Remember your password? '}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                                >
                                    <Text className="text-blue-400 text-sm font-semibold">
                                        {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
            <Toast
                message={toast.message}
                type={toast.type}
                visible={toast.visible}
                onHide={hideToast}
            />
        </LinearGradient>
    );
}
