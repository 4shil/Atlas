import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { useGoalStore, Location } from '../store/useGoalStore';
import { LocationPicker } from '../components/LocationPicker';

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
        existingGoal ? new Date(existingGoal.timelineDate) : new Date(new Date().setMonth(new Date().getMonth() + 1))
    );
    const [showDatePicker, setShowDatePicker] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const categories = ['Travel', 'Adventures', 'Foodie', 'Stays', 'Milestone'];

    const handleSave = () => {
        if (!title.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        const placeholderImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';
        const goalData = {
            title: title.trim(),
            description: description.trim(),
            category,
            image: image || placeholderImage,
            timelineDate: date.toISOString(),
            notes: notes.trim(),
            location: locationData.latitude !== 0 ? locationData : {
                latitude: 0,
                longitude: 0,
                city: '',
                country: '',
            },
        };

        if (isEditMode && existingGoal) {
            updateGoal(existingGoal.id, goalData);
        } else {
            addGoal(goalData);
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
            <StatusBar style="light" />

            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-white/10">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center"
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
                >
                    <MaterialIcons name="close" size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-semibold text-lg">
                    {isEditMode ? 'Edit Adventure' : 'New Adventure'}
                </Text>
                <TouchableOpacity
                    className={`px-5 py-2 rounded-full ${title.trim() ? 'bg-blue-600' : 'bg-gray-800'}`}
                    onPress={handleSave}
                    disabled={!title.trim()}
                >
                    <Text className={`font-semibold ${title.trim() ? 'text-white' : 'text-gray-500'}`}>
                        {isEditMode ? 'Update' : 'Save'}
                    </Text>
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
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Title *</Text>
                    <TextInput
                        className="text-white text-3xl font-bold border-b border-white/20 pb-2"
                        placeholder="e.g. Ski in Niseko"
                        placeholderTextColor="#4b5563"
                        value={title}
                        onChangeText={setTitle}
                        autoFocus={!isEditMode}
                    />
                </View>

                {/* Category */}
                <View className="mb-7">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                className={`px-5 py-2.5 rounded-full mr-3 border ${category === cat ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10'}`}
                                onPress={() => { Haptics.selectionAsync(); setCategory(cat); }}
                            >
                                <Text className={`text-xs font-medium ${category === cat ? 'text-white' : 'text-gray-300'}`}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Description */}
                <View className="mb-7">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Description</Text>
                    <TextInput
                        className="text-white text-base bg-white/5 rounded-2xl p-4 border border-white/10"
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
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Notes</Text>
                    <TextInput
                        className="text-white text-base bg-white/5 rounded-2xl p-4 border border-white/10"
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
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Location</Text>
                    <TouchableOpacity
                        className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-4"
                        onPress={() => setIsLocationPickerVisible(true)}
                    >
                        <MaterialIcons name="place" size={20} color="#60a5fa" />
                        <Text className={`flex-1 text-base ml-2 ${locationData.city ? 'text-white' : 'text-gray-500'}`}>
                            {locationData.city ? `${locationData.city}, ${locationData.country}` : 'Pick on map'}
                        </Text>
                        {locationData.city ? (
                            <TouchableOpacity onPress={() => setLocationData({ latitude: 0, longitude: 0, city: '', country: '' })}>
                                <MaterialIcons name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        ) : (
                            <MaterialIcons name="chevron-right" size={20} color="#6b7280" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Target Date */}
                <View className="mb-7">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Target Date</Text>
                    <TouchableOpacity
                        className="flex-row items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-4"
                        onPress={() => setShowDatePicker(true)}
                    >
                        <MaterialIcons name="event" size={20} color="#60a5fa" />
                        <Text className="flex-1 text-white text-base ml-2">
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
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Cover Image</Text>
                    <TouchableOpacity
                        className="bg-white/5 rounded-2xl border border-white/10 h-48 justify-center items-center overflow-hidden"
                        onPress={pickImage}
                    >
                        {image ? (
                            <>
                                <Image source={image} className="w-full h-full" contentFit="cover" />
                                <View className="absolute bottom-3 right-3 bg-black/60 rounded-full px-3 py-1 flex-row items-center">
                                    <MaterialIcons name="edit" size={14} color="white" />
                                    <Text className="text-white text-xs ml-1">Change</Text>
                                </View>
                            </>
                        ) : (
                            <View className="items-center">
                                <MaterialIcons name="add-a-photo" size={32} color="#9ca3af" />
                                <Text className="text-gray-400 mt-2 text-sm font-medium">Select a photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <LocationPicker
                visible={isLocationPickerVisible}
                onClose={() => setIsLocationPickerVisible(false)}
                onSelect={(loc) => setLocationData({ ...loc })}
                initialLocation={locationData.latitude !== 0 ? locationData : undefined}
            />
        </SafeAreaView>
    );
}
