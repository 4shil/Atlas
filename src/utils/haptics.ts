import * as Haptics from 'expo-haptics';

export const hapticSuccess = () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
export const hapticSelect = () => Haptics.selectionAsync();
export const hapticDelete = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
export const hapticImpact = (style = Haptics.ImpactFeedbackStyle.Medium) =>
    Haptics.impactAsync(style);
