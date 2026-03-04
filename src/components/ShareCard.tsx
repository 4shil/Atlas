import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Goal } from '../store/useGoalStore';

interface ShareCardProps {
    goal: Goal;
}

export const ShareCard = React.forwardRef<View, ShareCardProps>(({ goal }, ref) => {
    const daysLeft = goal.completedAt
        ? Math.round(
              (new Date(goal.completedAt).getTime() - new Date(goal.createdAt).getTime()) / 86400000
          )
        : null;

    return (
        <View ref={ref} style={styles.card} collapsable={false}>
            {/* Background Image */}
            {goal.image ? (
                <Image
                    source={goal.image}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                />
            ) : (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1a1a2e' }]} />
            )}

            {/* Dark overlay */}
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.85)']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Top: branding */}
            <View style={styles.topRow}>
                <View style={styles.brand}>
                    <MaterialIcons name="explore" size={16} color="white" />
                    <Text style={styles.brandText}>ATLAS</Text>
                </View>
                {goal.completed && (
                    <View style={styles.completedBadge}>
                        <MaterialIcons name="check-circle" size={13} color="#4ade80" />
                        <Text style={styles.completedText}>Achieved</Text>
                    </View>
                )}
            </View>

            {/* Bottom: goal info */}
            <View style={styles.bottom}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{goal.category}</Text>
                </View>
                <Text style={styles.goalTitle} numberOfLines={3}>
                    {goal.title}
                </Text>
                {goal.location.city ? (
                    <View style={styles.locationRow}>
                        <MaterialIcons name="place" size={13} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.locationText}>
                            {goal.location.city}
                            {goal.location.country ? `, ${goal.location.country}` : ''}
                        </Text>
                    </View>
                ) : null}
                {goal.description ? (
                    <Text style={styles.description} numberOfLines={2}>
                        {goal.description}
                    </Text>
                ) : null}
                <View style={styles.footer}>
                    {daysLeft !== null && (
                        <Text style={styles.footerText}>
                            {goal.completed
                                ? `Completed in ${daysLeft} days`
                                : `Target: ${new Date(goal.timelineDate).toLocaleDateString()}`}
                        </Text>
                    )}
                    <Text style={styles.watermark}>atlas.app</Text>
                </View>
            </View>
        </View>
    );
});

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
    card: {
        width: 360,
        height: 480,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    brandText: { color: 'white', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#4ade8020',
        borderWidth: 1,
        borderColor: '#4ade8040',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 99,
    },
    completedText: { color: '#4ade80', fontSize: 11, fontWeight: '700' },
    bottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
    },
    categoryBadge: {
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(59,130,246,0.4)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    categoryText: { color: '#60a5fa', fontSize: 10, fontWeight: '700' },
    goalTitle: {
        color: 'white',
        fontSize: 26,
        fontWeight: '800',
        lineHeight: 32,
        marginBottom: 10,
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    locationText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
    description: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 18, marginBottom: 12 },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    footerText: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
    watermark: { color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: '600' },
});
