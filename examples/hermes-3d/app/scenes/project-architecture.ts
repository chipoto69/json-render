/**
 * Project Architecture — 3D visualization of a project's structure.
 *
 * Boxes represent packages/modules stacked in layers, with glowing
 * connections showing dependencies. The root module at center, children
 * orbiting in rings. Designed to be generated from a project's
 * package.json or monorepo structure.
 */
import { PI } from "./_helpers";
import type { Scene } from "./_helpers";

export const projectArchitecture: Scene = {
  name: "Project Architecture",
  description:
    "3D architecture view — layered modules as geometric blocks with dependency connections, orbits showing the module hierarchy.",
  spec: {
    root: "scene",
    elements: {
      scene: {
        type: "Group",
        props: { position: null, rotation: null, scale: null },
        children: [
          "cam", "env", "stars", "ambient", "core-light",
          "root-module", "orbit-1", "orbit-2", "orbit-3", "orbit-4",
          "grid", "sparkles", "post", "fog", "controls",
        ],
      },

      cam: {
        type: "PerspectiveCamera",
        props: { position: [0, 5, 10], fov: 50, makeDefault: true },
        children: [],
      },
      env: {
        type: "Environment",
        props: { preset: "city", background: false, blur: 0.5, intensity: 0.3 },
        children: [],
      },
      stars: {
        type: "Stars",
        props: { radius: 80, depth: 40, count: 2000, factor: 3, saturation: 0.1, fade: true, speed: 0.1 },
        children: [],
      },
      ambient: {
        type: "AmbientLight",
        props: { color: "#111122", intensity: 0.6 },
        children: [],
      },
      "core-light": {
        type: "PointLight",
        props: { position: [0, 2, 0], color: "#ffffff", intensity: 30, distance: 20, decay: 2, castShadow: false },
        children: [],
      },

      // ─── Root Module — centerpiece ──────────────────────────────────
      "root-module": {
        type: "Float",
        props: { position: [0, 0, 0], speed: 2, floatIntensity: 0.2, floatingRange: [0, 0.2, 0] },
        children: ["root-spin"],
      },
      "root-spin": {
        type: "Spin",
        props: { position: null, rotation: null, scale: null, speed: 0.3, axis: "y" },
        children: ["root-box"],
      },
      "root-box": {
        type: "GlassBox",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: true, receiveShadow: true,
          width: 1.5, height: 1.5, depth: 1.5,
          color: "#ffffff", transmission: 1, thickness: 0.3,
          roughness: 0, chromaticAberration: 0.05, ior: 1.5,
          distortion: 0, distortionScale: null, temporalDistortion: null,
          samples: 6, resolution: 128,
        },
        children: ["root-label"],
      },
      "root-label": {
        type: "HtmlLabel",
        props: { position: [0, 1.5, 0], text: "json-render\nmonorepo", color: "#ffffff", fontSize: 16 },
        children: [],
      },

      // ─── Layer 1 — Core packages (inner ring) ───────────────────────
      "orbit-1": {
        type: "Orbit",
        props: { position: [0, 0, 0], speed: 0.6, radius: 3.5, tilt: 0.3 },
        children: ["l1-pulse"],
      },
      "l1-pulse": {
        type: "Pulse",
        props: { position: null, rotation: null, scale: null, speed: 1, min: 0.9, max: 1.1 },
        children: ["l1-node"],
      },
      "l1-node": {
        type: "RoundedBox",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: true, receiveShadow: true,
          width: 0.6, height: 0.6, depth: 0.6, radius: 0.08,
          material: { color: "#ff44ff", metalness: 0.3, roughness: 0.3, emissive: "#aa22aa", emissiveIntensity: 0.3 },
        },
        children: [],
      },

      // ─── Layer 2 — Renderers (middle ring) ──────────────────────────
      "orbit-2": {
        type: "Orbit",
        props: { position: [0, 0.3, 0], speed: -0.4, radius: 5.5, tilt: -0.4 },
        children: ["l2-node"],
      },
      "l2-node": {
        type: "Sphere",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: true, receiveShadow: true,
          material: { color: "#00ffff", metalness: 0.5, roughness: 0.2, emissive: "#0088aa", emissiveIntensity: 0.4 },
          radius: 0.4, widthSegments: 24, heightSegments: 16,
        },
        children: [],
      },

      // ─── Layer 3 — Adapters (middle-outer ring) ─────────────────────
      "orbit-3": {
        type: "Orbit",
        props: { position: [0, -0.2, 0], speed: 0.5, radius: 7, tilt: 0.6 },
        children: ["l3-node"],
      },
      "l3-node": {
        type: "RoundedBox",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: true, receiveShadow: true,
          width: 0.5, height: 0.5, depth: 0.5, radius: 0.05,
          material: { color: "#ffcc00", metalness: 0.4, roughness: 0.25, emissive: "#aa8800", emissiveIntensity: 0.3 },
        },
        children: [],
      },

      // ─── Layer 4 — Tools/Utils (outer ring) ─────────────────────────
      "orbit-4": {
        type: "Orbit",
        props: { position: [0, 0.1, 0], speed: -0.35, radius: 8.5, tilt: -0.5 },
        children: ["l4-node"],
      },
      "l4-node": {
        type: "Sphere",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: true, receiveShadow: true,
          material: { color: "#00ff88", metalness: 0.6, roughness: 0.15, emissive: "#008844", emissiveIntensity: 0.35 },
          radius: 0.35, widthSegments: 24, heightSegments: 16,
        },
        children: [],
      },

      // ─── Grid & Effects ─────────────────────────────────────────────
      grid: {
        type: "GridHelper",
        props: { position: [0, -3, 0], size: 20, divisions: 20, color: "#222244" },
        children: [],
      },
      sparkles: {
        type: "Sparkles",
        props: { position: null, rotation: null, scale: [20, 20, 20], count: 100, size: 2, speed: 0.2, opacity: 0.3, color: "#ffffff" },
        children: [],
      },
      post: {
        type: "EffectComposer",
        props: { position: null, rotation: null, scale: null },
        children: ["bloom"],
      },
      bloom: {
        type: "Bloom",
        props: { luminanceThreshold: 0.4, luminanceSmoothing: 0.9, intensity: 0.5 },
        children: [],
      },
      fog: {
        type: "Fog",
        props: { color: "#0a0a20", near: 15, far: 40 },
        children: [],
      },
      controls: {
        type: "OrbitControls",
        props: { enableDamping: true, enableZoom: true, autoRotate: true, autoRotateSpeed: 0.25 },
        children: [],
      },
    },
  },
};
