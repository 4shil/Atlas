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
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useGoalsStore, GoalCategory, categoryMeta, createEmptyGoal } from '../../features/goals';
import { BlurOverlay, HeaderOverlay, LocationPicker } from '../../components';

import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';

const categories = Object.entries(categoryMeta) as [GoalCategory, { label: string; icon: string }][];

export default function CreateGoalScreen() {
    const router = useRouter();
    const { colors, typography, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const headerOffset = insets.top + spacing.screen.top;
    const addGoal = useGoalsStore(state => state.addGoal);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<GoalCategory>('travel');
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
        city: string;
        country: string;
    } | null>(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [timelineDate, setTimelineDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setTimelineDate(selectedDate);
        }
    };

    const handleLocationSelect = (newLocation: { latitude: number; longitude: number; city: string; country: string }) => {
        setLocation(newLocation);
    };

    const handleCreate = useCallback(() => {
        if (!title.trim()) return;

        const goalData = {
            ...createEmptyGoal(),

            title: title.trim(),
            description: description.trim(),
            category,
            image,
            timelineDate,
            location: location ? {
                ...location,
                placeId: undefined,
            } : null,
        };

        addGoal(goalData);
        router.back();
    }, [title, description, category, location, image, timelineDate, addGoal, router]);

    const isValid = title.trim().length > 0;
    const categoryGap = spacing.component.xs / 2;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        scrollContent: {
            paddingTop: headerOffset,
            paddingHorizontal: spacing.screen.horizontal,
            paddingBottom: insets.bottom + spacing.screen.bottom + spacing.component.lg,
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
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border.subtle,
        },
        textArea: {
            minHeight: spacing.touch.large * 2,
            textAlignVertical: 'top',
        },
        categoryGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -categoryGap,
        },
        categoryItem: {
            width: '25%',
            padding: categoryGap,
        },
        categoryButton: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.component.sm,
            borderRadius: radius.medium,
            backgroundColor: colors.background.secondary,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border.subtle,
        },
        categorySelected: {
            backgroundColor: colors.accent.primary,
            borderColor: colors.accent.primary,
        },
        categoryIcon: {
            marginBottom: categoryGap,
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
            height: spacing.touch.large,
            backgroundColor: isValid ? colors.accent.primary : colors.background.tertiary,
            borderRadius: radius.medium,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: isValid ? colors.accent.primary : colors.border.subtle,
        },
        createContainer: {
            position: 'absolute',
            bottom: insets.bottom + spacing.component.md,
            left: spacing.screen.horizontal,
            right: spacing.screen.horizontal,
            padding: spacing.component.xs,
            borderRadius: radius.large,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border.subtle,
        },
        createButtonText: {
            ...typography.label,
            color: isValid ? colors.text.inverted : colors.text.muted,
        },
        imagePickerContainer: {
            height: spacing.section.gap * 4,
            backgroundColor: colors.background.secondary,
            borderRadius: radius.medium,
            overflow: 'hidden',
            marginBottom: spacing.component.md,
        },
        imagePreview: {
            width: '100%',
            height: '100%',
        },
        imagePlaceholder: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        imagePlaceholderIcon: {
            fontSize: 32,
            marginBottom: spacing.component.xs,
        },
        imagePlaceholderText: {
            ...typography.label,
            color: colors.text.secondary,
        },
        dateButton: {
            backgroundColor: colors.background.secondary,
            padding: spacing.component.md,
            borderRadius: radius.medium,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border.subtle,
        },
        dateText: {
            ...typography.body,
            color: colors.text.primary,
        },
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <HeaderOverlay
                leftAction={{ icon: 'close', onPress: () => router.back() }}
                transparent
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <Animated.View style={styles.header} entering={FadeIn.duration(220)}>
                    <Text style={styles.headerTitle}>New Dream</Text>
                    <Text style={styles.headerSubtitle}>
                        What experience do you want to add to your life?
                    </Text>
                </Animated.View>

                {/* Image Picker */}
                <Animated.View style={styles.inputGroup} entering={FadeIn.delay(40).duration(220)}>
                    <Pressable onPress={pickImage} style={styles.imagePickerContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.imagePreview} contentFit="cover" transition={200} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="image" size={32} color={colors.text.primary} style={styles.imagePlaceholderIcon} />
                                <Text style={styles.imagePlaceholderText}>Add Cover Image</Text>
                            </View>
                        )}
                    </Pressable>
                </Animated.View>

                {/* Title */}
                <Animated.View style={styles.inputGroup} entering={FadeIn.delay(80).duration(220)}>
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
                <Animated.View style={styles.inputGroup} entering={FadeIn.delay(120).duration(220)}>
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
                <Animated.View style={styles.inputGroup} entering={FadeIn.delay(160).duration(220)}>
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
                                    <Ionicons
                                        name={value.icon}
                                        size={24}
                                        color={category === key ? colors.text.inverted : colors.text.primary}
                                        style={styles.categoryIcon}
                                    />
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

                {/* Target Date */}
                <Animated.View style={styles.inputGroup} entering={FadeIn.delay(200).duration(220)}>
                    <Text style={styles.label}>TARGET DATE</Text>
                    <Pressable
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {timelineDate.toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                    </Pressable>
                    {showDatePicker && (
                        <DateTimePicker
                            value={timelineDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}
                </Animated.View>

                {/* Location */}
                <Animated.View style={styles.inputGroup} entering={FadeIn.delay(240).duration(220)}>
                    <Text style={styles.label}>LOCATION (OPTIONAL)</Text>
                    <Pressable
                        style={styles.dateButton}
                        onPress={() => setShowLocationPicker(true)}
                    >
                        <Text style={[styles.dateText, !location && { color: colors.text.muted }]}>
                            {location ? `${location.city}, ${location.country}` : 'Pick a location on map...'}
                        </Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>

            <LocationPicker
                visible={showLocationPicker}
                onClose={() => setShowLocationPicker(false)}
                onSelect={handleLocationSelect}
                initialLocation={location}
            />


            {/* Create Button */}
            <BlurOverlay style={styles.createContainer} intensity={30}>
                <Pressable
                    style={styles.createButton}
                    onPress={handleCreate}
                    disabled={!isValid}
                >
                    <Text style={styles.createButtonText}>CREATE DREAM</Text>
                </Pressable>
            </BlurOverlay>
        </KeyboardAvoidingView >
    );
}
