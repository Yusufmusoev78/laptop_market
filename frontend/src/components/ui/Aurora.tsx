import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';

const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.06;

  float n1 = noise(vec2(uv.x * 2.6 + t, t * 0.6));
  float n2 = noise(vec2(uv.x * 4.2 - t * 0.8, t * 0.4 + 11.0));
  float n3 = noise(vec2(uv.x * 1.4 + t * 0.3, t * 0.2 + 5.0));

  float wave = (n1 * 0.5 + n2 * 0.32 + n3 * 0.18) * uAmplitude;
  float band = uv.y - (0.28 + wave * 0.55);
  float intensity = smoothstep(0.22, 0.0, abs(band)) * (1.0 - uv.y * 0.5);

  vec3 color = mix(uColor1, uColor2, clamp(uv.x + n3 * 0.3, 0.0, 1.0));
  color = mix(color, uColor3, n1 * 0.45);

  gl_FragColor = vec4(color * intensity, intensity * 0.85);
}
`;

interface AuroraProps {
  amplitude?: number;
  colorStops?: [string, string, string];
  className?: string;
}

export const Aurora: React.FC<AuroraProps> = ({
  amplitude = 1.0,
  colorStops = ['#4338ca', '#6366f1', '#8b5cf6'],
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Skip on small phones — the CSS orb layer already covers it there.
    if (window.innerWidth < 480) return;

    let raf = 0;
    let destroyed = false;
    let canvas: HTMLCanvasElement | null = null;
    let cleanupResize: (() => void) | null = null;

    try {
      const renderer = new Renderer({ webgl: 1, alpha: true, premultipliedAlpha: false, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
      const gl = renderer.gl;
      canvas = gl.canvas as HTMLCanvasElement;
      gl.clearColor(0, 0, 0, 0);
      container.appendChild(canvas);

      const toRgb = (hex: string): [number, number, number] => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      };

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: amplitude },
          uColor1: { value: toRgb(colorStops[0]) },
          uColor2: { value: toRgb(colorStops[1]) },
          uColor3: { value: toRgb(colorStops[2]) },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });

      const resize = () => {
        if (!container) return;
        renderer.setSize(container.offsetWidth, container.offsetHeight);
      };
      resize();
      window.addEventListener('resize', resize);
      cleanupResize = () => window.removeEventListener('resize', resize);

      const start = performance.now();
      const update = () => {
        if (destroyed) return;
        program.uniforms.uTime.value = (performance.now() - start) / 1000;
        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(update);
      };
      raf = requestAnimationFrame(update);
    } catch {
      /* WebGL unavailable — CSS orb layer behind this still renders fine. */
    }

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      cleanupResize?.();
      if (canvas && canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, [amplitude, colorStops]);

  return <div ref={containerRef} className={`aurora-canvas-wrap ${className}`} />;
};
