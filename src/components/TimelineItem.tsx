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
    const { colors, typography, spacing, radius, elevation } = useTheme();
    const timelineThickness = StyleSheet.hairlineWidth * 2;
    const timelineDotSize = spacing.component.sm - spacing.component.xs / 2;
    const timelineColumnWidth = spacing.component.md + spacing.component.sm;
    const timelineCardHeight = spacing.section.margin * 3 + spacing.component.sm;

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
            width: timelineColumnWidth,
            marginRight: spacing.component.sm,
        },
        lineTop: {
            width: timelineThickness,
            flex: 1,
            backgroundColor: colors.border.subtle,
            marginBottom: spacing.component.xs / 2,
        },
        lineBottom: {
            width: timelineThickness,
            flex: 1,
            backgroundColor: isLast ? 'transparent' : colors.border.subtle,
            marginTop: spacing.component.xs / 2,
        },
        dot: {
            width: timelineDotSize,
            height: timelineDotSize,
            borderRadius: timelineDotSize / 2,
            borderWidth: timelineThickness,
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
            height: timelineCardHeight,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border.subtle,
            ...elevation.card,
        },
        image: {
            width: timelineCardHeight,
            height: '100%',
        },
        imagePlaceholder: {
            width: timelineCardHeight,
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
            marginBottom: spacing.component.xs / 2,
        },
        title: {
            ...typography.headingSmall,
            color: colors.text.primary,
            marginBottom: spacing.component.xs / 2,
        },
        location: {
            ...typography.caption,
            color: colors.text.secondary,
        },
        categoryBadge: {
            position: 'absolute',
            top: spacing.component.xs,
            right: spacing.component.xs,
            backgroundColor: colors.overlay.blur,
            paddingHorizontal: spacing.component.xs / 2,
            paddingVertical: spacing.component.xs / 4,
            borderRadius: radius.small,
        },
        categoryText: {
            ...typography.caption,
        },
    }), [colors, spacing, radius, typography, isLast, timelineCardHeight, timelineColumnWidth, timelineDotSize, timelineThickness]);

    return (
        <Animated.View style={styles.container} entering={FadeInRight.delay(index * 80).duration(320)}>
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
                            <Text style={{ fontSize: typography.headingLarge.fontSize }}>{category.emoji}</Text>
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
