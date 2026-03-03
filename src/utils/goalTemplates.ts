export interface GoalTemplate {
    title: string;
    category: string;
    description: string;
    emoji: string;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
    // Travel
    {
        title: 'See the Northern Lights',
        category: 'Travel',
        description: 'Witness the aurora borealis in all its natural glory.',
        emoji: '🌌',
    },
    {
        title: 'Visit Japan during Cherry Blossom',
        category: 'Travel',
        description: 'Experience sakura season in Tokyo or Kyoto.',
        emoji: '🌸',
    },
    {
        title: 'Road trip across India',
        category: 'Travel',
        description: 'Drive through diverse landscapes, cultures, and cuisines.',
        emoji: '🚗',
    },
    // Adventure
    {
        title: 'Learn to surf',
        category: 'Adventure',
        description: 'Catch waves and master the art of surfing.',
        emoji: '🏄',
    },
    {
        title: 'Go skydiving',
        category: 'Adventure',
        description: 'Freefall from 15,000 feet and feel truly alive.',
        emoji: '🪂',
    },
    {
        title: 'Trek to a base camp',
        category: 'Adventure',
        description: 'Hike to the base camp of a legendary mountain.',
        emoji: '⛰️',
    },
    // Fitness
    {
        title: 'Run a marathon',
        category: 'Fitness',
        description: 'Train and complete a full 42.2km marathon race.',
        emoji: '🏃',
    },
    {
        title: 'Complete 30-day yoga challenge',
        category: 'Fitness',
        description: 'Practice yoga every single day for 30 days.',
        emoji: '🧘',
    },
    {
        title: 'Swim 1km non-stop',
        category: 'Fitness',
        description: 'Build endurance and swim a full kilometre without stopping.',
        emoji: '🏊',
    },
    // Learning
    {
        title: 'Learn a new language',
        category: 'Learning',
        description: 'Reach conversational fluency in a new language.',
        emoji: '🗣️',
    },
    {
        title: 'Build and ship an app',
        category: 'Learning',
        description: 'Design, build, and publish a real app to the App Store.',
        emoji: '📱',
    },
    {
        title: 'Read 12 books in a year',
        category: 'Learning',
        description: 'Commit to reading one book per month for a full year.',
        emoji: '📚',
    },
    // Life
    {
        title: 'Cook a 3-course meal from scratch',
        category: 'Life',
        description: 'Master a starter, main, and dessert from raw ingredients.',
        emoji: '👨‍🍳',
    },
    {
        title: 'Watch sunrise from a mountain',
        category: 'Life',
        description: 'Hike up before dawn and watch the sun light up the world.',
        emoji: '🌅',
    },
    {
        title: 'Write a journal for 30 days',
        category: 'Life',
        description: 'Reflect on your thoughts and experiences every day for a month.',
        emoji: '📓',
    },
];
