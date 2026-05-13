import type { Scene } from "./_helpers";
import { agentSwarm } from "./agent-swarm";
import { exoCluster } from "./exo-cluster";
import { projectArchitecture } from "./project-architecture";

export const scenes: Scene[] = [agentSwarm, exoCluster, projectArchitecture];
