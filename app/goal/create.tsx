/**
 * Atlas — Create Goal Screen
 * Form to add new dreams
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/theme';
import { useGoalsStore, GoalCategory, categoryMeta, createEmptyGoal } from '../../src/features/goals';
import { HeaderOverlay } from '../../src/components';

const categories = Object.entries(categoryMeta) as [GoalCategory, { label: string; emoji: string }][];

export default function CreateGoalScreen() {
    const router = useRouter();
    const { colors, typography, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const addGoal = useGoalsStore(state => state.addGoal);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<GoalCategory>('travel');
    const [locationCity, setLocationCity] = useState('');
    const [locationCountry, setLocationCountry] = useState('');

    const handleCreate = useCallback(() => {
        if (!title.trim()) return;

        const goalData = {
            ...createEmptyGoal(),
            title: title.trim(),
            description: description.trim(),
            category,
            location: locationCity && locationCountry ? {
                latitude: 0, // Would be set by map picker in full implementation
                longitude: 0,
                city: locationCity.trim(),
                country: locationCountry.trim(),
            } : null,
        };

        addGoal(goalData);
        router.back();
    }, [title, description, category, locationCity, locationCountry, addGoal, router]);

    const isValid = title.trim().length > 0;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        scrollContent: {
            paddingTop: insets.top + 60,
            paddingHorizontal: spacing.screen.horizontal,
            paddingBottom: insets.bottom + 100,
        },
        header: {
            marginBottom: spacing.section.gap,
        },
        headerTitle: {
            ...typography.displayLarge,
            color: colors.text.primary,
        },
        headerSubtitle: {
            ...typography.body,
            color: colors.text.secondary,
            marginTop: spacing.component.xs,
        },
        inputGroup: {
            marginBottom: spacing.component.lg,
        },
        label: {
            ...typography.label,
            color: colors.text.secondary,
            marginBottom: spacing.component.xs,
        },
        input: {
            backgroundColor: colors.background.secondary,
            borderRadius: radius.medium,
            padding: spacing.component.md,
            ...typography.body,
            color: colors.text.primary,
        },
        textArea: {
            minHeight: 100,
            textAlignVertical: 'top',
        },
        categoryGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -4,
        },
        categoryItem: {
            width: '25%',
            padding: 4,
        },
        categoryButton: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.component.sm,
            borderRadius: radius.medium,
            backgroundColor: colors.background.secondary,
        },
        categorySelected: {
            backgroundColor: colors.accent.primary,
        },
        categoryEmoji: {
            fontSize: 24,
            marginBottom: 4,
        },
        categoryLabel: {
            ...typography.caption,
            color: colors.text.secondary,
        },
        categoryLabelSelected: {
            color: colors.text.inverted,
        },
        locationRow: {
            flexDirection: 'row',
        },
        locationInput: {
            flex: 1,
            marginRight: spacing.component.sm,
        },
        createButton: {
            position: 'absolute',
            bottom: insets.bottom + spacing.component.md,
            left: spacing.screen.horizontal,
            right: spacing.screen.horizontal,
            height: spacing.touch.large,
            backgroundColor: isValid ? colors.accent.primary : colors.background.tertiary,
            borderRadius: radius.medium,
            alignItems: 'center',
            justifyContent: 'center',
        },
        createButtonText: {
            ...typography.label,
            color: isValid ? colors.text.inverted : colors.text.muted,
        },
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <HeaderOverlay
                leftAction={{ icon: '✕', onPress: () => router.back() }}
                transparent
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <Animated.View style={styles.header} entering={FadeInDown.duration(400)}>
                    <Text style={styles.headerTitle}>New Dream</Text>
                    <Text style={styles.headerSubtitle}>
                        What experience do you want to add to your life?
                    </Text>
                </Animated.View>

                {/* Title */}
                <Animated.View style={styles.inputGroup} entering={FadeInDown.delay(100).duration(400)}>
                    <Text style={styles.label}>TITLE</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Give your dream a name..."
                        placeholderTextColor={colors.text.muted}
                        value={title}
                        onChangeText={setTitle}
                    />
                </Animated.View>

                {/* Description */}
                <Animated.View style={styles.inputGroup} entering={FadeInDown.delay(150).duration(400)}>
                    <Text style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe this experience..."
                        placeholderTextColor={colors.text.muted}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />
                </Animated.View>

                {/* Category */}
                <Animated.View style={styles.inputGroup} entering={FadeInDown.delay(200).duration(400)}>
                    <Text style={styles.label}>CATEGORY</Text>
                    <View style={styles.categoryGrid}>
                        {categories.map(([key, value]) => (
                            <View key={key} style={styles.categoryItem}>
                                <Pressable
                                    style={[
                                        styles.categoryButton,
                                        category === key && styles.categorySelected,
                                    ]}
                                    onPress={() => setCategory(key)}
                                >
                                    <Text style={styles.categoryEmoji}>{value.emoji}</Text>
                                    <Text style={[
                                        styles.categoryLabel,
                                        category === key && styles.categoryLabelSelected,
                                    ]}>
                                        {value.label}
                                    </Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Location */}
                <Animated.View style={styles.inputGroup} entering={FadeInDown.delay(250).duration(400)}>
                    <Text style={styles.label}>LOCATION (OPTIONAL)</Text>
                    <View style={styles.locationRow}>
                        <View style={styles.locationInput}>
                            <TextInput
                                style={styles.input}
                                placeholder="City"
                                placeholderTextColor={colors.text.muted}
                                value={locationCity}
                                onChangeText={setLocationCity}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <TextInput
                                style={styles.input}
                                placeholder="Country"
                                placeholderTextColor={colors.text.muted}
                                value={locationCountry}
                                onChangeText={setLocationCountry}
                            />
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Create Button */}
            <Pressable
                style={styles.createButton}
                onPress={handleCreate}
                disabled={!isValid}
            >
                <Text style={styles.createButtonText}>CREATE DREAM</Text>
            </Pressable>
        </KeyboardAvoidingView>
    );
}
