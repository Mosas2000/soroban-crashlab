import * as assert from 'node:assert/strict';
import { FuzzingRun, RunStatus, RunArea, RunSeverity } from "./types";
import { buildFailureClusters as buildFailureSignatures } from "./failureClusters";

interface RunCluster {
  id: string;
  label: string;
  runs: FuzzingRun[];
  color: string;
  icon: string;
  avgDuration?: number;
  avgCpuInstructions?: number;
  avgMemoryBytes?: number;
  failureRate?: number;
}

const SEVERITY_CONFIG: Record<RunSeverity, { color: string; icon: string }> = {
  low: { color: "green", icon: "1" },
  medium: { color: "yellow", icon: "2" },
  high: { color: "orange", icon: "3" },
  critical: { color: "red", icon: "4" },
};

function buildFailureSignatureClusters(runs: FuzzingRun[]): RunCluster[] {
  const failureClusters = buildFailureSignatures(runs);

  return failureClusters.map((fc) => ({
    id: fc.id,
    label: fc.failureCategory,
    runs: runs.filter((r) => fc.relatedRunIds.includes(r.id)),
    color: SEVERITY_CONFIG[fc.severity].color,
    icon: SEVERITY_CONFIG[fc.severity].icon,
    avgDuration: 0,
    avgCpuInstructions: 0,
    avgMemoryBytes: 0,
    failureRate: 100,
  })).map(cluster => {
    if (cluster.runs.length === 0) return cluster;
    
    return {
      ...cluster,
      avgDuration: cluster.runs.reduce((sum, r) => sum + r.duration, 0) / cluster.runs.length,
      avgCpuInstructions: cluster.runs.reduce((sum, r) => sum + r.cpuInstructions, 0) / cluster.runs.length,
      avgMemoryBytes: cluster.runs.reduce((sum, r) => sum + r.memoryBytes, 0) / cluster.runs.length,
    };
  });
}

function makeRun(overrides: Partial<FuzzingRun>): FuzzingRun {
  return {
    id: "test-id",
    status: "completed",
    area: "auth",
    severity: "low",
    duration: 1000,
    seedCount: 10,
    crashDetail: null,
    cpuInstructions: 100,
    memoryBytes: 1024,
    minResourceFee: 0,
    ...overrides,
  };
}

function testBuildFailureSignatureClusters() {
  // Test empty array
  assert.deepEqual(buildFailureSignatureClusters([]), []);

  // Test no failed runs
  const runs1 = [makeRun({ status: "completed" }), makeRun({ status: "running" })];
  assert.deepEqual(buildFailureSignatureClusters(runs1), []);

  // Test grouping by signature
  const runs2 = [
    makeRun({ 
      id: "run-1", 
      status: "failed", 
      area: "auth", 
      severity: "critical",
      crashDetail: { 
        signature: "sig1", 
        failureCategory: "Panic", 
        payload: "{}", 
        replayAction: "" 
      } 
    }),
    makeRun({ 
      id: "run-2", 
      status: "failed", 
      area: "auth", 
      severity: "critical",
      crashDetail: { 
        signature: "sig1", 
        failureCategory: "Panic", 
        payload: "{}", 
        replayAction: "" 
      } 
    }),
    makeRun({ 
      id: "run-3", 
      status: "failed", 
      area: "state", 
      severity: "high",
      crashDetail: { 
        signature: "sig2", 
        failureCategory: "Invariant", 
        payload: "{}", 
        replayAction: "" 
      } 
    }),
  ];

  const clusters = buildFailureSignatureClusters(runs2);
  assert.equal(clusters.length, 2);
  
  const panicCluster = clusters.find(c => c.label === "Panic");
  assert.ok(panicCluster);
  assert.equal(panicCluster?.runs.length, 2);
  assert.equal(panicCluster?.color, "red");
  assert.equal(panicCluster?.icon, "4");

  const invariantCluster = clusters.find(c => c.label === "Invariant");
  assert.ok(invariantCluster);
  assert.equal(invariantCluster?.runs.length, 1);
  assert.equal(invariantCluster?.color, "orange");
  assert.equal(invariantCluster?.icon, "3");

  // Test metrics computation
  const runs3 = [
    makeRun({ 
      id: "run-1", 
      status: "failed", 
      duration: 1000,
      cpuInstructions: 100,
      memoryBytes: 1000,
      crashDetail: { signature: "sig1", failureCategory: "Panic", payload: "{}", replayAction: "" } 
    }),
    makeRun({ 
      id: "run-2", 
      status: "failed", 
      duration: 2000,
      cpuInstructions: 200,
      memoryBytes: 2000,
      crashDetail: { signature: "sig1", failureCategory: "Panic", payload: "{}", replayAction: "" } 
    }),
  ];

  const clustersMetrics = buildFailureSignatureClusters(runs3);
  assert.equal(clustersMetrics.length, 1);
  assert.equal(clustersMetrics[0].avgDuration, 1500);
  assert.equal(clustersMetrics[0].avgCpuInstructions, 150);
  assert.equal(clustersMetrics[0].avgMemoryBytes, 1500);

  console.log('testBuildFailureSignatureClusters: all assertions passed');
}

testBuildFailureSignatureClusters();
