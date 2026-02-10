import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../theme';
import { Goal, getGoalStatus, categoryMeta } from '../features/goals';

interface TimelineItemProps {
    item: Goal;
    index: number;
    isLast: boolean;
    onPress: (id: string) => void;
}

export default function TimelineItem({ item, index, isLast, onPress }: TimelineItemProps) {
    const { colors, typography, spacing, radius } = useTheme();

    const status = getGoalStatus(item);
    const category = categoryMeta[item.category];
    const date = new Date(item.timelineDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flexDirection: 'row',
            // No bottom margin here, handled by the line continuity logic or parent list
        },
        timelineColumn: {
            alignItems: 'center',
            width: 40,
            marginRight: spacing.component.sm,
        },
        lineTop: {
            width: 2,
            flex: 1,
            backgroundColor: colors.border.subtle,
            marginBottom: 4,
        },
        lineBottom: {
            width: 2,
            flex: 1,
            backgroundColor: isLast ? 'transparent' : colors.border.subtle,
            marginTop: 4,
        },
        dot: {
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: colors.background.primary,
            zIndex: 1,
        },
        cardContainer: {
            flex: 1,
            marginBottom: spacing.list.gap,
        },
        card: {
            backgroundColor: colors.background.secondary,
            borderRadius: radius.medium,
            overflow: 'hidden',
            flexDirection: 'row',
            height: 100,
        },
        image: {
            width: 100,
            height: '100%',
        },
        imagePlaceholder: {
            width: 100,
            height: '100%',
            backgroundColor: colors.background.tertiary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        content: {
            flex: 1,
            padding: spacing.component.sm,
            justifyContent: 'center',
        },
        date: {
            ...typography.caption,
            color: colors.text.secondary,
            marginBottom: 4,
        },
        title: {
            ...typography.headingSmall,
            color: colors.text.primary,
            marginBottom: 4,
        },
        location: {
            ...typography.caption,
            color: colors.text.secondary,
        },
        categoryBadge: {
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: colors.overlay.blur,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
        },
        categoryText: {
            fontSize: 10,
        },
    }), [colors, spacing, radius, typography, isLast]);

    return (
        <Animated.View
            style={styles.container}
            entering={FadeInRight.delay(index * 100).duration(400)}
        >
            <View style={styles.timelineColumn}>
                {/* 
                   For a continuous line, we can just have one line through the item.
                   But to center the dot, we might strictly separate top/bottom logic if heights vary.
                   Simple approach: Line is absolute and full height? 
                   Better: Top half and bottom half relative to the dot.
                */}
                <View style={[styles.lineTop, { opacity: index === 0 ? 0 : 1 }]} />
                <View style={[styles.dot, { backgroundColor: colors.status[status] }]} />
                <View style={styles.lineBottom} />
            </View>

            <Pressable style={styles.cardContainer} onPress={() => onPress(item.id)}>
                <View style={styles.card}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={{ fontSize: 32 }}>{category.emoji}</Text>
                        </View>
                    )}

                    <View style={styles.content}>
                        <Text style={styles.date}>{date}</Text>
                        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                        {item.location && (
                            <Text style={styles.location}>
                                📍 {item.location.city}
                            </Text>
                        )}
                    </View>

                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{category.emoji}</Text>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
}
