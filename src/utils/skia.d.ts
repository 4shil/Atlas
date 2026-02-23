declare module '@shopify/react-native-skia' {
    import { ComponentType } from 'react';
    import { ViewProps } from 'react-native';

    export const Canvas: ComponentType<ViewProps>;
    export const Fill: ComponentType<any>;
    export const RuntimeShader: ComponentType<any>;

    export const Skia: {
        RuntimeEffect: {
            Make: (sksl: string) => any;
        };
    };

    export function vec(x: number, y: number): any;
}
