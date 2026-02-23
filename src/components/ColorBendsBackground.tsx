import React from 'react';
import { StyleSheet, View, Platform, Dimensions } from 'react-native';
import { useSharedValue, useDerivedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

let SkiaModule: any = null;
if (Platform.OS !== 'web') {
    try {
        SkiaModule = require('@shopify/react-native-skia');
    } catch (e) {
        console.warn("Skia not available", e);
    }
}

const shaderSource = `
uniform float2 resolution;
uniform float time;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Map color components
vec3 gradient(float t) {
    // Atlas multi-color gradient (Deep Blue, Indigo, Purple, Black mixing)
    vec3 a = vec3(0.1, 0.2, 0.5); 
    vec3 b = vec3(0.6, 0.2, 0.5); 
    vec3 c = vec3(1.0, 1.0, 1.0); 
    vec3 d = vec3(0.1, 0.1, 0.4); 
    return a + b * cos( 6.28318 * (c * t + d) );
}

vec4 main(vec2 xy) {
    // Normalize coordinates
    vec2 st = xy / resolution.xy;
    st.x *= resolution.x / resolution.y; // Fix aspect ratio

    // Base fluid movement
    vec2 pos = vec2(st * 1.5);
    float n = snoise(pos - time * 0.15); // Large slow waves
    float n2 = snoise(pos * 2.5 + time * 0.2); // Faster small ripples
    
    // Distort space
    pos += vec2(n, n2) * 0.5;
    
    // Final noise computation
    float f = snoise(pos * 1.2 - time * 0.1);

    // Map noise [-1, 1] to color palette
    float colorMix = f * 0.5 + 0.5; 
    vec3 color = gradient(colorMix);
    
    // Enhance contrast and darken boundaries
    color = mix(color, vec3(0.02, 0.05, 0.1), 0.5); // Deepen the space effect

    return vec4(color, 1.0);
}
`;

// Only compile shader if Skia is available natively
const skiaShader = SkiaModule?.Skia?.RuntimeEffect?.Make(shaderSource);

interface ColorBendsBackgroundProps {
    width: number;
    height: number;
}

export function ColorBendsBackground({ width, height }: ColorBendsBackgroundProps) {
    const time = useSharedValue(0);

    // Run animation infinitely 0 -> 1000
    React.useEffect(() => {
        time.value = withRepeat(
            withTiming(1000, {
                duration: 1000000, // Very slow continuous progression
                easing: Easing.linear,
            }),
            -1 // Infinite repeat
        );
    }, [time]);

    const uniforms = useDerivedValue(() => {
        if (!SkiaModule?.vec) return null;
        return {
            resolution: SkiaModule.vec(width, height),
            time: time.value,
        };
    });

    // Fallback for Web or unlinked native module
    if (Platform.OS === 'web' || !skiaShader || !SkiaModule || !SkiaModule.Canvas) {
        return (
            <View className="flex-1 bg-[#0a0a1a] items-center justify-center">
                {/* Temporary static fallback until WASM is configured for Web */}
            </View>
        );
    }

    const { Canvas, Fill, RuntimeShader } = SkiaModule;

    return (
        <View style={StyleSheet.absoluteFill} className="bg-black">
            <Canvas style={StyleSheet.absoluteFill}>
                <Fill>
                    <RuntimeShader source={skiaShader} uniforms={uniforms} />
                </Fill>
            </Canvas>
        </View>
    );
}
