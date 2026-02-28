import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useAuthStore } from '../store/useAuthStore';
import { useGoalStore } from '../store/useGoalStore';

export default function Index() {
    const hasOnboarded = useProfileStore(state => state.profile.hasOnboarded);
    const { session, initialized, initialize } = useAuthStore();
    const { syncFromCloud } = useGoalStore();

    useEffect(() => {
        const unsubscribe = initialize();
        return unsubscribe;
    }, []);

    // Sync goals from cloud whenever session becomes available
    useEffect(() => {
        if (session) syncFromCloud();
    }, [session]);

    if (!initialized) return null;
    if (!session) return <Redirect href="/auth" />;
    if (!hasOnboarded) return <Redirect href="/onboarding" />;
    return <Redirect href="/(tabs)" />;
}
