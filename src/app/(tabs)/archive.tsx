import React, { useState, useMemo } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGoalStore, Goal } from '../../store/useGoalStore';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Confetti } from '../../components/Confetti';

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
}

function getMonthName(month: number): string {
    return new Date(2000, month).toLocaleString('default', { month: 'long' });
}

type GroupedGoals = {
    year: number;
    months: {
        month: number;
        goals: Goal[];
    }[];
}[];

export default function ArchiveScreen() {
    const { getCompletedGoals } = useGoalStore();
    const deleteGoal = useGoalStore(s => s.deleteGoal);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const allCompleted = getCompletedGoals();

    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
    const [celebGoal, setCelebGoal] = useState<Goal | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Group by Year → Month
    const grouped: GroupedGoals = useMemo(() => {
        const map: Record<number, Record<number, Goal[]>> = {};
        for (const goal of allCompleted) {
            const date = new Date(goal.completedAt ?? goal.createdAt);
            const year = date.getFullYear();
            const month = date.getMonth();
            if (!map[year]) map[year] = {};
            if (!map[year][month]) map[year][month] = [];
            map[year][month].push(goal);
        }
        return Object.entries(map)
            .map(([year, months]) => ({
                year: Number(year),
                months: Object.entries(months)
                    .map(([month, goals]) => ({ month: Number(month), goals }))
                    .sort((a, b) => b.month - a.month),
            }))
            .sort((a, b) => b.year - a.year);
    }, [allCompleted]);

    // Count goals this year
    const thisYear = new Date().getFullYear();
    const goalsThisYear = allCompleted.filter(g => {
        const d = new Date(g.completedAt ?? g.createdAt);
        return d.getFullYear() === thisYear;
    }).length;

    const toggleSection = (key: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCollapsedSections(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleCelebrate = (goal: Goal) => {
        setCelebGoal(goal);
        setShowConfetti(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    if (allCompleted.length === 0) {
        return (
            <ScreenWrapper bgClass="dark:bg-black bg-slate-50">
                <View style={[styles.emptyContainer, { paddingTop: insets.top + 20 }]}>
                    <MaterialIcons
                        name="check-circle-outline"
                        size={64}
                        color="rgba(255,255,255,0.1)"
                    />
                    <Text style={styles.emptyTitle}>No completed goals yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Complete your first goal and it will appear here
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bgClass="dark:bg-black bg-slate-50">
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.overline}>YOUR JOURNEY</Text>
                        <Text style={styles.title}>Archive</Text>
                    </View>
                    <View style={styles.totalBadge}>
                        <MaterialIcons name="check-circle" size={14} color="#4ade80" />
                        <Text style={styles.totalCount}>{allCompleted.length}</Text>
                    </View>
                </View>

                {/* This year banner */}
                {goalsThisYear > 0 && (
                    <View style={styles.yearBanner}>
                        <MaterialIcons name="emoji-events" size={18} color="#fbbf24" />
                        <Text style={styles.yearBannerText}>
                            {"You've completed "}
                            <Text style={{ color: '#fbbf24', fontWeight: '800' }}>
                                {goalsThisYear} goal{goalsThisYear > 1 ? 's' : ''}
                            </Text>
                            {' this year 🎉'}
                        </Text>
                    </View>
                )}

                {/* Timeline */}
                {grouped.map(({ year, months }) => (
                    <View key={year}>
                        {/* Year heading */}
                        <View style={styles.yearRow}>
                            <View style={styles.yearLine} />
                            <View style={styles.yearBubble}>
                                <Text style={styles.yearText}>{year}</Text>
                            </View>
                            <View style={styles.yearLine} />
                        </View>

                        {months.map(({ month, goals: monthGoals }) => {
                            const sectionKey = `${year}-${month}`;
                            const isCollapsed = collapsedSections.has(sectionKey);

                            return (
                                <View key={sectionKey} style={styles.monthSection}>
                                    {/* Month header */}
                                    <TouchableOpacity
                                        onPress={() => toggleSection(sectionKey)}
                                        style={styles.monthHeader}
                                        accessibilityLabel={`${isCollapsed ? 'Expand' : 'Collapse'} ${getMonthName(month)} ${year}`}
                                        accessibilityRole="button"
                                    >
                                        {/* Timeline dot */}
                                        <View style={styles.timelineDot} />
                                        <Text style={styles.monthLabel}>{getMonthName(month)}</Text>
                                        <View style={styles.monthBadge}>
                                            <Text style={styles.monthCount}>
                                                {monthGoals.length}
                                            </Text>
                                        </View>
                                        <MaterialIcons
                                            name={
                                                isCollapsed
                                                    ? 'keyboard-arrow-down'
                                                    : 'keyboard-arrow-up'
                                            }
                                            size={18}
                                            color="rgba(255,255,255,0.3)"
                                        />
                                    </TouchableOpacity>

                                    {/* Goals */}
                                    {!isCollapsed &&
                                        monthGoals.map((goal, idx) => (
                                            <View key={goal.id} style={styles.goalRow}>
                                                {/* Timeline line */}
                                                <View style={styles.timelineTrack}>
                                                    <View
                                                        style={[
                                                            styles.timelineLine,
                                                            idx === monthGoals.length - 1 && {
                                                                opacity: 0,
                                                            },
                                                        ]}
                                                    />
                                                </View>

                                                <TouchableOpacity
                                                    style={styles.goalCard}
                                                    onPress={() => {
                                                        Haptics.impactAsync(
                                                            Haptics.ImpactFeedbackStyle.Light
                                                        );
                                                        router.push({
                                                            pathname: '/goal-detail',
                                                            params: { id: goal.id },
                                                        });
                                                    }}
                                                    activeOpacity={0.8}
                                                    accessibilityLabel={`Goal: ${goal.title}`}
                                                    accessibilityRole="button"
                                                >
                                                    <Image
                                                        source={goal.image}
                                                        style={styles.goalImage}
                                                        contentFit="cover"
                                                        transition={200}
                                                    />
                                                    <LinearGradient
                                                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                                                        style={StyleSheet.absoluteFillObject}
                                                    />
                                                    <View style={styles.goalCardContent}>
                                                        <View style={styles.goalCardTop}>
                                                            <View style={styles.categoryBadge}>
                                                                <Text style={styles.categoryText}>
                                                                    {goal.category}
                                                                </Text>
                                                            </View>
                                                            <TouchableOpacity
                                                                onPress={e => {
                                                                    e.stopPropagation();
                                                                    handleCelebrate(goal);
                                                                }}
                                                                style={styles.celebrateBtn}
                                                                accessibilityLabel="Replay celebration"
                                                                accessibilityRole="button"
                                                            >
                                                                <Text style={{ fontSize: 16 }}>
                                                                    🎉
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                        <Text
                                                            style={styles.goalTitle}
                                                            numberOfLines={2}
                                                        >
                                                            {goal.title}
                                                        </Text>
                                                        <View style={styles.goalMeta}>
                                                            {goal.location.city ? (
                                                                <View style={styles.metaItem}>
                                                                    <MaterialIcons
                                                                        name="place"
                                                                        size={11}
                                                                        color="rgba(255,255,255,0.4)"
                                                                    />
                                                                    <Text style={styles.metaText}>
                                                                        {goal.location.city}
                                                                    </Text>
                                                                </View>
                                                            ) : null}
                                                            <Text style={styles.timeAgoText}>
                                                                Completed{' '}
                                                                {timeAgo(
                                                                    goal.completedAt ??
                                                                        goal.createdAt
                                                                )}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                </View>
                            );
                        })}
                    </View>
                ))}

                <View style={{ height: 100 }} />

                <TouchableOpacity
                    onPress={() =>
                        Alert.alert(
                            'Clear All Completed?',
                            'This will delete all completed goals.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Clear All',
                                    style: 'destructive',
                                    onPress: () => {
                                        getCompletedGoals().forEach((g: any) => deleteGoal(g.id));
                                    },
                                },
                            ]
                        )
                    }
                    style={{
                        margin: 24,
                        backgroundColor: 'rgba(239,68,68,0.12)',
                        borderRadius: 16,
                        padding: 16,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: 'rgba(239,68,68,0.25)',
                    }}
                >
                    <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 14 }}>
                        🗑 Clear All Completed
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Confetti celebration */}
            <Confetti
                visible={showConfetti}
                onDone={() => {
                    setShowConfetti(false);
                    setCelebGoal(null);
                }}
            />
            {showConfetti && celebGoal && (
                <View style={styles.celebOverlay} pointerEvents="none">
                    <Text style={styles.celebTitle}>🎉 {celebGoal.title}</Text>
                    <Text style={styles.celebSub}>Achievement unlocked!</Text>
                </View>
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scroll: { paddingHorizontal: 20 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    overline: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
    title: { color: 'white', fontSize: 28, fontWeight: '800', marginTop: 2 },
    totalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#4ade8020',
        borderRadius: 99,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#4ade8030',
    },
    totalCount: { color: '#4ade80', fontSize: 14, fontWeight: '800' },
    yearBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(251,191,36,0.08)',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(251,191,36,0.15)',
        marginBottom: 24,
    },
    yearBannerText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, flex: 1 },
    yearRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    yearLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
    yearBubble: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 99,
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    yearText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
    monthSection: { marginBottom: 16 },
    monthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        paddingLeft: 28,
    },
    timelineDot: {
        position: 'absolute',
        left: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3b82f6',
        borderWidth: 2,
        borderColor: '#04040a',
    },
    monthLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '700', flex: 1 },
    monthBadge: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 99,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    monthCount: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700' },
    goalRow: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 10 },
    timelineTrack: { width: 28, alignItems: 'center', paddingTop: 8 },
    timelineLine: {
        position: 'absolute',
        top: 0,
        bottom: -10,
        left: 12,
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    goalCard: {
        flex: 1,
        height: 130,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#111',
    },
    goalImage: { ...StyleSheet.absoluteFillObject },
    goalCardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
    goalCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    categoryBadge: {
        backgroundColor: 'rgba(74,222,128,0.15)',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#4ade8030',
    },
    categoryText: { color: '#4ade80', fontSize: 9, fontWeight: '700' },
    celebrateBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalTitle: { color: 'white', fontSize: 14, fontWeight: '700', lineHeight: 18, marginBottom: 6 },
    goalMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    metaText: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
    timeAgoText: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 12,
    },
    emptyTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 18, fontWeight: '700' },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    celebOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    celebTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: '800',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    celebSub: { color: 'rgba(255,255,255,0.7)', fontSize: 15, marginTop: 4 },
});
