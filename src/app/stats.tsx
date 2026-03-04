import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGoalStore } from '../store/useGoalStore';

const WORLD_COUNTRIES = 195;

function StatCard({
    label,
    value,
    sub,
    color = '#3b82f6',
}: {
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
}) {
    return (
        <View style={[styles.statCard, { borderColor: `${color}20` }]}>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
            {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
        </View>
    );
}

function BarChart({
    data,
    maxVal,
}: {
    data: { label: string; created: number; completed: number }[];
    maxVal: number;
}) {
    return (
        <View style={styles.barChart}>
            {data.map((item, i) => (
                <View key={i} style={styles.barGroup}>
                    <View style={styles.barPair}>
                        <View
                            style={[
                                styles.bar,
                                {
                                    height: Math.max(4, (item.created / maxVal) * 80),
                                    backgroundColor: '#3b82f640',
                                },
                            ]}
                        />
                        <View
                            style={[
                                styles.bar,
                                {
                                    height: Math.max(4, (item.completed / maxVal) * 80),
                                    backgroundColor: '#4ade80',
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.barLabel}>{item.label}</Text>
                </View>
            ))}
        </View>
    );
}

function PieSegments({ data }: { data: { label: string; count: number; color: string }[] }) {
    const total = data.reduce((s, d) => s + d.count, 0);
    if (total === 0) return <Text style={styles.noData}>No data</Text>;
    return (
        <View>
            {data.map((d, i) => (
                <View key={i} style={styles.pieRow}>
                    <View style={[styles.pieColor, { backgroundColor: d.color }]} />
                    <Text style={styles.pieLabel}>{d.label}</Text>
                    <Text style={styles.pieCount}>{d.count}</Text>
                    <View style={styles.pieBarBg}>
                        <View
                            style={[
                                styles.pieBarFill,
                                { width: `${(d.count / total) * 100}%`, backgroundColor: d.color },
                            ]}
                        />
                    </View>
                    <Text style={styles.piePct}>{Math.round((d.count / total) * 100)}%</Text>
                </View>
            ))}
        </View>
    );
}

const CATEGORY_COLORS: Record<string, string> = {
    Travel: '#3b82f6',
    Career: '#8b5cf6',
    Health: '#ef4444',
    Fitness: '#f97316',
    Education: '#06b6d4',
    Finance: '#eab308',
    Relationships: '#ec4899',
    Personal: '#14b8a6',
    Creative: '#a855f7',
    Adventure: '#22c55e',
};

export default function StatsScreen() {
    const { goals } = useGoalStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const stats = useMemo(() => {
        const completed = goals.filter(g => g.completed);
        const pending = goals.filter(g => !g.completed);
        const rate = goals.length === 0 ? 0 : Math.round((completed.length / goals.length) * 100);

        // Monthly chart — last 6 months
        const months: { label: string; created: number; completed: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.getMonth();
            const year = d.getFullYear();
            const label = d.toLocaleString('default', { month: 'short' });
            const created = goals.filter(g => {
                const c = new Date(g.createdAt);
                return c.getMonth() === month && c.getFullYear() === year;
            }).length;
            const completedInMonth = completed.filter(g => {
                if (!g.completedAt) return false;
                const c = new Date(g.completedAt);
                return c.getMonth() === month && c.getFullYear() === year;
            }).length;
            months.push({ label, created, completed: completedInMonth });
        }
        const maxMonthVal = Math.max(...months.map(m => Math.max(m.created, m.completed)), 1);

        // Category distribution
        const catCount: Record<string, number> = {};
        goals.forEach(g => {
            catCount[g.category] = (catCount[g.category] || 0) + 1;
        });
        const catData = Object.entries(catCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([label, count]) => ({ label, count, color: CATEGORY_COLORS[label] || '#666' }));

        // Streak calculation
        const activityDays = new Set<string>();
        goals.forEach(g => {
            activityDays.add(g.createdAt.slice(0, 10));
            if (g.completedAt) activityDays.add(g.completedAt.slice(0, 10));
        });
        const sortedDays = Array.from(activityDays).sort();
        let currentStreak = 0,
            longestStreak = 0,
            streak = 0;
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const hasToday = activityDays.has(today) || activityDays.has(yesterday);
        if (hasToday && sortedDays.length > 0) {
            let checkDay = hasToday ? (activityDays.has(today) ? today : yesterday) : today;
            while (activityDays.has(checkDay)) {
                currentStreak++;
                const prev = new Date(new Date(checkDay).getTime() - 86400000)
                    .toISOString()
                    .slice(0, 10);
                checkDay = prev;
            }
        }
        for (let i = 0; i < sortedDays.length; i++) {
            if (i === 0) {
                streak = 1;
            } else {
                const diff =
                    (new Date(sortedDays[i]).getTime() - new Date(sortedDays[i - 1]).getTime()) /
                    86400000;
                streak = diff === 1 ? streak + 1 : 1;
            }
            longestStreak = Math.max(longestStreak, streak);
        }

        // Monthly goals count (this month)
        const thisMonth = new Date();
        const goalsThisMonth = goals.filter(g => {
            const c = new Date(g.createdAt);
            return (
                c.getMonth() === thisMonth.getMonth() && c.getFullYear() === thisMonth.getFullYear()
            );
        }).length;

        // Avg days to complete
        const completedWithDates = completed.filter(g => g.completedAt);
        const avgDays =
            completedWithDates.length === 0
                ? 0
                : Math.round(
                      completedWithDates.reduce((sum, g) => {
                          const diff =
                              (new Date(g.completedAt!).getTime() -
                                  new Date(g.createdAt).getTime()) /
                              86400000;
                          return sum + Math.max(0, diff);
                      }, 0) / completedWithDates.length
                  );

        // Countries
        const countries = [
            ...new Set(
                completed
                    .filter(g => g.location.country && g.location.country !== 'Unknown Country')
                    .map(g => g.location.country)
            ),
        ];
        const cities = [
            ...new Set(
                completed
                    .filter(g => g.location.city && g.location.city !== 'Unknown City')
                    .map(g => g.location.city)
            ),
        ];
        const countryPct = Math.round((countries.length / WORLD_COUNTRIES) * 100);

        // Milestone messages
        let milestone = '';
        if (countries.length >= 50) milestone = "You've visited 50 countries! 🌍 Incredible!";
        else if (countries.length >= 25) milestone = "You've visited 25 countries! ✈️ Amazing!";
        else if (countries.length >= 10) milestone = "You've visited 10 countries! 🗺️ Keep going!";
        else if (countries.length >= 5) milestone = '5 countries down! 🌏 The world awaits!';
        else if (countries.length >= 1) milestone = 'First country unlocked! 🚀 Adventure begins!';

        return {
            completed,
            pending,
            rate,
            months,
            maxMonthVal,
            catData,
            currentStreak,
            longestStreak,
            goalsThisMonth,
            avgDays,
            countries,
            cities,
            countryPct,
            milestone,
        };
    }, [goals]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtn}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <MaterialIcons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.overline}>YOUR PROGRESS</Text>
                    <Text style={styles.title}>Statistics</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Core metrics */}
                <Text style={styles.sectionTitle}>OVERVIEW</Text>
                <View style={styles.statGrid}>
                    <StatCard label="Total Goals" value={goals.length} color="#3b82f6" />
                    <StatCard label="Completed" value={stats.completed.length} color="#4ade80" />
                    <StatCard label="Pending" value={stats.pending.length} color="#fbbf24" />
                    <StatCard label="Completion Rate" value={`${stats.rate}%`} color="#a855f7" />
                </View>

                {/* Streaks */}
                <Text style={styles.sectionTitle}>STREAKS & ACTIVITY</Text>
                <View style={styles.statGrid}>
                    <StatCard
                        label="Current Streak"
                        value={`${stats.currentStreak}d`}
                        sub="consecutive days"
                        color="#f97316"
                    />
                    <StatCard
                        label="Longest Streak"
                        value={`${stats.longestStreak}d`}
                        sub="all time"
                        color="#ef4444"
                    />
                    <StatCard
                        label="This Month"
                        value={stats.goalsThisMonth}
                        sub="goals added"
                        color="#06b6d4"
                    />
                    <StatCard
                        label="Avg to Complete"
                        value={stats.avgDays > 0 ? `${stats.avgDays}d` : '—'}
                        sub="days avg"
                        color="#8b5cf6"
                    />
                </View>

                {/* Monthly chart */}
                <Text style={styles.sectionTitle}>MONTHLY ACTIVITY</Text>
                <View style={styles.card}>
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#3b82f640' }]} />
                            <Text style={styles.legendText}>Created</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#4ade80' }]} />
                            <Text style={styles.legendText}>Completed</Text>
                        </View>
                    </View>
                    <BarChart data={stats.months} maxVal={stats.maxMonthVal} />
                </View>

                {/* Category distribution */}
                <Text style={styles.sectionTitle}>CATEGORY BREAKDOWN</Text>
                <View style={styles.card}>
                    {stats.catData.length > 0 ? (
                        <PieSegments data={stats.catData} />
                    ) : (
                        <Text style={styles.noData}>No goals yet</Text>
                    )}
                </View>

                {/* World progress */}
                <Text style={styles.sectionTitle}>WORLD PROGRESS</Text>
                <View style={styles.card}>
                    <View style={styles.worldRow}>
                        <View style={styles.worldStat}>
                            <Text style={styles.worldNum}>{stats.countries.length}</Text>
                            <Text style={styles.worldLabel}>Countries</Text>
                        </View>
                        <View style={styles.worldDivider} />
                        <View style={styles.worldStat}>
                            <Text style={styles.worldNum}>{stats.cities.length}</Text>
                            <Text style={styles.worldLabel}>Cities</Text>
                        </View>
                        <View style={styles.worldDivider} />
                        <View style={styles.worldStat}>
                            <Text style={styles.worldNum}>{stats.countryPct}%</Text>
                            <Text style={styles.worldLabel}>of World</Text>
                        </View>
                    </View>
                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${stats.countryPct}%` }]} />
                    </View>
                    <Text style={styles.progressLabel}>
                        {stats.countries.length} / {WORLD_COUNTRIES} countries visited
                    </Text>
                    {stats.milestone ? (
                        <View style={styles.milestoneBox}>
                            <Text style={styles.milestoneText}>{stats.milestone}</Text>
                        </View>
                    ) : null}
                    {stats.countries.length > 0 && (
                        <View style={styles.countriesList}>
                            {stats.countries.slice(0, 12).map((c, i) => (
                                <View key={i} style={styles.countryChip}>
                                    <Text style={styles.countryChipText}>{c}</Text>
                                </View>
                            ))}
                            {stats.countries.length > 12 && (
                                <View style={styles.countryChip}>
                                    <Text style={styles.countryChipText}>
                                        +{stats.countries.length - 12} more
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#04040a' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 8,
        paddingTop: 8,
        gap: 14,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.07)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overline: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
    title: { color: 'white', fontSize: 24, fontWeight: '800', marginTop: 2 },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    sectionTitle: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginTop: 24,
        marginBottom: 12,
    },
    statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    statValue: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
    statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
    statSub: { color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 2 },
    card: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    chartLegend: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 100 },
    barGroup: { flex: 1, alignItems: 'center', gap: 4 },
    barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
    bar: { width: 10, borderRadius: 4, minHeight: 4 },
    barLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '600' },
    pieRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    pieColor: { width: 10, height: 10, borderRadius: 5 },
    pieLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, width: 90 },
    pieCount: { color: 'white', fontSize: 12, fontWeight: '700', width: 24, textAlign: 'right' },
    pieBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    pieBarFill: { height: '100%', borderRadius: 3 },
    piePct: { color: 'rgba(255,255,255,0.4)', fontSize: 11, width: 32, textAlign: 'right' },
    noData: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
    worldRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
    worldStat: { alignItems: 'center' },
    worldNum: { color: 'white', fontSize: 28, fontWeight: '800' },
    worldLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
    worldDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
    progressBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },
    progressLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 12,
    },
    milestoneBox: {
        backgroundColor: '#3b82f615',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#3b82f630',
        marginBottom: 12,
    },
    milestoneText: { color: '#60a5fa', fontSize: 13, fontWeight: '600', textAlign: 'center' },
    countriesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
    countryChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    countryChipText: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
});
