import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "hermes-3d",
    timestamp: new Date().toISOString(),
    scenes: ["agent-swarm", "exo-cluster", "project-architecture"],
  });
}
