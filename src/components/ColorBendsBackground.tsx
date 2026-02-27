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

// ── Simplex 2-D noise ──
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0,i1.y,1.0))
                           + i.x + vec3(0.0,i1.x,1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                           dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 xx = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(xx) - 0.5;
  vec3 ox = floor(xx + 0.5);
  vec3 a0 = xx - ox;
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x  = a0.x*x0.x  + h.x*x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.0 * dot(m, g);
}

// ── fBm (fractal Brownian motion) for richer turbulence ──
float fbm(vec2 p) {
    float f = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
        f += amp * snoise(p);
        p *= 2.1;
        amp *= 0.48;
    }
    return f;
}

// ── Spectral warm-cool palette (orange / teal / magenta / blue) ──
vec3 spectral(float t) {
    // Warm core: deep orange -> amber
    vec3 c1 = vec3(0.85, 0.35, 0.08);
    // Cool accent: teal/cyan
    vec3 c2 = vec3(0.05, 0.55, 0.65);
    // Hot accent: magenta/rose
    vec3 c3 = vec3(0.75, 0.12, 0.45);
    // Deep blue
    vec3 c4 = vec3(0.10, 0.15, 0.55);

    // Smooth 4-stop blend
    vec3 col = mix(c1, c2, smoothstep(0.0, 0.35, t));
    col = mix(col, c3, smoothstep(0.3, 0.6, t));
    col = mix(col, c4, smoothstep(0.55, 0.85, t));
    col = mix(col, c1, smoothstep(0.8, 1.0, t));  // loop back for seamless feel
    return col;
}

// ── Film-grain / noise texture ──
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec4 main(vec2 xy) {
    vec2 uv = xy / resolution.xy;
    float aspect = resolution.x / resolution.y;
    vec2 st = vec2(uv.x * aspect, uv.y);

    // Slow swirling distortion
    float t = time * 0.08;
    vec2 q = vec2(fbm(st * 1.2 + t * 0.3),
                  fbm(st * 1.2 + vec2(1.7, 9.2) + t * 0.25));

    vec2 r = vec2(fbm(st * 1.8 + 4.0 * q + vec2(1.7, 9.2) + t * 0.15),
                  fbm(st * 1.8 + 4.0 * q + vec2(8.3, 2.8) + t * 0.12));

    float f = fbm(st * 1.0 + 3.0 * r);

    // Map to colour
    float colorT = clamp(f * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = spectral(colorT);

    // Brightness shaped by noise — lights emerge from deep black
    float brightness = smoothstep(-0.4, 1.2, f);
    color *= brightness * 1.3;

    // Vignette — push edges to pure black
    vec2 vc = uv - 0.5;
    float vignette = 1.0 - dot(vc, vc) * 1.8;
    vignette = clamp(vignette, 0.0, 1.0);
    color *= vignette;

    // Deepen darks globally (most of the screen stays very dark)
    color = mix(vec3(0.0), color, 0.7);
    color = pow(color, vec3(1.15));  // slight gamma crush

    // Film grain overlay
    float grain = hash(xy * 0.5 + fract(time * 100.0)) * 0.08;
    color += grain - 0.04;

    // Clamp to valid range
    color = clamp(color, vec3(0.0), vec3(1.0));

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

    React.useEffect(() => {
        time.value = withRepeat(
            withTiming(1000, {
                duration: 1000000,
                easing: Easing.linear,
            }),
            -1
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
            <View className="flex-1 bg-[#050505] items-center justify-center" />
        );
    }

    const { Canvas, Fill, Group, Shader } = SkiaModule;

    return (
        <View style={StyleSheet.absoluteFill} className="bg-black">
            <Canvas style={StyleSheet.absoluteFill}>
                <Group>
                    <Shader source={skiaShader} uniforms={uniforms} />
                    <Fill />
                </Group>
            </Canvas>
        </View>
    );
}
