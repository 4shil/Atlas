import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useAuthStore } from '../store/useAuthStore';
import { useGoalStore } from '../store/useGoalStore';
import { LoadingScreen } from '../components/LoadingScreen';

export default function Index() {
    const hasOnboarded = useProfileStore(state => state.profile.hasOnboarded);
    const { session, initialized, initialize } = useAuthStore();
    const { syncFromCloud: syncGoals } = useGoalStore();
    const { syncFromCloud: syncProfile } = useProfileStore();

    useEffect(() => {
        const unsubscribe = initialize();
        return unsubscribe;
    }, []);

    // Sync from cloud if logged in — login is never required
    useEffect(() => {
        if (session) {
            // Fire and forget — never block navigation
            syncProfile().catch(() => {});
            syncGoals().catch(() => {});
        }
    }, [session]);

    if (!initialized) return <LoadingScreen />;

    // No auth gate — app works fully offline/anonymous
    // Login is optional, only enables cloud sync
    if (!hasOnboarded) return <Redirect href="/onboarding" />;
    return <Redirect href="/(tabs)" />;
}
