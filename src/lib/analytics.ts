// PostHog analytics — uses a placeholder key; swap for real key in production

let posthogInstance: any = null;
try {
    // Skip analytics client initialization during SSR/Node render.
    if (typeof window !== 'undefined') {
        // Dynamic require to avoid ESLint unresolved error at build time
        const PostHog = require('posthog-react-native').default;
        posthogInstance = new PostHog('phc_placeholder_key', {
            host: 'https://app.posthog.com',
        });
    }
} catch {
    // PostHog failed to initialise — analytics are non-critical
}

export const track = (event: string, props?: Record<string, unknown>) => {
    try {
        posthogInstance?.capture(event, props);
    } catch {
        // never let analytics errors crash the app
    }
};
