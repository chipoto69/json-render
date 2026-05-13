/**
 * Hermes data tools — read live state from ~/.hermes/ and expose it
 * to the AI as tool calls it can invoke while generating the dashboard.
 */
import { tool } from "ai";
import { z } from "zod";
import { execSync } from "child_process";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import os from "os";

const HERMES_DIR = process.env.HERMES_DIR || join(os.homedir(), ".hermes");

function readJSON(path: string): unknown | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

// ─── Kanban Board ───────────────────────────────────────────────────────────

export const getKanbanBoard = tool({
  description:
    "Read the Hermes Kanban board state — all cards across Backlog, In Progress, Review, and Done columns. Use for dashboard overview.",
  parameters: z.object({}),
  execute: async () => {
    const kanbanPath = join(HERMES_DIR, "kanban");
    if (!existsSync(kanbanPath)) {
      return { columns: {}, message: "No kanban board found — run 'hermes kanban init'" };
    }
    const entries = readdirSync(kanbanPath).filter((f) => f.endsWith(".json"));
    const columns: Record<string, unknown[]> = {};
    for (const file of entries) {
      const data = readJSON(join(kanbanPath, file));
      if (data && typeof data === "object" && "column" in (data as any)) {
        const col = (data as any).column as string;
        if (!columns[col]) columns[col] = [];
        columns[col].push({ id: file.replace(".json", ""), ...(data as any) });
      }
    }
    return { columns, cardCount: Object.values(columns).reduce((sum, c) => sum + c.length, 0) };
  },
});

// ─── Agent Status ───────────────────────────────────────────────────────────

export const getAgentStatus = tool({
  description:
    "Get the status of all Hermes agents (CTO, PM, Dev, QA, Security, Ops) — which profiles exist, active cron jobs per agent.",
  parameters: z.object({}),
  execute: async () => {
    const profilesPath = join(HERMES_DIR, "profiles");
    if (!existsSync(profilesPath)) {
      return { agents: [], message: "No profiles found" };
    }

    const profiles = readdirSync(profilesPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const agents = profiles.map((name) => {
      const configPath = join(profilesPath, name, "config.yaml");
      const hasConfig = existsSync(configPath);
      return { name, role: name.toUpperCase(), configured: hasConfig };
    });

    return { agents, count: agents.length };
  },
});

// ─── Cron Schedule ──────────────────────────────────────────────────────────

export const getCronSchedule = tool({
  description:
    "List all active Hermes cron jobs with their schedules, names, and status. Use for the cron overview panel.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const output = execSync("hermes cron list --json 2>/dev/null || echo '[]'", {
        encoding: "utf-8",
        timeout: 5000,
      }).trim();
      const jobs = JSON.parse(output || "[]");
      return { jobs: Array.isArray(jobs) ? jobs : [], count: Array.isArray(jobs) ? jobs.length : 0 };
    } catch {
      return { jobs: [], count: 0, message: "Could not read cron jobs" };
    }
  },
});

// ─── EXO Cluster Topology ───────────────────────────────────────────────────

export const getClusterTopology = tool({
  description:
    "Get the EXO distributed inference cluster topology — connected nodes, their roles, IPs, and status. Use for the cluster topology panel.",
  parameters: z.object({}),
  execute: async () => {
    // Try reading from EXO's peer list if available
    const exoConfigPath = join(HERMES_DIR, "exo-cluster.json");
    const cached = readJSON(exoConfigPath);

    if (cached && typeof cached === "object" && "nodes" in (cached as any)) {
      return cached;
    }

    // Fallback: try EXO CLI
    try {
      const output = execSync("exo peers 2>/dev/null || echo '[]'", {
        encoding: "utf-8",
        timeout: 5000,
      }).trim();
      const peers = JSON.parse(output || "[]");
      return { nodes: peers, count: peers.length, source: "exo-cli" };
    } catch {
      return {
        nodes: [],
        count: 0,
        message: "EXO cluster not running. Start with: exo serve",
        source: "unavailable",
      };
    }
  },
});

// ─── Project Info ───────────────────────────────────────────────────────────

export const getProjectInfo = tool({
  description:
    "Get information about the current project — git repo, branch, recent commits, and AGENTS.md content. Use for project context in the dashboard.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const repo = execSync("gh repo view --json name,owner,url 2>/dev/null || echo '{}'", {
        encoding: "utf-8",
        timeout: 5000,
      }).trim();
      const branch = execSync("git branch --show-current 2>/dev/null || echo 'unknown'", {
        encoding: "utf-8",
        timeout: 5000,
      }).trim();
      const recentCommits = execSync(
        'git log --oneline -5 --format="%h %s" 2>/dev/null || echo ""',
        { encoding: "utf-8", timeout: 5000 },
      ).trim();

      return {
        repo: JSON.parse(repo || "{}"),
        branch,
        recentCommits: recentCommits ? recentCommits.split("\n") : [],
      };
    } catch {
      return { repo: {}, branch: "unknown", recentCommits: [] };
    }
  },
});

export const tools = {
  get_kanban_board: getKanbanBoard,
  get_agent_status: getAgentStatus,
  get_cron_schedule: getCronSchedule,
  get_cluster_topology: getClusterTopology,
  get_project_info: getProjectInfo,
};
