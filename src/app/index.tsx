import { Redirect } from 'expo-router';
import { useProfileStore } from '../store/useProfileStore';

export default function Index() {
    const hasOnboarded = useProfileStore((state) => state.profile.hasOnboarded);

    return <Redirect href={hasOnboarded ? '/(tabs)' : '/onboarding'} />;
}
