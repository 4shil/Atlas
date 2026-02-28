import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { useGoalStore, Location } from '../store/useGoalStore';
import { LocationPicker } from '../components/LocationPicker';
import { scheduleGoalReminders } from '../utils/notificationUtils';
import { CATEGORIES } from '../utils/constants';
import { ScreenWrapper } from '../components/ScreenWrapper';

export default function AddGoal() {
    const router = useRouter();
    const { editId } = useLocalSearchParams<{ editId?: string }>();
    const { addGoal, updateGoal, goals } = useGoalStore();

    // Determine if we're in edit mode
    const existingGoal = editId ? goals.find(g => g.id === editId) : null;
    const isEditMode = !!existingGoal;

    const [title, setTitle] = useState(existingGoal?.title ?? '');
    const [description, setDescription] = useState(existingGoal?.description ?? '');
    const [notes, setNotes] = useState(existingGoal?.notes ?? '');
    const [category, setCategory] = useState(existingGoal?.category ?? 'Travel');
    const [locationData, setLocationData] = useState<Location>(
        existingGoal?.location ?? { latitude: 0, longitude: 0, city: '', country: '' }
    );
    const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);
    const [image, setImage] = useState<string | null>(existingGoal?.image ?? null);
    const [date, setDate] = useState<Date>(
        existingGoal
            ? new Date(existingGoal.timelineDate)
            : new Date(new Date().setMonth(new Date().getMonth() + 1))
    );
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [saving, setSaving] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.6, // compressed — was 1.0
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };
    const uploadImage = async (localUri: string, goalId: string): Promise<string> => {
        try {
            const session = await supabase.auth.getSession();
            if (!session.data.session) return localUri;
            const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
            const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
            const path = `${session.data.session.user.id}/${goalId}.${ext}`;
            const res = await fetch(localUri);
            const blob = await res.blob();
            const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as ArrayBuffer);
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
            });
            const { error } = await supabase.storage
                .from('goal-images')
                .upload(path, arrayBuffer, { contentType: mime, upsert: true });
            if (error) return localUri;
            const { data } = supabase.storage.from('goal-images').getPublicUrl(path);
            return data.publicUrl;
        } catch {
            return localUri;
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        // Past date validation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
                'Invalid Date',
                'Target date cannot be in the past. Please pick a future date.'
            );
            return;
        }

        const placeholderImage =
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';
        const goalData = {
            title: title.trim(),
            description: description.trim(),
            category,
            image: image || placeholderImage,
            timelineDate: date.toISOString(),
            notes: notes.trim(),
            location:
                locationData.latitude !== 0
                    ? locationData
                    : {
                          latitude: 0,
                          longitude: 0,
                          city: '',
                          country: '',
                      },
        };

        if (isEditMode && existingGoal) {
            setSaving(true);
            let finalImage = goalData.image;
            if (goalData.image && goalData.image.startsWith('file://')) {
                finalImage = await uploadImage(goalData.image, existingGoal.id);
            }
            await updateGoal(existingGoal.id, { ...goalData, image: finalImage });
        } else {
            setSaving(true);

            // Upload image to Supabase Storage if it's a local file
            const tempId = require('react-native-uuid').v4() as string;
            let finalImage = goalData.image;
            if (goalData.image && goalData.image.startsWith('file://')) {
                finalImage = await uploadImage(goalData.image, tempId);
            }

            const createdGoalId = await addGoal({ ...goalData, image: finalImage });
            // Schedule reminders asynchronously — doesn't block navigation
            scheduleGoalReminders({
                goalId: createdGoalId,
                goalTitle: goalData.title,
                targetDate: date,
            }).catch(() => {});
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSaving(false);
        router.back();
    };

    return (
        <ScreenWrapper bgClass="bg-black dark:bg-black bg-slate-50">
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center border-b dark:border-white/10 border-black/10">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white/5 border dark:border-white/10 border-black/10 items-center justify-center"
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                    }}
                >
                    <MaterialIcons name="close" size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-semibold text-lg">
                    {isEditMode ? 'Edit Adventure' : 'New Adventure'}
                </Text>
                <TouchableOpacity
                    className={`px-5 py-2 rounded-full ${title.trim() && !saving ? 'bg-blue-600' : 'bg-gray-800'}`}
                    onPress={handleSave}
                    disabled={!title.trim() || saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text
                            className={`font-semibold ${title.trim() ? 'text-white' : 'text-gray-500'}`}
                        >
                            {isEditMode ? 'Update' : 'Save'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 60 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <View className="mb-7">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">
                        Title *
                    </Text>
                    <TextInput
                        className="dark:text-white text-gray-900 text-3xl font-bold border-b border-white/20 pb-2"
                        placeholder="e.g. Ski in Niseko"
                        placeholderTextColor="#4b5563"
                        value={title}
                        onChangeText={setTitle}
                        autoFocus={!isEditMode}
                    />
                </View>

                {/* Category */}
                <View className="mb-7">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
                        Category
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="overflow-visible"
                    >
                        {CATEGORIES.filter(c => c !== 'All').map(cat => (
                            <TouchableOpacity
                                key={cat}
                                className={`px-5 py-2.5 rounded-full mr-3 border ${category === cat ? 'bg-blue-600 border-blue-500' : 'bg-white/5 dark:border-white/10 border-black/10'}`}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setCategory(cat);
                                }}
                            >
                                <Text
                                    className={`text-xs font-medium ${category === cat ? 'text-white' : 'text-gray-300'}`}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Description */}
                <View className="mb-7">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">
                        Description
                    </Text>
                    <TextInput
                        className="dark:text-white text-gray-900 text-base bg-white/5 rounded-2xl p-4 border dark:border-white/10 border-black/10"
                        placeholder="What do you want to experience?"
                        placeholderTextColor="#4b5563"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Notes */}
                <View className="mb-7">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">
                        Notes
                    </Text>
                    <TextInput
                        className="dark:text-white text-gray-900 text-base bg-white/5 rounded-2xl p-4 border dark:border-white/10 border-black/10"
                        placeholder="Tips, packing list, memories..."
                        placeholderTextColor="#4b5563"
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Location */}
                <View className="mb-7">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">
                        Location
                    </Text>
                    <TouchableOpacity
                        className="flex-row items-center bg-white/5 rounded-2xl border dark:border-white/10 border-black/10 px-4 py-4"
                        onPress={() => setIsLocationPickerVisible(true)}
                    >
                        <MaterialIcons name="place" size={20} color="#60a5fa" />
                        <Text
                            className={`flex-1 text-base ml-2 ${locationData.city ? 'text-white' : 'text-gray-500'}`}
                        >
                            {locationData.city
                                ? `${locationData.city}, ${locationData.country}`
                                : Platform.OS === 'web'
                                  ? 'Enter location'
                                  : 'Pick on map'}
                        </Text>
                        {locationData.city ? (
                            <TouchableOpacity
                                onPress={() =>
                                    setLocationData({
                                        latitude: 0,
                                        longitude: 0,
                                        city: '',
                                        country: '',
                                    })
                                }
                            >
                                <MaterialIcons name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        ) : (
                            <MaterialIcons name="chevron-right" size={20} color="#6b7280" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Target Date */}
                <View className="mb-7">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">
                        Target Date
                    </Text>
                    <TouchableOpacity
                        className="flex-row items-center bg-white/5 rounded-2xl border dark:border-white/10 border-black/10 px-4 py-4"
                        onPress={() => setShowDatePicker(true)}
                    >
                        <MaterialIcons name="event" size={20} color="#60a5fa" />
                        <Text className="flex-1 dark:text-white text-gray-900 text-base ml-2">
                            {date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                        </Text>
                        <MaterialIcons name="chevron-right" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            minimumDate={new Date()}
                            onChange={(_, selectedDate) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />
                    )}
                </View>

                {/* Cover Image */}
                <View className="mb-4">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">
                        Cover Image
                    </Text>
                    <TouchableOpacity
                        className="bg-white/5 rounded-2xl border dark:border-white/10 border-black/10 h-48 justify-center items-center overflow-hidden"
                        onPress={pickImage}
                    >
                        {image ? (
                            <>
                                <Image
                                    source={image}
                                    className="w-full h-full"
                                    contentFit="cover"
                                />
                                <View className="absolute bottom-3 right-3 bg-black/60 rounded-full px-3 py-1 flex-row items-center">
                                    <MaterialIcons name="edit" size={14} color="white" />
                                    <Text className="dark:text-white text-gray-900 text-xs ml-1">
                                        Change
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <View className="items-center">
                                <MaterialIcons name="add-a-photo" size={32} color="#9ca3af" />
                                <Text className="text-gray-400 mt-2 text-sm font-medium">
                                    Select a photo
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <LocationPicker
                visible={isLocationPickerVisible}
                onClose={() => setIsLocationPickerVisible(false)}
                onSelect={loc => setLocationData({ ...loc })}
                initialLocation={locationData.latitude !== 0 ? locationData : undefined}
            />
        </ScreenWrapper>
    );
}
