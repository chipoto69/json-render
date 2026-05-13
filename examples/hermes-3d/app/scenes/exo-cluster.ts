/**
 * EXO Cluster Topology — 3D visualization of the distributed inference cluster.
 *
 * The spine node (Mac Mini) at center, surrounded by connected peers
 * (Mac Studio, 2 MacBooks) with glowing data-flow lines between them.
 * Each node is color-coded by role: spine=magenta, worker=cyan, compute=green.
 * Active connections pulse with light.
 */
import { PI } from "./_helpers";
import type { Scene } from "./_helpers";

export const exoCluster: Scene = {
  name: "EXO Cluster",
  description:
    "3D topology of the EXO distributed inference cluster — spine node at center with 3 worker peers connected by pulsing data lines.",
  spec: {
    root: "scene",
    elements: {
      scene: {
        type: "Group",
        props: { position: null, rotation: null, scale: null },
        children: [
          "cam", "env", "stars", "ambient", "spine-light",
          "spine-group", "worker-1-group", "worker-2-group", "worker-3-group",
          "conn-1", "conn-2", "conn-3", "grid",
          "sparkles", "post", "fog", "controls",
        ],
      },

      cam: {
        type: "PerspectiveCamera",
        props: { position: [0, 4, 10], fov: 50, makeDefault: true },
        children: [],
      },
      env: {
        type: "Environment",
        props: { preset: "night", background: false, blur: 1, intensity: 0.1 },
        children: [],
      },
      stars: {
        type: "Stars",
        props: { radius: 100, depth: 50, count: 3000, factor: 3, saturation: 0.1, fade: true, speed: 0.2 },
        children: [],
      },
      ambient: {
        type: "AmbientLight",
        props: { color: "#0a0020", intensity: 0.5 },
        children: [],
      },
      "spine-light": {
        type: "PointLight",
        props: { position: [0, 0, 0], color: "#ff44ff", intensity: 40, distance: 15, decay: 1.5, castShadow: false },
        children: [],
      },

      // ─── Spine Node (Mac Mini) — center, magenta ───────────────────
      "spine-group": {
        type: "Float",
        props: { position: [0, 0, 0], speed: 1, floatIntensity: 0.3, floatingRange: [0, 0.3, 0] },
        children: ["spine-core"],
      },
      "spine-core": {
        type: "Pulse",
        props: { position: null, rotation: null, scale: null, speed: 1.5, min: 0.95, max: 1.05 },
        children: ["spine-spin"],
      },
      "spine-spin": {
        type: "Spin",
        props: { position: null, rotation: null, scale: null, speed: 0.5, axis: "y" },
        children: ["spine-outer"],
      },
      "spine-outer": {
        type: "RoundedBox",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: true, receiveShadow: true,
          width: 1.2, height: 1.2, depth: 1.2, radius: 0.15,
          material: { color: "#ff44ff", metalness: 0.4, roughness: 0.2, emissive: "#aa22aa", emissiveIntensity: 0.5 },
        },
        children: ["spine-label"],
      },
      "spine-label": {
        type: "HtmlLabel",
        props: { position: [0, 1, 0], text: "SPINE\nMac Mini", color: "#ff88ff", fontSize: 14 },
        children: [],
      },

      // ─── Worker 1 (Mac Studio) — cyan, upper right ─────────────────
      "worker-1-group": {
        type: "Group",
        props: { position: [4, 1.5, -2], rotation: null, scale: [0.8, 0.8, 0.8] },
        children: ["worker-1-core"],
      },
      "worker-1-core": {
        type: "Float",
        props: { position: null, speed: 1.5, floatIntensity: 0.5, floatingRange: [0, 0.5, 0] },
        children: ["worker-1-spin"],
      },
      "worker-1-spin": {
        type: "Spin",
        props: { position: null, rotation: null, scale: null, speed: 1, axis: "x" },
        children: ["worker-1-mesh"],
      },
      "worker-1-mesh": {
        type: "Sphere",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: true, receiveShadow: true,
          material: { color: "#00ffff", metalness: 0.6, roughness: 0.1, emissive: "#0088aa", emissiveIntensity: 0.6 },
          radius: 0.6, widthSegments: 32, heightSegments: 16,
        },
        children: ["worker-1-label"],
      },
      "worker-1-label": {
        type: "HtmlLabel",
        props: { position: [0, 1.2, 0], text: "Mac Studio\nM3 64GB", color: "#00ffff", fontSize: 12 },
        children: [],
      },

      // ─── Worker 2 (MacBook Pro) — green, upper left ─────────────────
      "worker-2-group": {
        type: "Group",
        props: { position: [-4, 1, -2], rotation: null, scale: [0.7, 0.7, 0.7] },
        children: ["worker-2-core"],
      },
      "worker-2-core": {
        type: "Float",
        props: { position: null, speed: 1.8, floatIntensity: 0.4, floatingRange: [0, 0.4, 0] },
        children: ["worker-2-spin"],
      },
      "worker-2-spin": {
        type: "Spin",
        props: { position: null, rotation: null, scale: null, speed: -1.2, axis: "z" },
        children: ["worker-2-mesh"],
      },
      "worker-2-mesh": {
        type: "Sphere",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: true, receiveShadow: true,
          material: { color: "#00ff88", metalness: 0.5, roughness: 0.15, emissive: "#008844", emissiveIntensity: 0.5 },
          radius: 0.55, widthSegments: 32, heightSegments: 16,
        },
        children: ["worker-2-label"],
      },
      "worker-2-label": {
        type: "HtmlLabel",
        props: { position: [0, 1.2, 0], text: "MacBook Pro\nAtlas (bot)", color: "#00ff88", fontSize: 12 },
        children: [],
      },

      // ─── Worker 3 (MacBook M1 Max) — yellow, back ──────────────────
      "worker-3-group": {
        type: "Group",
        props: { position: [0, -1, -5], rotation: null, scale: [0.7, 0.7, 0.7] },
        children: ["worker-3-core"],
      },
      "worker-3-core": {
        type: "Float",
        props: { position: null, speed: 1.3, floatIntensity: 0.6, floatingRange: [0, 0.5, 0] },
        children: ["worker-3-spin"],
      },
      "worker-3-spin": {
        type: "Spin",
        props: { position: null, rotation: null, scale: null, speed: 0.8, axis: "y" },
        children: ["worker-3-mesh"],
      },
      "worker-3-mesh": {
        type: "RoundedBox",
        props: {
          position: null, rotation: null, scale: null,
          castShadow: true, receiveShadow: true,
          width: 0.9, height: 0.9, depth: 0.9, radius: 0.1,
          material: { color: "#ffcc00", metalness: 0.4, roughness: 0.2, emissive: "#aa8800", emissiveIntensity: 0.4 },
        },
        children: ["worker-3-label"],
      },
      "worker-3-label": {
        type: "HtmlLabel",
        props: { position: [0, 1.2, 0], text: "MacBook M1 Max\nCompute", color: "#ffcc00", fontSize: 12 },
        children: [],
      },

      // ─── Connection lines (visual only — Cylinders between nodes) ──
      "conn-1": {
        type: "Cylinder",
        props: {
          position: [2, 0.75, -1], rotation: [0, 0, PI / 6], scale: null,
          radiusTop: 0.03, radiusBottom: 0.03, height: 4.5,
          material: { color: "#00ffff", metalness: 0.9, roughness: 0.1, emissive: "#00aaff", emissiveIntensity: 1, opacity: 0.4, transparent: true },
        },
        children: [],
      },
      "conn-2": {
        type: "Cylinder",
        props: {
          position: [-2, 0.5, -1], rotation: [0, 0, -PI / 5], scale: null,
          radiusTop: 0.03, radiusBottom: 0.03, height: 4.2,
          material: { color: "#00ff88", metalness: 0.9, roughness: 0.1, emissive: "#00ff66", emissiveIntensity: 1, opacity: 0.4, transparent: true },
        },
        children: [],
      },
      "conn-3": {
        type: "Cylinder",
        props: {
          position: [0, -0.5, -2.5], rotation: [PI / 2, 0, 0], scale: null,
          radiusTop: 0.03, radiusBottom: 0.03, height: 5,
          material: { color: "#ffcc00", metalness: 0.9, roughness: 0.1, emissive: "#ffaa00", emissiveIntensity: 1, opacity: 0.4, transparent: true },
        },
        children: [],
      },

      // ─── Grid & Fog & Controls ──────────────────────────────────────
      grid: {
        type: "GridHelper",
        props: { position: [0, -3, 0], size: 20, divisions: 20, color: "#221144" },
        children: [],
      },
      sparkles: {
        type: "Sparkles",
        props: { position: null, rotation: null, scale: [18, 18, 18], count: 100, size: 2, speed: 0.3, opacity: 0.4, color: "#ff44ff" },
        children: [],
      },
      post: {
        type: "EffectComposer",
        props: { position: null, rotation: null, scale: null },
        children: ["bloom"],
      },
      bloom: {
        type: "Bloom",
        props: { luminanceThreshold: 0.3, luminanceSmoothing: 0.9, intensity: 0.6 },
        children: [],
      },
      fog: {
        type: "Fog",
        props: { color: "#0a0015", near: 12, far: 35 },
        children: [],
      },
      controls: {
        type: "OrbitControls",
        props: { enableDamping: true, enableZoom: true, autoRotate: true, autoRotateSpeed: 0.2 },
        children: [],
      },
    },
  },
};
