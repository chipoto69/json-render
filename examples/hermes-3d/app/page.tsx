"use client";

import { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { threeComponentDefinitions } from "@json-render/react-three-fiber/catalog";
import { defineRegistry } from "@json-render/react";
import { threeComponents, ThreeRenderer } from "@json-render/react-three-fiber";
import { scenes } from "./scenes";

// Build catalog with all 3D components
const catalog = defineCatalog(schema, {
  components: threeComponentDefinitions as any,
  actions: {},
});

const { registry } = defineRegistry(catalog, {
  components: threeComponents as any,
});

const sceneNames = scenes.map((s) => s.name);

export default function Page() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = scenes[sceneIndex];

  const nextScene = useCallback(() => {
    setSceneIndex((i) => (i + 1) % scenes.length);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Scene selector bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          gap: 8,
          padding: "12px 16px",
          background: "rgba(5, 5, 16, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 68, 255, 0.2)",
        }}
      >
        {sceneNames.map((name, i) => (
          <button
            key={name}
            onClick={() => setSceneIndex(i)}
            style={{
              padding: "6px 16px",
              border: i === sceneIndex
                ? "1px solid rgba(255, 68, 255, 0.6)"
                : "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 6,
              background: i === sceneIndex
                ? "rgba(255, 68, 255, 0.15)"
                : "transparent",
              color: i === sceneIndex ? "#ff44ff" : "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "system-ui, sans-serif",
              transition: "all 0.2s",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Scene info overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          zIndex: 10,
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: 13,
          fontFamily: "system-ui, sans-serif",
          maxWidth: 400,
        }}
      >
        <div style={{ color: "#ff44ff", fontWeight: 600, marginBottom: 4 }}>
          {scene.name}
        </div>
        <div style={{ opacity: 0.6, lineHeight: 1.4 }}>
          {scene.description}
        </div>
        <div style={{ marginTop: 8, opacity: 0.4, fontSize: 11 }}>
          Scene {sceneIndex + 1} of {scenes.length} — click to orbit, scroll to zoom
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 3, 10], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ThreeRenderer spec={scene.spec} registry={registry} />
      </Canvas>
    </div>
  );
}
