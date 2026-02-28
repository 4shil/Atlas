/**
 * Sentry Error Monitoring
 * Initialize in _layout.tsx before rendering app
 */

import * as Sentry from '@sentry/react-native';

export function initSentry() {
    // Only initialize if DSN is configured (production)
    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
    if (!dsn || dsn.includes('your-dsn')) {
        console.log('[Sentry] DSN not configured — error reporting disabled');
        return;
    }

    Sentry.init({
        dsn,
        debug: __DEV__,
        environment: __DEV__ ? 'development' : 'production',
        enableNativeFramesTracking: true,
        tracesSampleRate: __DEV__ ? 1.0 : 0.1,
        initialScope: {
            tags: {
                app: 'atlas',
            },
        },
    });
}

export { Sentry };
