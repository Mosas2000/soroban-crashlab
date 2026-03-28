import React, { useMemo } from "react";
import { FuzzingRun, RunStatus, RunArea, RunSeverity } from "./types";

interface RunClusterVisualizationProps {
  runs?: FuzzingRun[];
}

/**
 * Represents a cluster of runs grouped by a common attribute.
 */
interface RunCluster {
  id: string;
  label: string;
  runs: FuzzingRun[];
  color: string;
  icon: string;
}

/**
 * Status-based cluster configuration.
 */
const STATUS_CONFIG: Record<RunStatus, { color: string; icon: string }> = {
  running: { color: "blue", icon: "●" },
  completed: { color: "green", icon: "✓" },
  failed: { color: "red", icon: "✗" },
  cancelled: { color: "gray", icon: "○" },
};

/**
 * Area-based cluster configuration.
 */
const AREA_CONFIG: Record<RunArea, { color: string; icon: string }> = {
  auth: { color: "purple", icon: "🔐" },
  state: { color: "amber", icon: "📊" },
  budget: { color: "cyan", icon: "💰" },
  xdr: { color: "pink", icon: "📦" },
};

/**
 * Severity-based cluster configuration.
 */
const SEVERITY_CONFIG: Record<RunSeverity, { color: string; icon: string }> = {
  low: { color: "green", icon: "1" },
  medium: { color: "yellow", icon: "2" },
  high: { color: "orange", icon: "3" },
  critical: { color: "red", icon: "4" },
};

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-300 dark:border-blue-700", text: "text-blue-700 dark:text-blue-300" },
  green: { bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-300 dark:border-green-700", text: "text-green-700 dark:text-green-300" },
  red: { bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-300 dark:border-red-700", text: "text-red-700 dark:text-red-300" },
  gray: { bg: "bg-zinc-100 dark:bg-zinc-800/50", border: "border-zinc-300 dark:border-zinc-600", text: "text-zinc-600 dark:text-zinc-300" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-300 dark:border-purple-700", text: "text-purple-700 dark:text-purple-300" },
  amber: { bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-300 dark:border-amber-700", text: "text-amber-700 dark:text-amber-300" },
  cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/30", border: "border-cyan-300 dark:border-cyan-700", text: "text-cyan-700 dark:text-cyan-300" },
  pink: { bg: "bg-pink-100 dark:bg-pink-900/30", border: "border-pink-300 dark:border-pink-700", text: "text-pink-700 dark:text-pink-300" },
  yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-300 dark:border-yellow-700", text: "text-yellow-700 dark:text-yellow-300" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-300 dark:border-orange-700", text: "text-orange-700 dark:text-orange-300" },
};

type ClusterMode = "status" | "area" | "severity";

const RunClusterVisualization: React.FC<RunClusterVisualizationProps> = ({ runs = [] }) => {
  const [clusterMode, setClusterMode] = React.useState<ClusterMode>("status");

  const clusters = useMemo<RunCluster[]>(() => {
    const runsData = runs.length > 0 ? runs : buildMockClusters();

    switch (clusterMode) {
      case "status":
        return buildStatusClusters(runsData);
      case "area":
        return buildAreaClusters(runsData);
      case "severity":
        return buildSeverityClusters(runsData);
      default:
        return [];
    }
  }, [runs, clusterMode]);

  const totalRuns = useMemo(() => runs.length || 25, [runs]);

  if (clusters.length === 0) {
    return (
      <section className="run-cluster-visualization" aria-label="Run cluster visualization">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Run Clusters</h2>
        </div>
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">No cluster data available.</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Start a new campaign to see cluster visualization.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="run-cluster-visualization" aria-label="Run cluster visualization">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Run Clusters</h2>
        <div className="flex gap-2" role="group" aria-label="Cluster grouping mode">
          <ClusterModeButton
            active={clusterMode === "status"}
            onClick={() => setClusterMode("status")}
          >
            By Status
          </ClusterModeButton>
          <ClusterModeButton
            active={clusterMode === "area"}
            onClick={() => setClusterMode("area")}
          >
            By Area
          </ClusterModeButton>
          <ClusterModeButton
            active={clusterMode === "severity"}
            onClick={() => setClusterMode("severity")}
          >
            By Severity
          </ClusterModeButton>
        </div>
      </div>

      {/* Cluster visualization grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {clusters.map((cluster) => (
          <ClusterCard key={cluster.id} cluster={cluster} totalRuns={totalRuns} />
        ))}
      </div>

      {/* Visual cluster bubbles */}
      <div className="relative h-48 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900/50 dark:to-zinc-800/30 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3 p-6">
          {clusters.map((cluster, index) => (
            <ClusterBubble
              key={cluster.id}
              cluster={cluster}
              size={Math.max(48, Math.min(96, cluster.runs.length * 8))}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Button component for cluster mode selection.
 */
const ClusterModeButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700"
    }`}
  >
    {children}
  </button>
);

/**
 * Card component displaying cluster summary.
 */
const ClusterCard: React.FC<{ cluster: RunCluster; totalRuns: number }> = ({ cluster, totalRuns }) => {
  const colors = colorClasses[cluster.color] || colorClasses.gray;
  const percentage = totalRuns > 0 ? Math.round((cluster.runs.length / totalRuns) * 100) : 0;

  return (
    <div
      className={`rounded-xl p-4 border ${colors.bg} ${colors.border} transition hover:shadow-md`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" aria-hidden="true">{cluster.icon}</span>
        <span className={`text-sm font-medium ${colors.text}`}>{cluster.label}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-2xl font-bold ${colors.text}`}>{cluster.runs.length}</p>
        <span className="text-xs opacity-70">{percentage}%</span>
      </div>
    </div>
  );
};

/**
 * Bubble component for visual cluster representation.
 */
const ClusterBubble: React.FC<{
  cluster: RunCluster;
  size: number;
  style?: React.CSSProperties;
}> = ({ cluster, size, style }) => {
  const colors = colorClasses[cluster.color] || colorClasses.gray;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-full ${colors.bg} ${colors.border} border-2 transition-transform hover:scale-110 cursor-pointer`}
      style={{ width: size, height: size, ...style }}
      title={`${cluster.label}: ${cluster.runs.length} runs`}
    >
      <span className={`text-xs font-bold ${colors.text}`}>{cluster.runs.length}</span>
    </div>
  );
};

/**
 * Build clusters grouped by status.
 */
function buildStatusClusters(runs: FuzzingRun[]): RunCluster[] {
  const statuses: RunStatus[] = ["running", "completed", "failed", "cancelled"];

  return statuses.map((status) => {
    const config = STATUS_CONFIG[status];
    return {
      id: `status-${status}`,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      runs: runs.filter((r) => r.status === status),
      color: config.color,
      icon: config.icon,
    };
  }).filter((c) => c.runs.length > 0);
}

/**
 * Build clusters grouped by area.
 */
function buildAreaClusters(runs: FuzzingRun[]): RunCluster[] {
  const areas: RunArea[] = ["auth", "state", "budget", "xdr"];

  return areas.map((area) => {
    const config = AREA_CONFIG[area];
    return {
      id: `area-${area}`,
      label: area.charAt(0).toUpperCase() + area.slice(1),
      runs: runs.filter((r) => r.area === area),
      color: config.color,
      icon: config.icon,
    };
  }).filter((c) => c.runs.length > 0);
}

/**
 * Build clusters grouped by severity.
 */
function buildSeverityClusters(runs: FuzzingRun[]): RunCluster[] {
  const severities: RunSeverity[] = ["low", "medium", "high", "critical"];

  return severities.map((severity) => {
    const config = SEVERITY_CONFIG[severity];
    return {
      id: `severity-${severity}`,
      label: severity.charAt(0).toUpperCase() + severity.slice(1),
      runs: runs.filter((r) => r.severity === severity),
      color: config.color,
      icon: config.icon,
    };
  }).filter((c) => c.runs.length > 0);
}

/**
 * Build mock cluster data when no runs are provided.
 */
function buildMockClusters(): FuzzingRun[] {
  return Array.from({ length: 25 }, (_, i) => ({
    id: `run-${1000 + i}`,
    status: (["running", "completed", "failed", "cancelled"][i % 4]) as RunStatus,
    area: (["auth", "state", "budget", "xdr"][i % 4]) as RunArea,
    severity: (["low", "medium", "high", "critical"][i % 4]) as RunSeverity,
    duration: 120000 + Math.random() * 3600000,
    seedCount: Math.floor(10000 + Math.random() * 90000),
    crashDetail: null,
    cpuInstructions: Math.floor(400000 + Math.random() * 900000),
    memoryBytes: Math.floor(1_500_000 + Math.random() * 8_000_000),
    minResourceFee: Math.floor(500 + Math.random() * 5000),
  }));
}

export default RunClusterVisualization;
