'use client';

import { useMemo, useState } from 'react';

type MetricKey = 'runtimeDelta' | 'instructionDelta' | 'memoryDelta';

type HeatmapRun = {
  id: string;
  label: string;
  commit: string;
  runtimeDelta: number;
  instructionDelta: number;
  memoryDelta: number;
};

type ContractHeatmapRow = {
  contract: string;
  suite: string;
  runs: HeatmapRun[];
};

const METRICS: Array<{
  key: MetricKey;
  label: string;
  unit: string;
  description: string;
}> = [
  {
    key: 'runtimeDelta',
    label: 'Runtime delta',
    unit: '%',
    description: 'Highlights wall-clock runtime change versus the baseline run.',
  },
  {
    key: 'instructionDelta',
    label: 'Instruction delta',
    unit: '%',
    description: 'Shows VM instruction growth that can indicate compute regressions before latency spikes.',
  },
  {
    key: 'memoryDelta',
    label: 'Memory delta',
    unit: '%',
    description: 'Tracks memory pressure changes across repeated contract executions.',
  },
];

const HEATMAP_ROWS: ContractHeatmapRow[] = [
  {
    contract: 'amm-pool',
    suite: 'Swap path benchmarks',
    runs: [
      { id: 'run-1842', label: 'Baseline', commit: 'a81c3d2', runtimeDelta: 0, instructionDelta: 0, memoryDelta: 0 },
      { id: 'run-1848', label: 'Fee math', commit: 'd32f118', runtimeDelta: 12, instructionDelta: 9, memoryDelta: 3 },
      { id: 'run-1851', label: 'Routing', commit: 'c41aa8e', runtimeDelta: 28, instructionDelta: 16, memoryDelta: 5 },
      { id: 'run-1860', label: 'Stabilized', commit: '9e8ff44', runtimeDelta: 7, instructionDelta: 4, memoryDelta: -2 },
    ],
  },
  {
    contract: 'vault',
    suite: 'Rebalance benchmarks',
    runs: [
      { id: 'run-1842', label: 'Baseline', commit: 'a81c3d2', runtimeDelta: 0, instructionDelta: 0, memoryDelta: 0 },
      { id: 'run-1848', label: 'Fee math', commit: 'd32f118', runtimeDelta: -6, instructionDelta: -4, memoryDelta: 2 },
      { id: 'run-1851', label: 'Routing', commit: 'c41aa8e', runtimeDelta: 8, instructionDelta: 11, memoryDelta: 6 },
      { id: 'run-1860', label: 'Stabilized', commit: '9e8ff44', runtimeDelta: 18, instructionDelta: 14, memoryDelta: 10 },
    ],
  },
  {
    contract: 'streaming-payments',
    suite: 'Settlement benchmarks',
    runs: [
      { id: 'run-1842', label: 'Baseline', commit: 'a81c3d2', runtimeDelta: 0, instructionDelta: 0, memoryDelta: 0 },
      { id: 'run-1848', label: 'Fee math', commit: 'd32f118', runtimeDelta: 5, instructionDelta: 3, memoryDelta: 1 },
      { id: 'run-1851', label: 'Routing', commit: 'c41aa8e', runtimeDelta: 21, instructionDelta: 18, memoryDelta: 14 },
      { id: 'run-1860', label: 'Stabilized', commit: '9e8ff44', runtimeDelta: -4, instructionDelta: -8, memoryDelta: -3 },
    ],
  },
  {
    contract: 'governor',
    suite: 'Proposal execution',
    runs: [
      { id: 'run-1842', label: 'Baseline', commit: 'a81c3d2', runtimeDelta: 0, instructionDelta: 0, memoryDelta: 0 },
      { id: 'run-1848', label: 'Fee math', commit: 'd32f118', runtimeDelta: 14, instructionDelta: 10, memoryDelta: 4 },
      { id: 'run-1851', label: 'Routing', commit: 'c41aa8e', runtimeDelta: 31, instructionDelta: 22, memoryDelta: 16 },
      { id: 'run-1860', label: 'Stabilized', commit: '9e8ff44', runtimeDelta: 11, instructionDelta: 5, memoryDelta: 2 },
    ],
  },
];

const LEGEND_ITEMS = [
  { label: 'Strong improvement', range: '-15% or better', className: 'bg-emerald-700 text-white border-emerald-700' },
  { label: 'Improvement', range: '-14% to -1%', className: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  { label: 'Stable', range: '0% to 5%', className: 'bg-amber-100 text-amber-950 border-amber-200' },
  { label: 'Regression', range: '6% to 20%', className: 'bg-orange-200 text-orange-950 border-orange-300' },
  { label: 'Severe regression', range: 'Above 20%', className: 'bg-rose-700 text-white border-rose-700' },
];

const getHeatClassName = (value: number): string => {
  if (value <= -15) return 'bg-emerald-700 text-white border-emerald-700';
  if (value < 0) return 'bg-emerald-100 text-emerald-900 border-emerald-200';
  if (value <= 5) return 'bg-amber-100 text-amber-950 border-amber-200';
  if (value <= 20) return 'bg-orange-200 text-orange-950 border-orange-300';
  return 'bg-rose-700 text-white border-rose-700';
};

const formatDelta = (value: number): string => `${value > 0 ? '+' : ''}${value}%`;

type SelectedCell = {
  rowIndex: number;
  runIndex: number;
};

export default function CreateRunHeatmapPage55() {
  const [metric, setMetric] = useState<MetricKey>('runtimeDelta');
  const [selectedCell, setSelectedCell] = useState<SelectedCell>({ rowIndex: 0, runIndex: 2 });

  const selectedMetric = METRICS.find((item) => item.key === metric) ?? METRICS[0];
  const selectedRow = HEATMAP_ROWS[selectedCell.rowIndex] ?? HEATMAP_ROWS[0];
  const selectedRun = selectedRow.runs[selectedCell.runIndex] ?? selectedRow.runs[0];
  const selectedValue = selectedRun[metric];

  const summary = useMemo(() => {
    const values = HEATMAP_ROWS.flatMap((row) => row.runs.slice(1).map((run) => run[metric]));
    const regressions = values.filter((value) => value > 5).length;
    const severe = values.filter((value) => value > 20).length;
    const improvements = values.filter((value) => value < 0).length;

    return { regressions, severe, improvements };
  }, [metric]);

  return (
    <section
      id="run-heatmap"
      aria-labelledby="run-heatmap-title"
      className="w-full rounded-[2rem] border border-black/[.08] bg-white/95 p-6 shadow-sm dark:border-white/[.145] dark:bg-zinc-950/90 md:p-8"
    >
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-300">
            Run Heatmap
          </p>
          <h2 id="run-heatmap-title" className="text-3xl font-semibold tracking-tight md:text-4xl">
            Runtime regressions across contracts at a glance
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400 md:text-base">
            Inspect how each benchmark run shifts performance across contracts. Hover, focus, or select any cell to compare the exact delta and commit that introduced it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-orange-200 bg-orange-50/80 p-4 text-sm dark:border-orange-900/60 dark:bg-orange-950/20 md:grid-cols-3">
          <div>
            <div className="font-semibold text-orange-950 dark:text-orange-100">{summary.regressions}</div>
            <div className="text-orange-800 dark:text-orange-300">Regressions above +5%</div>
          </div>
          <div>
            <div className="font-semibold text-orange-950 dark:text-orange-100">{summary.severe}</div>
            <div className="text-orange-800 dark:text-orange-300">Severe regressions above +20%</div>
          </div>
          <div>
            <div className="font-semibold text-orange-950 dark:text-orange-100">{summary.improvements}</div>
            <div className="text-orange-800 dark:text-orange-300">Runs that improved</div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3" role="tablist" aria-label="Heatmap metric selector">
        {METRICS.map((item) => {
          const isActive = item.key === metric;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setMetric(item.key)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:border-orange-300 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-orange-800 dark:hover:text-orange-300'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <figure className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <figcaption className="mb-4 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedMetric.label}</span>
            <span>{selectedMetric.description}</span>
          </figcaption>

          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `220px repeat(${HEATMAP_ROWS[0]?.runs.length ?? 0}, minmax(0, 1fr))` }}
              >
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Contract
                </div>
                {HEATMAP_ROWS[0]?.runs.map((run) => (
                  <div key={run.id} className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    <div>{run.label}</div>
                    <div className="mt-1 text-[11px] normal-case tracking-normal text-zinc-400">{run.commit}</div>
                  </div>
                ))}

                {HEATMAP_ROWS.map((row, rowIndex) => (
                  <div
                    key={row.contract}
                    className="contents"
                  >
                    <div
                      className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{row.contract}</div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{row.suite}</div>
                    </div>

                    {row.runs.map((run, runIndex) => {
                      const value = run[metric];
                      const isSelected = selectedCell.rowIndex === rowIndex && selectedCell.runIndex === runIndex;

                      return (
                        <button
                          key={`${row.contract}-${run.id}`}
                          type="button"
                          onClick={() => setSelectedCell({ rowIndex, runIndex })}
                          onMouseEnter={() => setSelectedCell({ rowIndex, runIndex })}
                          onFocus={() => setSelectedCell({ rowIndex, runIndex })}
                          aria-pressed={isSelected}
                          aria-label={`${row.contract} ${run.label} ${selectedMetric.label} ${formatDelta(value)}`}
                          className={`min-h-24 rounded-2xl border px-3 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            getHeatClassName(value)
                          } ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-zinc-950' : ''}`}
                        >
                          <div className="text-xs font-semibold uppercase tracking-[0.15em] opacity-80">{run.id}</div>
                          <div className="mt-4 text-2xl font-semibold">{formatDelta(value)}</div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </figure>

        <aside className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Selected run</p>
            <h3 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{selectedRow.contract}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{selectedRow.suite}</p>
          </div>

          <dl className="space-y-4 text-sm">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <dt className="text-zinc-500 dark:text-zinc-400">Run</dt>
              <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                {selectedRun.label} <span className="text-zinc-500 dark:text-zinc-400">({selectedRun.id})</span>
              </dd>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <dt className="text-zinc-500 dark:text-zinc-400">Commit</dt>
              <dd className="mt-1 font-mono text-zinc-900 dark:text-zinc-100">{selectedRun.commit}</dd>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <dt className="text-zinc-500 dark:text-zinc-400">{selectedMetric.label}</dt>
              <dd className="mt-1 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">{formatDelta(selectedValue)}</dd>
              <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Positive values indicate regressions relative to the baseline. Negative values indicate improvements.
              </p>
            </div>
          </dl>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Legend</h4>
            <ul className="mt-3 space-y-2" aria-label="Heatmap legend">
              {LEGEND_ITEMS.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-4 w-4 rounded-sm border ${item.className}`} aria-hidden="true" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{item.label}</span>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.range}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
