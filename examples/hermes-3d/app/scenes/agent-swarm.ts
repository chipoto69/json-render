/**
 * Agent Swarm — a living constellation of Hermes agents.
 *
 * Six agents (CTO, PM, Dev, QA, Security, Ops) orbit a central Hermes core.
 * Each agent is represented as a distinct geometric shape with its role color.
 * Active agents pulse and emit particle trails. Data flows between connected agents.
 * Orbit speeds vary to create a dynamic, living visualization.
 *
 * Color mapping:
 *   CTO      → magenta (#ff44ff)
 *   PM       → yellow  (#ffcc00)
 *   Dev      → cyan    (#00ffff)
 *   QA       → green   (#00ff88)
 *   Security → red     (#ff2244)
 *   Ops      → blue    (#4488ff)
 */
import { PI } from "./_helpers";
import type { Scene } from "./_helpers";

export const agentSwarm: Scene = {
  name: "Agent Swarm",
  description:
    "Living constellation of 6 Hermes agents orbiting a pulsing core — each agent is a distinct shape and color, connected by data flows.",
  spec: {
    root: "scene",
    elements: {
      // ─── Root ───────────────────────────────────────────────────────
      scene: {
        type: "Group",
        props: { position: null, rotation: null, scale: null },
        children: [
          "cam", "env", "stars", "ambient", "core-light",
          "core-pulse", "fog", "controls",
          // Agent orbits
          "orbit-cto", "orbit-pm", "orbit-dev",
          "orbit-qa", "orbit-security", "orbit-ops",
          // Ring data flows
          "ring-inner", "ring-outer",
          // Post effects
          "sparkles", "post",
        ],
      },

      // ─── Camera & Environment ───────────────────────────────────────
      cam: {
        type: "PerspectiveCamera",
        props: { position: [0, 3, 10], fov: 55, makeDefault: true },
        children: [],
      },
      env: {
        type: "Environment",
        props: { preset: "night", background: false, blur: 0.8, intensity: 0.2 },
        children: [],
      },
      stars: {
        type: "Stars",
        props: { radius: 100, depth: 50, count: 5000, factor: 4, saturation: 0.2, fade: true, speed: 0.3 },
        children: [],
      },

      // ─── Lighting ───────────────────────────────────────────────────
      ambient: {
        type: "AmbientLight",
        props: { color: "#110022", intensity: 0.4 },
        children: [],
      },
      "core-light": {
        type: "PointLight",
        props: { position: [0, 0, 0], color: "#ff44ff", intensity: 60, distance: 20, decay: 2, castShadow: false },
        children: [],
      },

      // ─── Hermes Core — pulsing, glowing center ──────────────────────
      "core-pulse": {
        type: "Pulse",
        props: { position: null, rotation: null, scale: null, speed: 1.2, min: 0.9, max: 1.1 },
        children: ["core-spin"],
      },
      "core-spin": {
        type: "Spin",
        props: { position: null, rotation: null, scale: null, speed: 0.4, axis: "y" },
        children: ["core-blob"],
      },
      "core-blob": {
        type: "DistortSphere",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: false, receiveShadow: false,
          radius: 0.8, widthSegments: 64, heightSegments: 32,
          color: "#ff44ff", speed: 3, distort: 0.5,
          metalness: 0.1, roughness: 0.1,
        },
        children: [],
      },

      // ─── CTO Agent (magenta — innermost orbit, fastest) ────────────
      "orbit-cto": {
        type: "Orbit",
        props: { position: [0, 0, 0], rotation: null, scale: null, speed: 1.8, radius: 3, tilt: 0.3 },
        children: ["cto-spin"],
      },
      "cto-spin": {
        type: "Spin",
        props: { position: null, rotation: null, scale: null, speed: 3, axis: "x" },
        children: ["cto-node"],
      },
      "cto-node": {
        type: "GlassSphere",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: false, receiveShadow: false,
          radius: 0.35, widthSegments: 32, heightSegments: 16,
          color: "#ff44ff", transmission: 1, thickness: 0.45,
          roughness: 0, chromaticAberration: 0.12, ior: 1.8,
          distortion: 0.08, distortionScale: null, temporalDistortion: null,
          samples: 6, resolution: 128,
        },
        children: [],
      },

      // ─── PM Agent (yellow) ──────────────────────────────────────────
      "orbit-pm": {
        type: "Orbit",
        props: { position: [0, 0.3, 0], rotation: null, scale: null, speed: -1.4, radius: 4.5, tilt: 0.6 },
        children: ["pm-spin"],
      },
      "pm-spin": {
        type: "Spin",
        props: { position: null, rotation: null, scale: null, speed: -2.5, axis: "z" },
        children: ["pm-node"],
      },
      "pm-node": {
        type: "TorusKnot",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: false, receiveShadow: false,
          material: { color: "#ffcc00", metalness: 0.8, roughness: 0.15, emissive: "#ffaa00", emissiveIntensity: 0.6 },
          radius: 0.3, tube: 0.1, tubularSegments: 64, radialSegments: 8, p: 2, q: 3,
        },
        children: [],
      },

      // ─── Dev Agent (cyan) ───────────────────────────────────────────
      "orbit-dev": {
        type: "Orbit",
        props: { position: [0, -0.2, 0], rotation: null, scale: null, speed: 1.1, radius: 5.5, tilt: -0.4 },
        children: ["dev-spin"],
      },
      "dev-spin": {
        type: "Spin",
        props: { position: null, rotation: null, scale: null, speed: 2, axis: "y" },
        children: ["dev-node"],
      },
      "dev-node": {
        type: "GlassBox",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: false, receiveShadow: false,
          width: 0.55, height: 0.55, depth: 0.55,
          color: "#00ffff", transmission: 1, thickness: 0.4,
          roughness: 0, chromaticAberration: 0.1, ior: 1.7,
          distortion: 0, distortionScale: null, temporalDistortion: null,
          samples: 6, resolution: 128,
        },
        children: [],
      },

      // ─── QA Agent (green) ───────────────────────────────────────────
      "orbit-qa": {
        type: "Orbit",
        props: { position: [0, -0.5, 0], rotation: null, scale: null, speed: -0.9, radius: 6.5, tilt: -0.7 },
        children: ["qa-node"],
      },
      "qa-node": {
        type: "Sphere",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: false, receiveShadow: false,
          material: { color: "#00ff88", metalness: 0.3, roughness: 0.2, emissive: "#00ff66", emissiveIntensity: 0.6 },
          radius: 0.3, widthSegments: 32, heightSegments: 16,
        },
        children: [],
      },

      // ─── Security Agent (red) ───────────────────────────────────────
      "orbit-security": {
        type: "Orbit",
        props: { position: [0, 0.6, 0], rotation: null, scale: null, speed: 1.6, radius: 7.5, tilt: 0.9 },
        children: ["security-spin"],
      },
      "security-spin": {
        type: "Spin",
        props: { position: null, rotation: null, scale: null, speed: -4, axis: "x" },
        children: ["security-node"],
      },
      "security-node": {
        type: "Sphere",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: false, receiveShadow: false,
          material: { color: "#ff2244", metalness: null, roughness: null, emissive: "#ff0022", emissiveIntensity: 0.8, opacity: null, transparent: null, wireframe: true },
          radius: 0.35, widthSegments: 16, heightSegments: 12,
        },
        children: [],
      },

      // ─── Ops Agent (blue) — outermost, slowest ──────────────────────
      "orbit-ops": {
        type: "Orbit",
        props: { position: [0, -0.1, 0], rotation: null, scale: null, speed: -0.7, radius: 8.5, tilt: -0.5 },
        children: ["ops-spin"],
      },
      "ops-spin": {
        type: "Spin",
        props: { position: null, rotation: null, scale: null, speed: 1.8, axis: "z" },
        children: ["ops-node"],
      },
      "ops-node": {
        type: "GlassSphere",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: false, receiveShadow: false,
          radius: 0.32, widthSegments: 32, heightSegments: 16,
          color: "#4488ff", transmission: 1, thickness: 0.5,
          roughness: 0, chromaticAberration: 0.08, ior: 1.6,
          distortion: 0, distortionScale: null, temporalDistortion: null,
          samples: 6, resolution: 128,
        },
        children: [],
      },

      // ─── Data Flow Rings — translucent orbital rings ────────────────
      "ring-inner": {
        type: "Torus",
        props: {
          position: null, rotation: [PI / 2, 0, 0], scale: null,
          castShadow: false, receiveShadow: false,
          material: { color: "#ff44ff", metalness: 0.9, roughness: 0.1, emissive: "#ff22aa", emissiveIntensity: 0.4, opacity: 0.25, transparent: true },
          radius: 5, tube: 0.012, radialSegments: null, tubularSegments: 128,
        },
        children: [],
      },
      "ring-outer": {
        type: "Torus",
        props: {
          position: null, rotation: [PI / 2 + 0.3, 0.3, 0], scale: null,
          castShadow: false, receiveShadow: false,
          material: { color: "#00ffff", metalness: 0.9, roughness: 0.1, emissive: "#00ccff", emissiveIntensity: 0.3, opacity: 0.2, transparent: true },
          radius: 9, tube: 0.01, radialSegments: null, tubularSegments: 128,
        },
        children: [],
      },

      // ─── Sparkles — ambient particles ───────────────────────────────
      sparkles: {
        type: "Sparkles",
        props: {
          position: null, rotation: null,
          scale: [15, 15, 15],
          count: 200, size: 3, speed: 0.4, opacity: 0.5, color: "#ff44ff",
        },
        children: [],
      },

      // ─── Post-processing — bloom glow ───────────────────────────────
      post: {
        type: "EffectComposer",
        props: { position: null, rotation: null, scale: null },
        children: ["bloom"],
      },
      bloom: {
        type: "Bloom",
        props: { luminanceThreshold: 0.2, luminanceSmoothing: 0.9, intensity: 0.8 },
        children: [],
      },

      // ─── Fog & Controls ─────────────────────────────────────────────
      fog: {
        type: "Fog",
        props: { color: "#0a0015", near: 15, far: 40 },
        children: [],
      },
      controls: {
        type: "OrbitControls",
        props: { enableDamping: true, enableZoom: true, autoRotate: true, autoRotateSpeed: 0.3 },
        children: [],
      },
    },
  },
};
