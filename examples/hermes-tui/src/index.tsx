#!/usr/bin/env tsx
/**
 * Hermes Swarm Dashboard — terminal UI for the Hermes agent swarm.
 *
 * Usage:
 *   tsx src/index.tsx
 *
 * Shows live kanban board, agent status, EXO cluster topology,
 * cron schedules, and project context — all AI-generated from
 * live Hermes data.
 */
import { render } from "ink";
import { App } from "./app.js";

render(<App />);
