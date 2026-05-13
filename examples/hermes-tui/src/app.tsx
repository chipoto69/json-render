import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Box, Text, useInput, useApp, useStdout } from "ink";
import { streamText, stepCountIs } from "ai";
import { gateway } from "@ai-sdk/gateway";
import {
  createMixedStreamParser,
  createStateStore,
  applySpecPatch,
  type Spec,
} from "@json-render/core";
import { JSONUIProvider, Renderer, useFocusDisable } from "@json-render/ink";
import { catalog } from "./catalog.js";
import { tools } from "./tools.js";

const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

// ─── System Prompt ──────────────────────────────────────────────────────────

const HERMES_AGENT_INSTRUCTIONS = `You are the Hermes Agent operations dashboard. You render a living terminal UI showing the state of the autonomous agent swarm — kanban board, agent status, EXO cluster topology, cron schedules, and project context.

WORKFLOW:
1. Call ALL available tools (get_kanban_board, get_agent_status, get_cron_schedule, get_cluster_topology, get_project_info) to gather live data.
2. While tools run, output a single short status line (e.g. "Reading Hermes state..."). This is the ONLY text allowed outside the spec fence.
3. After tools return, output ALL content inside a \`\`\`spec fence. Never write prose outside the fence.

DASHBOARD LAYOUT (always use this structure):
Root Box (column, gap:1) >
  Heading (h1, "Hermes Swarm Dashboard")
  Divider
  ── ROW 1: Top-line metrics ──
  Box (row, gap:2, borderStyle:"single") >
    Card (title:"Kanban") > KeyValue items showing count per column
    Card (title:"Agents") > KeyValue items showing agent count, active count
    Card (title:"Cluster") > KeyValue items showing node count, status
    Card (title:"Cron") > KeyValue items showing job count, next run
  ── ROW 2: Kanban board ──
  Heading (h2, "Kanban Board")
  Table with columns: ID | Title | Status | Priority
  ── ROW 3: Agent status ──
  Heading (h2, "Agent Swarm")
  Box (row, gap:1, flexWrap:"wrap") >
    For each agent: Badge with role name + color based on status
      - CTO: magenta
      - PM: yellow
      - Dev: cyan
      - QA: green
      - Security: red
      - Ops: blue
      If configured: variant:"success", else variant:"default"
  ── ROW 4: Cluster topology ──
  Heading (h2, "EXO Cluster")
  If nodes exist: BarChart showing node names and their status
  If no nodes: StatusLine (type:"warning", "EXO cluster offline — start with `exo serve`")
  ── ROW 5: Cron schedule ──
  Heading (h2, "Cron Schedule")
  Table with columns: Name | Schedule | Status
  ── ROW 6: Project context ──
  Heading (h2, "Project")
  KeyValue pairs: Repo, Branch, Recent commits
  ── FOOTER ──
  Divider
  StatusLine (type:"info", "Press r to refresh | q to quit")

DESIGN RULES:
- HIERARCHY: Every dashboard section gets an h2 Heading and a horizontal Divider before it.
- METRICS FIRST: The top row shows 4 Card components in a horizontal Box with borderStyle:"single". Each Card has a short title and 2-3 KeyValue pairs with the most important numbers.
- COLOR STRATEGY: cyan for labels/headers, green for healthy/active, red for errors/offline, yellow for warnings, magenta for CTO/primary. Use dimColor for secondary text.
- TABLES: Always set explicit column widths (IDs: 8, Title: 30, Status: 12, Priority: 10). Use borderStyle:"single".
- CHARTS: Use BarChart with showValues:true for comparing node metrics. Use distinct colors (cyan, green, yellow, magenta, blue, red).
- NO EMOJIS: Never use emojis anywhere — not in text, labels, headings, or component props. Plain text only.
- STATUS MAPPING: "running"/"active"/"healthy" → green. "offline"/"error"/"dead" → red. "starting"/"pending" → yellow. "unknown" → gray.
- BADGES: Use variant:"success" for active/online agents, variant:"warning" for pending, variant:"error" for offline, variant:"default" for unconfigured.
- WIDTH: Target 80 columns. Set explicit widths on Tables. Use wrap:"truncate-end" for long text.
- COMPACTNESS: Keep the dashboard scannable. No empty Cards. No redundant data. One visualization per data point.

${catalog.prompt({
  mode: "inline",
  customRules: [
    "ALL content MUST go inside a ```spec fence. No prose outside the fence except the initial tool-status line.",
    "Call ALL tools first, then render the complete dashboard in a single spec.",
    "Use the DASHBOARD LAYOUT structure described above — do not deviate from it.",
    "Never use emojis. Plain text only.",
    "Map agent status to Badge variants: configured→success, unconfigured→default.",
  ],
})}`;

// ─── Small UI Helpers ───────────────────────────────────────────────────────

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function AnimatedSpinner({ label, color = "cyan" }: { label: string; color?: string }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setFrame((prev) => (prev + 1) % SPINNER_FRAMES.length), 80);
    return () => clearInterval(timer);
  }, []);
  return (
    <Box gap={1}>
      <Text color={color}>{SPINNER_FRAMES[frame]}</Text>
      <Text dimColor>{label}</Text>
    </Box>
  );
}

function DisableFocus() {
  useFocusDisable(true);
  return null;
}

function RenderedMarkdown({ text }: { text: string }) {
  const spec: Spec = useMemo(
    () => ({
      root: "md",
      elements: { md: { type: "Markdown", props: { text }, children: [] } },
    }),
    [text],
  );
  return (
    <JSONUIProvider initialState={{}}>
      <DisableFocus />
      <Renderer spec={spec} />
    </JSONUIProvider>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────

export function App() {
  const { exit } = useApp();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState("");
  const [dashboardSpec, setDashboardSpec] = useState<Spec | null>(null);
  const [conversationText, setConversationText] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const hasRenderedRef = useRef(false);

  const loadDashboard = useCallback(async () => {
    abortRef.current?.abort();
    setIsStreaming(true);
    setStreamingStatus("Reading Hermes state...");
    setConversationText("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = streamText({
        model: gateway(process.env.AI_GATEWAY_MODEL || DEFAULT_MODEL),
        system: HERMES_AGENT_INSTRUCTIONS,
        messages: [
          {
            role: "user",
            content: "Show me the complete Hermes Swarm Dashboard with all live data.",
          },
        ],
        temperature: 0.3,
        abortSignal: controller.signal,
        tools,
        stopWhen: stepCountIs(2),
      });

      let text = "";
      let spec: Spec = { root: "", elements: {} };
      let hasSpec = false;

      const parser = createMixedStreamParser({
        onText: (chunk) => {
          text += chunk + "\n";
          setConversationText(text);
        },
        onPatch: (patch) => {
          hasSpec = true;
          spec = applySpecPatch(structuredClone(spec), patch);
          setDashboardSpec(structuredClone(spec));
        },
      });

      for await (const part of result.fullStream) {
        if (part.type === "tool-call") {
          const name = part.toolName.replace(/_/g, " ");
          setStreamingStatus(`Using ${name}...`);
        } else if (part.type === "tool-result") {
          setStreamingStatus("Rendering dashboard...");
        } else if (part.type === "text-delta") {
          parser.push(part.text);
        }
      }

      parser.flush();
      hasRenderedRef.current = true;
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setConversationText(`Error: ${err.message}`);
    } finally {
      setIsStreaming(false);
      setStreamingStatus("");
    }
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (!hasRenderedRef.current) {
      loadDashboard();
    }
  }, [loadDashboard]);

  // Keyboard controls
  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      abortRef.current?.abort();
      exit();
    }
    if (input === "r" && !isStreaming) {
      setDashboardSpec(null);
      loadDashboard();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="magenta">
          Hermes Swarm Dashboard
        </Text>
        <Text dimColor> — chipoto69/json-render</Text>
      </Box>

      {/* Loading state */}
      {isStreaming && (
        <Box marginBottom={1}>
          <AnimatedSpinner label={streamingStatus || "Loading..."} />
        </Box>
      )}

      {/* Text content (tool status lines, errors) */}
      {conversationText && !dashboardSpec && (
        <RenderedMarkdown text={conversationText} />
      )}

      {/* Dashboard spec */}
      {dashboardSpec && (
        <JSONUIProvider initialState={dashboardSpec.state ?? {}}>
          <DisableFocus />
          <Renderer spec={dashboardSpec} />
        </JSONUIProvider>
      )}

      {/* Footer controls */}
      {!isStreaming && hasRenderedRef.current && (
        <Box marginTop={1} flexDirection="column">
          <Box>
            <Text dimColor>Press </Text>
            <Text bold>r</Text>
            <Text dimColor> to refresh | </Text>
            <Text bold>q</Text>
            <Text dimColor> to quit</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
