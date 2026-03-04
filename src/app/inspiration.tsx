import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useGoalStore } from '../store/useGoalStore';
import { ScreenWrapper } from '../components/ScreenWrapper';

// Curated bucket list destinations with categories
const INSPIRATIONS = [
    {
        id: 'i1',
        title: 'Northern Lights in Iceland',
        category: 'Travel',
        description: "Chase the aurora borealis across Iceland's volcanic landscape.",
        image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80',
        location: { latitude: 64.9631, longitude: -19.0208, city: 'Reykjavik', country: 'Iceland' },
    },
    {
        id: 'i2',
        title: 'Safari in the Serengeti',
        category: 'Adventures',
        description: 'Witness the Great Migration across the Tanzanian savanna.',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80',
        location: { latitude: -2.3333, longitude: 34.8333, city: 'Serengeti', country: 'Tanzania' },
    },
    {
        id: 'i3',
        title: 'Street Food Tour in Bangkok',
        category: 'Foodie',
        description: 'Devour pad thai, mango sticky rice, and boat noodles from roadside stalls.',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
        location: { latitude: 13.7563, longitude: 100.5018, city: 'Bangkok', country: 'Thailand' },
    },
    {
        id: 'i4',
        title: 'Overwater Bungalow in Bora Bora',
        category: 'Stays',
        description: 'Wake up above crystal-clear turquoise lagoon in French Polynesia.',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80',
        location: {
            latitude: -16.5004,
            longitude: -151.7415,
            city: 'Bora Bora',
            country: 'French Polynesia',
        },
    },
    {
        id: 'i5',
        title: 'Hike Machu Picchu',
        category: 'Adventures',
        description: 'Trek the Inca Trail and reach the Sun Gate at sunrise.',
        image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80',
        location: { latitude: -13.1631, longitude: -72.545, city: 'Cusco', country: 'Peru' },
    },
    {
        id: 'i6',
        title: 'Cherry Blossoms in Kyoto',
        category: 'Travel',
        description: 'Walk beneath pink sakura canopies in ancient temple gardens.',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80',
        location: { latitude: 35.0116, longitude: 135.7681, city: 'Kyoto', country: 'Japan' },
    },
    {
        id: 'i7',
        title: 'Italian Truffle Dinner',
        category: 'Foodie',
        description: 'Savour hand-shaved truffle pasta in a Piedmont farmhouse.',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
        location: { latitude: 44.8015, longitude: 8.0161, city: 'Alba', country: 'Italy' },
    },
    {
        id: 'i8',
        title: 'Glacier Hike in Patagonia',
        category: 'Adventures',
        description: "Crampons on ice at Perito Moreno, one of Earth's last advancing glaciers.",
        image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&q=80',
        location: {
            latitude: -50.496,
            longitude: -73.1468,
            city: 'El Calafate',
            country: 'Argentina',
        },
    },
    {
        id: 'i9',
        title: 'Santorini Sunset Stay',
        category: 'Stays',
        description: 'Blue domes and orange horizons from a cliffside suite in Oia.',
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80',
        location: { latitude: 36.4618, longitude: 25.3753, city: 'Santorini', country: 'Greece' },
    },
    {
        id: 'i10',
        title: 'Dive the Great Blue Hole',
        category: 'Adventures',
        description: "Plunge into Belize's underwater sinkhole, a UNESCO World Heritage site.",
        image: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=600&q=80',
        location: { latitude: 17.3165, longitude: -87.534, city: 'Belize City', country: 'Belize' },
    },
    {
        id: 'i11',
        title: 'Ramen Crawl in Sapporo',
        category: 'Foodie',
        description: "Miso, shio, shoyu — bowl after bowl in Japan's ramen capital.",
        image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80',
        location: { latitude: 43.0618, longitude: 141.3545, city: 'Sapporo', country: 'Japan' },
    },
    {
        id: 'i12',
        title: 'The Trans-Siberian Railway',
        category: 'Travel',
        description: "Nine time zones, 9,289 km, and the world's longest railway journey.",
        image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80',
        location: { latitude: 55.7558, longitude: 37.6176, city: 'Moscow', country: 'Russia' },
    },
];

const FILTERS = ['All', 'Travel', 'Adventures', 'Foodie', 'Stays'];

export default function Inspiration() {
    const router = useRouter();
    const { addGoal, goals } = useGoalStore();
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [added, setAdded] = useState<Set<string>>(new Set());

    const goalTitles = new Set(goals.map(g => g.title.toLowerCase()));
    const isExisting = (title: string) => goalTitles.has(title.toLowerCase());

    const filtered = INSPIRATIONS.filter(item => {
        const matchCat = activeFilter === 'All' || item.category === activeFilter;
        const matchSearch =
            !search ||
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const handleAdd = (item: (typeof INSPIRATIONS)[0]) => {
        if (isExisting(item.title) || added.has(item.id)) return;
        addGoal({
            title: item.title,
            description: item.description,
            category: item.category,
            image: item.image,
            timelineDate: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
            ).toISOString(),
            notes: '',
            location: item.location,
        });
        setAdded(prev => new Set([...prev, item.id]));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const categoryIcon = (cat: string) => {
        switch (cat) {
            case 'Travel':
                return 'flight';
            case 'Adventures':
                return 'hiking';
            case 'Foodie':
                return 'restaurant';
            case 'Stays':
                return 'hotel';
            default:
                return 'place';
        }
    };

    return (
        <ScreenWrapper bgClass="dark:bg-black bg-slate-50" edges={[]}>
            <SafeAreaView edges={['top']} className="z-10">
                <View className="px-6 pt-3 pb-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center"
                            onPress={() => router.back()}
                        >
                            <MaterialIcons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                        <View className="flex-1 ml-4">
                            <Text className="text-white text-xl font-bold">Inspiration</Text>
                            <Text className="text-gray-500 text-xs">Tap + to add to your list</Text>
                        </View>
                    </View>

                    {/* Search */}
                    <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-4">
                        <MaterialIcons name="search" size={18} color="#6b7280" />
                        <TextInput
                            className="flex-1 text-white text-sm ml-2"
                            placeholder="Search destinations..."
                            placeholderTextColor="#4b5563"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>

                    {/* Category Filters */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {FILTERS.map(f => (
                            <TouchableOpacity
                                key={f}
                                className={`px-4 py-2 rounded-full mr-2 border ${activeFilter === f ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10'}`}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setActiveFilter(f);
                                }}
                            >
                                <Text
                                    className={`text-xs font-medium ${activeFilter === f ? 'text-white' : 'text-gray-400'}`}
                                >
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </SafeAreaView>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, paddingTop: 8 }}
            >
                <Text className="text-gray-400 text-xs mb-4">{filtered.length} destinations</Text>
                {filtered.map(item => {
                    const isAdded = added.has(item.id) || isExisting(item.title);
                    return (
                        <View
                            key={item.id}
                            className="rounded-3xl overflow-hidden mb-4 border border-white/8 bg-gray-950"
                        >
                            {/* Image */}
                            <View className="h-48 relative">
                                <Image
                                    source={{ uri: item.image }}
                                    className="absolute inset-0 w-full h-full"
                                    resizeMode="cover"
                                />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                                    className="absolute inset-0"
                                />
                                {/* Category chip */}
                                <View className="absolute top-4 left-4 bg-black/50 border border-white/15 px-3 py-1 rounded-full flex-row items-center">
                                    <MaterialIcons
                                        name={categoryIcon(item.category) as any}
                                        size={12}
                                        color="white"
                                    />
                                    <Text className="text-white text-xs ml-1.5 font-medium">
                                        {item.category}
                                    </Text>
                                </View>
                                {/* Location chip */}
                                <View className="absolute bottom-4 left-4 flex-row items-center">
                                    <MaterialIcons name="place" size={14} color="#60a5fa" />
                                    <Text className="text-blue-300 text-xs ml-1 font-medium">
                                        {item.location.city}, {item.location.country}
                                    </Text>
                                </View>
                            </View>

                            {/* Card body */}
                            <View className="p-4 flex-row items-start">
                                <View className="flex-1 mr-3">
                                    <Text className="text-white font-bold text-base mb-1">
                                        {item.title}
                                    </Text>
                                    <Text
                                        className="text-gray-400 text-sm leading-5"
                                        numberOfLines={2}
                                    >
                                        {item.description}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    className={`w-12 h-12 rounded-2xl items-center justify-center ${isAdded ? 'bg-green-900/50 border border-green-700/50' : 'bg-blue-600'}`}
                                    onPress={() => handleAdd(item)}
                                    disabled={isAdded}
                                >
                                    <MaterialIcons
                                        name={isAdded ? 'check' : 'add'}
                                        size={24}
                                        color={isAdded ? '#4ade80' : 'white'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </ScreenWrapper>
    );
}
