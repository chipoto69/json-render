import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hermes Swarm — 3D Visualization",
  description:
    "Living 3D visualization of the Hermes agent swarm — agents as geometric constellations, EXO cluster topology, project architecture as orbiting modules.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#050510", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
