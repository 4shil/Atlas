import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useAuthStore } from '../store/useAuthStore';
import { useGoalStore } from '../store/useGoalStore';

export default function Index() {
    const hasOnboarded = useProfileStore(state => state.profile.hasOnboarded);
    const { session, initialized, initialize } = useAuthStore();
    const { syncFromCloud: syncGoals } = useGoalStore();
    const { syncFromCloud: syncProfile } = useProfileStore();

    useEffect(() => {
        const unsubscribe = initialize();
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (session) {
            syncProfile();
            syncGoals();
        }
    }, [session]);

    if (!initialized) return null;
    if (!session) return <Redirect href="/auth" />;
    if (!hasOnboarded) return <Redirect href="/onboarding" />;
    return <Redirect href="/(tabs)" />;
}
