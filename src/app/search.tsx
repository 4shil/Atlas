import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGoalStore, Goal } from '../store/useGoalStore';
import { LinearGradient } from 'expo-linear-gradient';

const HISTORY_KEY = 'atlas-search-history';
const MAX_HISTORY = 10;

const CATEGORIES = [
    'All',
    'Travel',
    'Career',
    'Health',
    'Fitness',
    'Education',
    'Finance',
    'Relationships',
    'Personal',
    'Creative',
    'Adventure',
];
const STATUS_FILTERS = ['All', 'Pending', 'Completed'];

function highlightText(text: string, query: string) {
    if (!query.trim()) return [{ text, highlighted: false }];
    const parts: { text: string; highlighted: boolean }[] = [];
    const lower = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let lastIndex = 0;
    let idx = lower.indexOf(lowerQuery);
    while (idx !== -1) {
        if (idx > lastIndex) parts.push({ text: text.slice(lastIndex, idx), highlighted: false });
        parts.push({ text: text.slice(idx, idx + query.length), highlighted: true });
        lastIndex = idx + query.length;
        idx = lower.indexOf(lowerQuery, lastIndex);
    }
    if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), highlighted: false });
    return parts;
}

function HighlightedText({ text, query, style }: { text: string; query: string; style?: any }) {
    const parts = highlightText(text, query);
    return (
        <Text style={style} numberOfLines={2}>
            {parts.map((p, i) =>
                p.highlighted ? (
                    <Text key={i} style={[style, styles.highlight]}>
                        {p.text}
                    </Text>
                ) : (
                    <Text key={i}>{p.text}</Text>
                )
            )}
        </Text>
    );
}

function SearchResultCard({
    goal,
    query,
    onPress,
}: {
    goal: Goal;
    query: string;
    onPress: () => void;
}) {
    const matchedField = useMemo(() => {
        const q = query.toLowerCase();
        if (goal.title.toLowerCase().includes(q)) return 'title';
        if (goal.description.toLowerCase().includes(q)) return 'description';
        if (goal.notes.toLowerCase().includes(q)) return 'notes';
        if (goal.location.city.toLowerCase().includes(q)) return 'city';
        return 'country';
    }, [goal, query]);

    const snippet =
        matchedField === 'title'
            ? goal.title
            : matchedField === 'description'
              ? goal.description
              : matchedField === 'notes'
                ? goal.notes
                : matchedField === 'city'
                  ? goal.location.city
                  : goal.location.country;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.resultCard}
            accessibilityLabel={`Goal: ${goal.title}`}
            accessibilityRole="button"
        >
            <Image
                source={goal.image}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={200}
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.92)']}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.resultContent}>
                <View style={styles.resultMeta}>
                    <View
                        style={[
                            styles.resultBadge,
                            { backgroundColor: goal.completed ? '#4ade8020' : '#3b82f620' },
                        ]}
                    >
                        <Text
                            style={[
                                styles.resultBadgeText,
                                { color: goal.completed ? '#4ade80' : '#3b82f6' },
                            ]}
                        >
                            {goal.completed ? '✓ Done' : goal.category}
                        </Text>
                    </View>
                </View>
                <HighlightedText
                    text={goal.title}
                    query={matchedField === 'title' ? query : ''}
                    style={styles.resultTitle}
                />
                {matchedField !== 'title' && snippet ? (
                    <HighlightedText text={snippet} query={query} style={styles.resultSnippet} />
                ) : null}
                {goal.location.city ? (
                    <View style={styles.resultLocation}>
                        <MaterialIcons name="place" size={11} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.resultLocationText}>
                            {goal.location.city}
                            {goal.location.country ? `, ${goal.location.country}` : ''}
                        </Text>
                    </View>
                ) : null}
            </View>
        </TouchableOpacity>
    );
}

export default function SearchScreen() {
    const { goals } = useGoalStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        AsyncStorage.getItem(HISTORY_KEY).then(raw => {
            if (raw) setHistory(JSON.parse(raw));
        });
    }, []);

    const saveHistory = useCallback(
        async (term: string) => {
            const trimmed = term.trim();
            if (!trimmed) return;
            const updated = [trimmed, ...history.filter(h => h !== trimmed)].slice(0, MAX_HISTORY);
            setHistory(updated);
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        },
        [history]
    );

    const clearHistory = useCallback(async () => {
        setHistory([]);
        await AsyncStorage.removeItem(HISTORY_KEY);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);

    const results = useMemo(() => {
        const q = query.toLowerCase().trim();
        return goals.filter(goal => {
            if (selectedCategory !== 'All' && goal.category !== selectedCategory) return false;
            if (statusFilter === 'Pending' && goal.completed) return false;
            if (statusFilter === 'Completed' && !goal.completed) return false;
            if (!q) return true;
            return (
                goal.title.toLowerCase().includes(q) ||
                goal.description.toLowerCase().includes(q) ||
                goal.notes.toLowerCase().includes(q) ||
                goal.location.city.toLowerCase().includes(q) ||
                goal.location.country.toLowerCase().includes(q)
            );
        });
    }, [goals, query, selectedCategory, statusFilter]);

    const handleGoalPress = useCallback(
        (goal: Goal) => {
            Haptics.selectionAsync();
            saveHistory(query);
            router.push({ pathname: '/goal-detail', params: { id: goal.id } });
        },
        [router, query, saveHistory]
    );

    const handleSubmitSearch = useCallback(() => {
        if (query.trim()) saveHistory(query);
    }, [query, saveHistory]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtn}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <MaterialIcons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <MaterialIcons name="search" size={18} color="rgba(255,255,255,0.4)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search goals, places, notes..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSubmitSearch}
                        autoFocus
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setQuery('')}
                            accessibilityLabel="Clear search"
                        >
                            <MaterialIcons name="close" size={16} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
            >
                {STATUS_FILTERS.map(s => (
                    <TouchableOpacity
                        key={s}
                        onPress={() => {
                            setStatusFilter(s);
                            Haptics.selectionAsync();
                        }}
                        style={[styles.chip, statusFilter === s && styles.chipActive]}
                    >
                        <Text
                            style={[styles.chipText, statusFilter === s && styles.chipTextActive]}
                        >
                            {s}
                        </Text>
                    </TouchableOpacity>
                ))}
                <View style={styles.separator} />
                {CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => {
                            setSelectedCategory(cat);
                            Haptics.selectionAsync();
                        }}
                        style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                selectedCategory === cat && styles.chipTextActive,
                            ]}
                        >
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                contentContainerStyle={styles.resultsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Recent searches (shown when no query) */}
                {!query.trim() && history.length > 0 && (
                    <View style={styles.historySection}>
                        <View style={styles.historyHeader}>
                            <Text style={styles.historyTitle}>Recent Searches</Text>
                            <TouchableOpacity
                                onPress={clearHistory}
                                accessibilityLabel="Clear search history"
                            >
                                <Text style={styles.clearText}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.historyChips}>
                            {history.map((term, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => {
                                        setQuery(term);
                                        Haptics.selectionAsync();
                                    }}
                                    style={styles.historyChip}
                                    accessibilityLabel={`Search for ${term}`}
                                >
                                    <MaterialIcons
                                        name="history"
                                        size={13}
                                        color="rgba(255,255,255,0.4)"
                                    />
                                    <Text style={styles.historyChipText}>{term}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Results count */}
                {query.trim().length > 0 && (
                    <Text style={styles.resultCount}>
                        {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}
                        &quot;
                    </Text>
                )}

                {/* Results */}
                {query.trim().length > 0 ? (
                    results.length > 0 ? (
                        results.map(goal => (
                            <SearchResultCard
                                key={goal.id}
                                goal={goal}
                                query={query}
                                onPress={() => handleGoalPress(goal)}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialIcons
                                name="search-off"
                                size={56}
                                color="rgba(255,255,255,0.1)"
                            />
                            <Text style={styles.emptyTitle}>No results found</Text>
                            <Text style={styles.emptySubtitle}>
                                Try a different search term or remove filters
                            </Text>
                        </View>
                    )
                ) : history.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons
                            name="travel-explore"
                            size={56}
                            color="rgba(255,255,255,0.08)"
                        />
                        <Text style={styles.emptyTitle}>Search your atlas</Text>
                        <Text style={styles.emptySubtitle}>
                            Find goals by title, location, notes, or description
                        </Text>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#04040a' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 8,
        gap: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.07)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchInput: { flex: 1, color: 'white', fontSize: 15, padding: 0 },
    filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 99,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: 'white' },
    separator: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
        marginHorizontal: 4,
        borderRadius: 1,
    },
    resultsList: { padding: 16, paddingBottom: 100 },
    resultCard: {
        height: 140,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#111',
        marginBottom: 12,
    },
    resultContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
    resultMeta: { flexDirection: 'row', marginBottom: 6 },
    resultBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    resultBadgeText: { fontSize: 10, fontWeight: '700' },
    resultTitle: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 4 },
    resultSnippet: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 },
    resultLocation: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    resultLocationText: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
    highlight: { color: '#fbbf24', fontWeight: '800' },
    historySection: { marginBottom: 20 },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    historyTitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    clearText: { color: '#3b82f6', fontSize: 12, fontWeight: '600' },
    historyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    historyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 99,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    historyChipText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
    resultCount: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 12 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
    emptyTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 18, fontWeight: '700' },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.25)',
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 18,
    },
});
