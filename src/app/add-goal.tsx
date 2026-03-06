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
    KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import uuid from 'react-native-uuid';
import { useGoalStore, Location } from '../store/useGoalStore';
import { LocationPicker } from '../components/LocationPicker';
import { scheduleGoalReminders } from '../utils/notificationUtils';
import { CATEGORIES } from '../utils/constants';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useSettingsStore } from '../store/useSettingsStore';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';

export default function AddGoal() {
    const router = useRouter();
    const { editId } = useLocalSearchParams<{ editId?: string }>();
    const { addGoal, updateGoal, goals } = useGoalStore();
    const defaultCategory = useSettingsStore(s => s.defaultCategory);

    // Determine if we're in edit mode
    const existingGoal = editId ? goals.find(g => g.id === editId) : null;
    const isEditMode = !!existingGoal;

    const [title, setTitle] = useState(existingGoal?.title ?? '');
    const [description, setDescription] = useState(existingGoal?.description ?? '');
    const [notes, setNotes] = useState(existingGoal?.notes ?? '');
    const [category, setCategory] = useState(existingGoal?.category ?? defaultCategory ?? 'Travel');
    const [locationData, setLocationData] = useState<Location>(
        existingGoal?.location ?? { latitude: 0, longitude: 0, city: '', country: '' }
    );
    const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);
    const [image, setImage] = useState<string | null>(existingGoal?.image ?? null);
    const [date, setDate] = useState<Date>(() => {
        if (existingGoal?.timelineDate) {
            const d = new Date(existingGoal.timelineDate);
            return isNaN(d.getTime()) ? new Date() : d;
        }
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d;
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
        existingGoal?.priority ?? 'medium'
    );
    const [tags, setTags] = useState<string[]>(existingGoal?.tags ?? []);
    const [tagInput, setTagInput] = useState('');

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.6,
            });
            if (!result.canceled && result.assets?.[0]?.uri) {
                setImage(result.assets[0].uri);
            }
        } catch {
            Alert.alert('Error', 'Could not open image picker.');
        }
    };

    const uploadImage = async (localUri: string, goalId: string): Promise<string> => {
        try {
            const session = await supabase.auth.getSession();
            if (!session?.data?.session) return localUri;
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
            return data?.publicUrl ?? localUri;
        } catch {
            return localUri;
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Title Required', 'Please enter a title for your adventure.');
            return;
        }

        // Past date validation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Invalid Date', 'Target date cannot be in the past.');
            return;
        }

        setSaving(true);

        const localImage = image ?? PLACEHOLDER_IMAGE;
        const safeLocation: Location =
            locationData && locationData.city
                ? locationData
                : { latitude: 0, longitude: 0, city: '', country: '' };

        const goalData = {
            title: title.trim(),
            description: description.trim(),
            category,
            image: localImage,
            timelineDate: date.toISOString(),
            notes: notes.trim(),
            location: safeLocation,
            priority,
            tags,
        };

        try {
            if (isEditMode && existingGoal) {
                await updateGoal(existingGoal.id, goalData);
                if (localImage.startsWith('file://')) {
                    uploadImage(localImage, existingGoal.id)
                        .then(remoteUrl => {
                            if (remoteUrl !== localImage) {
                                updateGoal(existingGoal.id, { image: remoteUrl });
                            }
                        })
                        .catch(() => {});
                }
            } else {
                // addGoal returns the generated id
                const createdId = await addGoal(goalData);

                if (localImage.startsWith('file://') && createdId) {
                    uploadImage(localImage, createdId)
                        .then(remoteUrl => {
                            if (remoteUrl !== localImage && createdId) {
                                updateGoal(createdId, { image: remoteUrl });
                            }
                        })
                        .catch(() => {});
                }

                if (createdId) {
                    scheduleGoalReminders({
                        goalId: createdId,
                        goalTitle: goalData.title,
                        targetDate: date,
                    }).catch(() => {});
                }
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Could not save goal. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScreenWrapper bgClass="dark:bg-black bg-slate-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
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
                    <Text className="dark:text-white text-gray-900 font-semibold text-lg">
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

                    {/* Priority */}
                    <View className="mb-7">
                        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
                            Priority
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {(['low', 'medium', 'high'] as const).map(p => {
                                const colors = {
                                    low: '#4ade80',
                                    medium: '#eab308',
                                    high: '#ef4444',
                                };
                                const active = priority === p;
                                return (
                                    <TouchableOpacity
                                        key={p}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setPriority(p);
                                        }}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 10,
                                            borderRadius: 12,
                                            borderWidth: 1.5,
                                            alignItems: 'center',
                                            borderColor: active
                                                ? colors[p]
                                                : 'rgba(255,255,255,0.1)',
                                            backgroundColor: active
                                                ? `${colors[p]}20`
                                                : 'rgba(255,255,255,0.03)',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: active ? colors[p] : 'rgba(255,255,255,0.4)',
                                                fontWeight: '600',
                                                fontSize: 13,
                                                textTransform: 'capitalize',
                                            }}
                                        >
                                            {p}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Tags */}
                    <View className="mb-7">
                        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">
                            Tags
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                gap: 8,
                                marginBottom: 8,
                            }}
                        >
                            {tags.map((tag, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => setTags(tags.filter((_, j) => j !== i))}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: 'rgba(96,165,250,0.15)',
                                        borderRadius: 99,
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        gap: 4,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#60a5fa',
                                            fontSize: 12,
                                            fontWeight: '600',
                                        }}
                                    >
                                        #{tag}
                                    </Text>
                                    <MaterialIcons name="close" size={12} color="#60a5fa" />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            className="dark:text-white text-gray-900 text-base bg-white/5 rounded-2xl px-4 py-3 border dark:border-white/10 border-black/10"
                            placeholder="Add tag, press space..."
                            placeholderTextColor="#4b5563"
                            value={tagInput}
                            onChangeText={v => {
                                if (v.endsWith(' ') || v.endsWith(',')) {
                                    const t = v.replace(/[, ]+$/, '').trim();
                                    if (t && !tags.includes(t)) setTags([...tags, t]);
                                    setTagInput('');
                                } else setTagInput(v);
                            }}
                            onSubmitEditing={() => {
                                const t = tagInput.trim();
                                if (t && !tags.includes(t)) setTags([...tags, t]);
                                setTagInput('');
                            }}
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
                                className={`flex-1 text-base ml-2 ${locationData?.city ? 'dark:text-white text-gray-900' : 'text-gray-500'}`}
                            >
                                {locationData?.city
                                    ? `${locationData.city}${locationData.country ? `, ${locationData.country}` : ''}`
                                    : Platform.OS === 'web'
                                      ? 'Enter location'
                                      : 'Pick on map'}
                            </Text>
                            {locationData?.city ? (
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
                                {date.toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                })}
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
                                        <Text className="text-white text-xs ml-1">Change</Text>
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
                    initialLocation={locationData?.latitude !== 0 ? locationData : undefined}
                />
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}
