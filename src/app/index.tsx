import { Redirect } from 'expo-router';
import { useProfileStore } from '../store/useProfileStore';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect } from 'react';

export default function Index() {
    const hasOnboarded = useProfileStore((state) => state.profile.hasOnboarded);
    const { session, initialized, initialize } = useAuthStore();

    useEffect(() => {
        const unsubscribe = initialize();
        return unsubscribe;
    }, []);

    if (!initialized) return null; // splash still showing

    // Not logged in → auth screen
    if (!session) return <Redirect href="/auth" />;

    // Logged in but not onboarded → onboarding
    if (!hasOnboarded) return <Redirect href="/onboarding" />;

    // All good → app
    return <Redirect href="/(tabs)" />;
}
